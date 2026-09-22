import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TacticalKPICardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'gold' | 'warning' | 'emerald' | 'default';
  };
  accentColor?: 'gold' | 'emerald' | 'red' | 'default';
}

export function TacticalKPICard({
  title,
  value,
  subvalue,
  subtitle,
  icon: Icon,
  badge,
  accentColor = 'default',
}: TacticalKPICardProps) {
  const accentStyles = {
    default: {
      iconBg: 'bg-slate-100 text-slate-700',
      pill: 'bg-slate-100 text-slate-700',
    },
    gold: {
      iconBg: 'bg-amber-50 text-[#B89047] border border-amber-200/60',
      pill: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      pill: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    red: {
      iconBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
      pill: 'bg-rose-50 text-rose-900 border-rose-200',
    },
  };

  const badgeVariantsMap: Record<string, any> = {
    default: 'secondary',
    gold: 'gold',
    warning: 'fav',
    emerald: 'sigFav',
  };

  const style = accentStyles[accentColor] || accentStyles.default;

  return (
    <div className="bg-[rgba(24,34,21,0.72)] backdrop-blur-xl border border-white/[0.08] hover:border-[#D4AF37]/35 rounded-2xl p-5 flex flex-col justify-between min-h-[145px] relative overflow-hidden group shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200">
      {/* Top Row: Title + Icon / Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-[#C5D4BD] tracking-normal block">
            {title}
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[rgba(32,46,28,0.85)] border border-[#758652]/30 text-[#D4AF37] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs">
          <Icon className="w-4 h-4 text-[#D4AF37]" />
        </div>
      </div>

      {/* Metric Value */}
      <div className="my-2 flex items-baseline gap-2">
        <span className="font-data-mono text-3xl font-bold tracking-tight text-[#D4AF37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {value}
        </span>
        {subvalue && (
          <span className="text-xs font-mono text-[#9EAF94] font-medium">
            {subvalue}
          </span>
        )}
        {badge && (
          <Badge variant={badgeVariantsMap[badge.variant] || 'secondary'} className="ml-auto text-[10px] bg-[#13281B] text-[#D4AF37] border-[#D4AF37]/40">
            {badge.text}
          </Badge>
        )}
      </div>

      {/* Bottom Subtitle / Context Note */}
      <div className="pt-2 border-t border-[#758652]/20 flex items-center justify-between text-xs text-[#9EAF94]">
        <span className="leading-snug">{subtitle}</span>
      </div>
    </div>
  );
}
