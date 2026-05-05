import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
// lucataco/sdxl-lcm-loras — fast 4-second inference via LCM LoRA
const MODEL_VERSION = "lucataco/sdxl-lcm-loras:48bdebc9f383f0e9f9e321e40c1ec7f08ac7b4dd49cf777646a6498c94605051";

interface GenerateRequest {
  prompt: string;
  style: string;
  duration: string;
}

async function pollPrediction(predictionId: string): Promise<string> {
  const maxAttempts = 40;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const prediction = await res.json();

    if (prediction.status === "succeeded") {
      const output = prediction.output;
      if (Array.isArray(output) && output.length > 0) {
        const first = output[0];
        return typeof first === "string" ? first : (first?.url?.() ?? String(first));
      }
      if (typeof output === "string") return output;
      throw new Error("No output from model");
    }
    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(`Prediction ${prediction.status}: ${prediction.error ?? "unknown error"}`);
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new Error("Prediction timed out after 100 seconds");
}

async function generateSceneImage(scenePrompt: string): Promise<string> {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "48bdebc9f383f0e9f9e321e40c1ec7f08ac7b4dd49cf777646a6498c94605051",
      input: {
        prompt: scenePrompt,
        num_inference_steps: 8,
        guidance_scale: 2,
        width: 768,
        height: 432,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Replicate API error ${res.status}: ${JSON.stringify(err)}`);
  }

  const prediction = await res.json();
  return pollPrediction(prediction.id);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "REPLICATE_API_TOKEN is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, style, duration } = (await req.json()) as GenerateRequest;

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const styleMap: Record<string, string> = {
      "सिनेमैटिक": "cinematic, dramatic lighting, film still, 8k ultra detailed",
      "एनिमेटेड": "animated, vibrant, cartoon style, studio ghibli colorful",
      "रियलिस्टिक": "photorealistic, ultra detailed, natural lighting, 8k",
      "फैंटेसी": "fantasy art, magical, ethereal glow, epic landscape",
    };

    const styleModifier = styleMap[style] ?? "cinematic, dramatic lighting, 8k";
    const durationNum = parseInt(duration) || 30;
    const sceneCount = durationNum <= 15 ? 2 : durationNum <= 30 ? 3 : 4;

    const sceneDescriptions = [
      `Opening wide shot: ${prompt}, ${styleModifier}, establishing scene`,
      `Main action sequence: ${prompt}, ${styleModifier}, dynamic composition close-up`,
      `Emotional close-up: ${prompt}, ${styleModifier}, intimate portrait framing`,
      `Epic finale: ${prompt}, ${styleModifier}, dramatic climax wide angle`,
    ].slice(0, sceneCount);

    // Generate all scene images in parallel for speed
    const imageUrls = await Promise.all(
      sceneDescriptions.map((desc) => generateSceneImage(desc))
    );

    const scenes = sceneDescriptions.map((desc, i) => ({
      index: i + 1,
      description: desc.split(":")[0].trim(),
      imageUrl: imageUrls[i],
    }));

    return new Response(
      JSON.stringify({ scenes }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
