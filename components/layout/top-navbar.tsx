'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Radio,
  Shield,
  Menu,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth, UserProfile } from '@/context/auth-context';

interface TopNavbarProps {
  onOpenMobileMenu?: () => void;
}

export function TopNavbar({ onOpenMobileMenu }: TopNavbarProps) {
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

  const getRoleBadge = (role: UserProfile['role']) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'ADMIN', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'DPQ':
        return { label: 'DPQ / HOMOLOGAÇÃO', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'CMDTE':
        return { label: 'COMANDANTE U/E/O', color: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'AVALIADOR_1':
        return { label: '1º AVALIADOR', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'AVALIADOR_2':
        return { label: '2º AVALIADOR', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'MILITAR_AVALIADO':
        return { label: 'MILITAR AVALIADO', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const activeRoleBadge = profile ? getRoleBadge(profile.role) : null;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between">
      {/* Left: Hamburger (Mobile) & Clock */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100/70 px-3 py-1.5 rounded-lg border border-slate-200/70">
          <Clock className="w-3.5 h-3.5 text-[#B89047]" />
          <span className="font-semibold text-slate-900 tracking-tight">{timeString || '12:00:00'}</span>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-medium">WAT (Luanda)</span>
        </div>
      </div>

      {/* Right: Officer Profile */}
      <div className="flex items-center gap-3">

        {/* Officer Profile Badge */}
        {profile ? (
          <div className="flex items-center gap-2.5 pl-1 select-none">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0F3323] to-[#1E523A] text-[#D4AF37] flex items-center justify-center font-bold text-xs font-mono border border-primary/20 shadow-xs">
              {getInitials(profile.nomeCompleto)}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {profile.posto} {profile.nomeGuerra}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight font-mono mt-0.5">
                NIP {profile.nip} • {profile.role}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-1 select-none">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-mono text-slate-500">
              --
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs text-slate-500">Não autenticado</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
