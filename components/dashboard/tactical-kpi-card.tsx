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
    <div className="executive-card rounded-xl p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
      {/* Top Row: Title + Icon / Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-slate-500 tracking-normal block">
            {title}
          </span>
        </div>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105', style.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Metric Value */}
      <div className="my-2 flex items-baseline gap-2">
        <span className="font-data-mono text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {subvalue && (
          <span className="text-xs font-mono text-slate-500 font-medium">
            {subvalue}
          </span>
        )}
        {badge && (
          <Badge variant={badgeVariantsMap[badge.variant] || 'secondary'} className="ml-auto text-[10px]">
            {badge.text}
          </Badge>
        )}
      </div>

      {/* Bottom Subtitle / Context Note */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="leading-snug">{subtitle}</span>
      </div>
    </div>
  );
}
