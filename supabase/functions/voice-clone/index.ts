import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const ELEVENLABS_URL = "https://api.elevenlabs.io/v1";

interface VoiceCloneRequest {
  text: string;
  voiceId: string;
  name?: string;
  description?: string;
}

interface CreateVoiceRequest {
  audioFile: Uint8Array;
  fileName: string;
  name: string;
  description?: string;
}

interface TextToSpeechRequest {
  text: string;
  voiceId: string;
}

// Create a cloned voice from uploaded audio file
async function createClonedVoice(req: CreateVoiceRequest): Promise<string> {
  const formData = new FormData();
  formData.append("name", req.name);
  formData.append("description", req.description || "AI cloned voice");
  formData.append("files", new Blob([req.audioFile], { type: "audio/mpeg" }), req.fileName);

  const res = await fetch(`${ELEVENLABS_URL}/voices/add`, {
    method: "POST",
    headers: {
      xi_api_key: ELEVENLABS_API_KEY || "",
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to create voice: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.voice_id;
}

// Generate speech using cloned voice
async function generateSpeech(text: string, voiceId: string): Promise<Uint8Array> {
  const res = await fetch(`${ELEVENLABS_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5, // High stability for consistent quality
        similarity_boost: 0.75, // High similarity boost for natural voice matching
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`TTS generation failed: ${JSON.stringify(err)}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}

// Delete a cloned voice
async function deleteVoice(voiceId: string): Promise<void> {
  const res = await fetch(`${ELEVENLABS_URL}/voices/${voiceId}`, {
    method: "DELETE",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY || "",
    },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete voice: ${res.status}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST" && action === "create-voice") {
      const formData = await req.formData();
      const audioFile = formData.get("audio");
      const name = formData.get("name") as string;
      const description = formData.get("description") as string | null;

      if (!audioFile || !(audioFile instanceof File)) {
        return new Response(
          JSON.stringify({ error: "Audio file is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!name?.trim()) {
        return new Response(
          JSON.stringify({ error: "Voice name is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const audioBuffer = await audioFile.arrayBuffer();
      const voiceId = await createClonedVoice({
        audioFile: new Uint8Array(audioBuffer),
        fileName: audioFile.name,
        name,
        description: description || undefined,
      });

      return new Response(
        JSON.stringify({ voiceId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && action === "generate-speech") {
      const { text, voiceId } = (await req.json()) as TextToSpeechRequest;

      if (!text?.trim()) {
        return new Response(
          JSON.stringify({ error: "Text is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!voiceId?.trim()) {
        return new Response(
          JSON.stringify({ error: "Voice ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const audioData = await generateSpeech(text, voiceId);
      const base64Audio = btoa(String.fromCharCode(...audioData));

      return new Response(
        JSON.stringify({ audio: `data:audio/mpeg;base64,${base64Audio}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE" && action === "delete-voice") {
      const { voiceId } = (await req.json()) as { voiceId: string };

      if (!voiceId?.trim()) {
        return new Response(
          JSON.stringify({ error: "Voice ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await deleteVoice(voiceId);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
