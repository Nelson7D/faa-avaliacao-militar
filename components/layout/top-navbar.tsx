'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Radio,
  ChevronDown,
  Activity,
  User,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/auth-context';

export function TopNavbar() {
  const [timeString, setTimeString] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('pt-AO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'FA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between shadow-subtle">
      {/* Left: System Identification & Operational Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/60">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[11px] font-semibold text-slate-700 tracking-wide">
            SISTEMA OPERACIONAL DAS FAA
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden md:block" />

        {/* Luanda Military Clock */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#B89047]" />
          <span className="font-semibold text-slate-900 tracking-tight">{timeString || '19:30:00'}</span>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-medium">WAT (Luanda)</span>
        </div>
      </div>

      {/* Right: Readiness, Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Tactical Readiness Badge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-medium cursor-pointer hover:bg-emerald-100/80 transition-colors shadow-2xs">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span className="font-semibold text-[11px]">Prontidão 100%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white border-slate-800 text-xs py-1.5 px-3 rounded-lg shadow-lg">
              <span>Cálculo regimental, auditoria e base de dados sincronizados</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications Icon with Badge */}
        <button
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          title="Notificações e Prazos"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B89047] ring-2 ring-white" />
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Officer Profile Badge */}
        <div className="flex items-center gap-3 pl-1 select-none">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F3323] to-[#1E523A] text-[#D4AF37] flex items-center justify-center font-bold text-xs font-mono border border-primary/20 shadow-xs">
            {profile ? getInitials(profile.nomeCompleto) : 'MP'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {profile ? `${profile.posto} ${profile.nomeGuerra}` : 'Ten-Cel. M. Pascoal'}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight font-mono mt-0.5">
              NIP {profile ? profile.nip : '10048291'} • {profile ? profile.role : 'DPQ'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
