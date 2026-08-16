'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  FolderLock,
  Scale,
  Brain,
  Shield,
  LogOut,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export interface NavItemDef {
  label: string;
  sublabel: string;
  href: string;
  icon: any;
  roles?: Array<'ADMIN' | 'DPQ' | 'CMDTE' | 'AVALIADOR_1' | 'AVALIADOR_2' | 'MILITAR_AVALIADO'>;
}

export const NAV_ITEMS: NavItemDef[] = [
  {
    label: 'Dashboard',
    sublabel: 'Prontidão e KPIs',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Minha FAI',
    sublabel: 'Tomada de Conhecimento',
    href: '/minha-fai',
    icon: Award,
    roles: ['MILITAR_AVALIADO'],
  },
  {
    label: 'FAI Digital',
    sublabel: 'Avaliar Subordinados',
    href: '/fai/nova',
    icon: FileText,
    roles: ['ADMIN', 'DPQ', 'CMDTE', 'AVALIADOR_1', 'AVALIADOR_2'],
  },
  {
    label: 'Workflow',
    sublabel: 'Tramitação Regimental (30d)',
    href: '/workflow',
    icon: GitBranch,
    roles: ['ADMIN', 'DPQ', 'CMDTE', 'AVALIADOR_1', 'AVALIADOR_2'],
  },
  {
    label: 'Processos Individuais',
    sublabel: 'Dossiês & Folha Matrícula',
    href: '/militares',
    icon: FolderLock,
    roles: ['ADMIN', 'DPQ', 'CMDTE', 'AVALIADOR_1', 'AVALIADOR_2'],
  },
  {
    label: 'Meu Dossiê',
    sublabel: 'Folha de Matrícula',
    href: '/militares/40020792',
    icon: FolderLock,
    roles: ['MILITAR_AVALIADO'],
  },
  {
    label: 'Impugnações',
    sublabel: 'Reclamações & Recursos (15d)',
    href: '/impugnacoes',
    icon: Scale,
  },
  {
    label: 'IA Analysis',
    sublabel: 'Pareceres & Predição',
    href: '/ia-analytics',
    icon: Brain,
    roles: ['ADMIN', 'DPQ', 'CMDTE', 'AVALIADOR_1', 'AVALIADOR_2'],
  },
  {
    label: 'Administração',
    sublabel: 'Segurança, Usuários & RLS',
    href: '/admin',
    icon: ShieldCheck,
    roles: ['ADMIN', 'DPQ'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const currentRole = profile?.role || 'MILITAR_AVALIADO';

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentRole);
  }).map((item) => {
    if (item.label === 'Meu Dossiê') {
      return {
        ...item,
        href: profile?.nip ? `/militares/${profile.nip}` : '/militares',
      };
    }
    return item;
  });

  const getMonogram = (name: string) => {
    if (!name) return 'TC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-sidebar-width h-screen fixed left-0 top-0 bg-[#0B1612] text-slate-200 border-r border-[#1B2F26] flex flex-col py-5 px-3.5 z-50 select-none shadow-2xl">
      {/* Brand Header */}
      <div className="px-2 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C89D46] to-[#8C6B26] p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-[#0B1612] rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-sm tracking-wide text-white font-sans">SISTEMA FAA</h1>
            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] rounded border border-[#D4AF37]/30">
              v2.5
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
            Comando de Pessoal
          </p>
        </div>
      </div>

      <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/90 font-mono">
        Menu Operacional
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-0.5">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/fai/nova' && pathname.startsWith('/fai/')) ||
            (item.href.startsWith('/militares') && pathname.startsWith('/militares/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-xs font-medium',
                isActive
                  ? 'bg-white/[0.09] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#D4AF37] rounded-r-full shadow-glow-gold" />
              )}
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors duration-150',
                  isActive ? 'text-[#D4AF37]' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              <div className="truncate flex-1 min-w-0">
                <div className="leading-tight truncate">{item.label}</div>
                <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                  {item.sublabel}
                </div>
              </div>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-slate-400 opacity-60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Military Footer Profile & Quick Links */}
      <div className="mt-auto pt-4 border-t border-[#1B2F26] px-1 space-y-3">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-all">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#163826] to-[#255239] text-[#D4AF37] flex items-center justify-center text-xs font-bold font-mono border border-[#D4AF37]/30 shadow-xs shrink-0">
            {profile ? getMonogram(profile.nomeGuerra || profile.nomeCompleto) : 'TC'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-100 truncate">
              {profile ? `${profile.posto} ${profile.nomeGuerra}` : 'Ten-Cel. M. Pascoal'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {profile ? profile.funcaoDesempenhada || profile.role : 'Chefe Órgão Pessoal'}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-slate-400 text-[11px] px-1 pt-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Manual FAI
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
