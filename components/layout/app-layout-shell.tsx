'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Award, ArrowRight, Lock } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

import { TacticalBackground } from '@/components/ui/tactical-background';

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const cleanPath = (pathname || '').replace(/\/$/, '') || '/';
  const isAuthPage = cleanPath === '/login' || cleanPath === '/cadastro';

  // Role Protection Checks
  const isMilitarAvaliado = profile?.role === 'MILITAR_AVALIADO';
  const isAllowedForAvaliado =
    cleanPath === '/minha-fai' ||
    (profile?.nip ? cleanPath === `/militares/${profile.nip}` : false);

  const isBlockedForAvaliado = isMilitarAvaliado && !isAllowedForAvaliado;

  // Rotas vedadas ao 1º Avaliador (privativas de DPQ/Admin/Comando)
  const isBlockedForAvaliador1 =
    profile?.role === 'AVALIADOR_1' &&
    (cleanPath === '/admin' ||
      cleanPath === '/cadastro' ||
      cleanPath === '/impugnacoes' ||
      cleanPath === '/ia-analytics');

  useEffect(() => {
    if (!loading && !profile && !isAuthPage) {
      router.push('/login');
    }
  }, [loading, profile, isAuthPage, router]);

  useEffect(() => {
    if (!loading && profile && isMilitarAvaliado) {
      if (cleanPath === '/' || cleanPath === '/dashboard') {
        router.push('/minha-fai');
      }
    }
  }, [loading, profile, isMilitarAvaliado, cleanPath, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B06] flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#9EAF94]">A validar credenciais militares...</p>
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen relative text-slate-100 flex overflow-x-hidden">
      {/* Background Animated Tactical Loop (Holographic Sphere + Radar Grid) */}
      <TacticalBackground variant="app" />

      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 md:ml-sidebar-width ml-0 flex flex-col min-h-screen transition-all">
        <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full">
          {isBlockedForAvaliado ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-[rgba(24,34,21,0.85)] backdrop-blur-xl border border-[#D4AF37]/40 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] text-center space-y-4 animate-in fade-in">
              <div className="inline-flex p-3 bg-[#13281B] rounded-full border border-[#D4AF37]/50 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
                Acesso Exclusivo à Avaliação Própria
              </h2>
              <p className="text-xs text-[#9EAF94] leading-relaxed">
                Como <strong className="text-slate-100">{profile.posto} {profile.nomeCompleto}</strong> (Militar Avaliado), o seu acesso ao sistema está estritamente restrito à consulta da sua própria avaliação (notas atribuídas, fatores, parecer e tomada de conhecimento formal) e ao seu dossiê individual.
              </p>
              <div className="p-3 bg-[rgba(12,18,11,0.7)] border border-[#758652]/30 rounded-xl text-xs text-[#C5D4BD] font-mono">
                Não é permitido consultar dados ou avaliações de outros militares nem aceder a painéis de gestão interna.
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/minha-fai">
                  <Button variant="default" size="sm" className="text-xs flex items-center gap-1.5 bg-[#13281B] hover:bg-[#1A3826] border border-[#758652]/80 text-[#D4AF37] cursor-pointer">
                    <Award className="w-4 h-4 text-[#D4AF37]" /> Minha FAI
                  </Button>
                </Link>
                <Link href={`/militares/${profile.nip}`}>
                  <Button variant="outline" size="sm" className="text-xs border-[#758652]/50 text-slate-200 hover:bg-white/5 cursor-pointer">
                    Meu Dossiê
                  </Button>
                </Link>
              </div>
            </div>
          ) : isBlockedForAvaliador1 ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-[rgba(24,34,21,0.85)] backdrop-blur-xl border border-[#D4AF37]/40 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] text-center space-y-4 animate-in fade-in">
              <div className="inline-flex p-3 bg-[#13281B] rounded-full border border-[#D4AF37]/50 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
                Funcionalidade Fora do Âmbito do 1º Avaliador
              </h2>
              <p className="text-xs text-[#9EAF94] leading-relaxed">
                As atribuições do <strong className="text-slate-100">Primeiro Avaliador</strong> limitam-se estritamente à visualização dos seus subordinados diretos, consulta de informações necessárias e realização da avaliação dos efetivos que lhe estão diretamente subordinados.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/militares">
                  <Button variant="default" size="sm" className="text-xs bg-[#13281B] hover:bg-[#1A3826] border border-[#758652]/80 text-[#D4AF37] cursor-pointer">
                    Meus Subordinados
                  </Button>
                </Link>
                <Link href="/fai/nova">
                  <Button variant="outline" size="sm" className="text-xs border-[#758652]/50 text-slate-200 hover:bg-white/5 cursor-pointer">
                    Avaliar Subordinados
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  );
}

