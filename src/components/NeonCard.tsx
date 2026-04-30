import { ReactNode } from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface NeonCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

export default function NeonCard({ title, subtitle, icon: Icon, iconColor = '#ff2d78', children, className = '' }: NeonCardProps) {
  return (
    <div className={`neon-card rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${iconColor}22, ${iconColor}44)`,
            border: `1px solid ${iconColor}44`,
            boxShadow: `0 0 15px ${iconColor}33`,
          }}
        >
          <Icon size={22} style={{ color: iconColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
