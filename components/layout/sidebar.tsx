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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { ManualAjudaModal } from '@/components/fai/manual-ajuda-modal';

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
    roles: ['ADMIN', 'DPQ', 'CMDTE', 'AVALIADOR_1', 'AVALIADOR_2'],
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
    href: '/militares',
    icon: FolderLock,
    roles: ['MILITAR_AVALIADO'],
  },
  {
    label: 'Impugnações',
    sublabel: 'Reclamações & Recursos (15d)',
    href: '/impugnacoes',
    icon: Scale,
    roles: ['ADMIN', 'DPQ', 'CMDTE'],
  },
  {
    label: 'Análise IA',
    sublabel: 'Pareceres & Predição',
    href: '/ia-analytics',
    icon: Brain,
    roles: ['ADMIN', 'DPQ', 'CMDTE'],
  },
  {
    label: 'Administração',
    sublabel: 'Segurança, Usuários & RLS',
    href: '/admin',
    icon: ShieldCheck,
    roles: ['ADMIN', 'DPQ'],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [showHelpModal, setShowHelpModal] = React.useState(false);

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
    if (item.label === 'Processos Individuais' && currentRole === 'AVALIADOR_1') {
      return {
        ...item,
        label: 'Meus Subordinados',
        sublabel: 'Efetivo para Avaliação',
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
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in transition-opacity"
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "w-sidebar-width h-screen fixed left-0 top-0 bg-[rgba(13,19,12,0.92)] backdrop-blur-2xl text-slate-200 border-r border-[#758652]/25 flex flex-col py-5 px-3 z-50 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="px-2 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E2E1B] to-[#0A1208] border border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.25)] flex items-center justify-center p-0.5">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-sm tracking-wider text-slate-100 uppercase font-sans">
                  SISTEMA FAA
                </h1>
              </div>
              <p className="text-[10px] text-[#D4AF37] font-semibold tracking-widest uppercase mt-0.5 font-mono">
                COMANDO DE PESSOAL
              </p>
            </div>
          </div>

          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#7C8D74] font-mono">
          MENU OPERACIONAL
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-0.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const cleanCurrent = (pathname || '').replace(/\/$/, '') || '/';
            const cleanTarget = item.href.replace(/\/$/, '') || '/';
            const isActive =
              cleanCurrent === cleanTarget ||
              (item.href === '/fai/nova' && cleanCurrent.startsWith('/fai')) ||
              (item.href.startsWith('/militares') && cleanCurrent.startsWith('/militares'));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-medium',
                  isActive
                    ? 'bg-[rgba(32,46,28,0.85)] text-white shadow-md border-l-3 border-l-[#D4AF37] border-y border-r border-[#758652]/30 font-semibold'
                    : 'text-[#9EAF94] hover:text-slate-100 hover:bg-white/[0.04]'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors duration-150',
                    isActive ? 'text-[#D4AF37]' : 'text-[#84957D] group-hover:text-slate-200'
                  )}
                />
                <div className="truncate flex-1 min-w-0">
                  <div className="leading-tight truncate text-slate-100">{item.label}</div>
                  <div className={cn(
                    'text-[10px] font-normal truncate mt-0.5',
                    isActive ? 'text-[#C5D4BD]' : 'text-[#6C7D63]'
                  )}>
                    {item.sublabel}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Military Footer Profile & Quick Links */}
        <div className="mt-auto pt-4 border-t border-[#758652]/20 px-1 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[rgba(20,29,18,0.7)] border border-[#758652]/30 hover:bg-[rgba(26,38,24,0.8)] transition-all">
            <div className="w-9 h-9 rounded-full bg-[#183624] text-emerald-400 flex items-center justify-center text-xs font-bold font-mono border border-emerald-500/40 shadow-xs shrink-0">
              {profile ? getMonogram(profile.nomeGuerra || profile.nomeCompleto) : 'TC'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 truncate">
                {profile ? `${profile.posto} ${profile.nomeGuerra}` : 'Tenente-Coronel'}
              </p>
              <p className="text-[10px] text-[#9EAF94] truncate">
                {profile ? profile.funcaoDesempenhada || profile.role : 'Comando'}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[#84957D] text-[11px] px-1 pt-1">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Manual FAI
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" /> Sair
            </button>
          </div>
        </div>

        <ManualAjudaModal open={showHelpModal} onOpenChange={setShowHelpModal} />
      </aside>
    </>
  );
}
