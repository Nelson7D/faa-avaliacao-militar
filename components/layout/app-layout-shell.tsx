'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Award, ArrowRight, Lock } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const cleanPath = (pathname || '').replace(/\/$/, '') || '/';
  const isAuthPage = cleanPath === '/login' || cleanPath === '/cadastro';

  useEffect(() => {
    if (!loading && !profile && !isAuthPage) {
      router.push('/login');
    }
  }, [loading, profile, isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1612] flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">A validar credenciais militares...</p>
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect via useEffect
  }

  // Role Protection Check for Evaluator / Admin only routes
  const isMilitarAvaliado = profile.role === 'MILITAR_AVALIADO';
  const isEvaluatorOnlyRoute =
    cleanPath.startsWith('/fai/nova') ||
    cleanPath === '/admin' ||
    cleanPath === '/ia-analytics';

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground flex">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 md:ml-sidebar-width ml-0 flex flex-col min-h-screen transition-all">
        <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full">
          {isMilitarAvaliado && isEvaluatorOnlyRoute ? (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200/90 rounded-2xl shadow-card text-center space-y-4">
              <div className="inline-flex p-3 bg-amber-50 rounded-full border border-amber-200 text-[#B89047]">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-slate-900 uppercase">
                Acesso Reservado a Oficiais Avaliadores e Comando
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Como <strong>{profile.posto} {profile.nomeCompleto}</strong> (Militar Avaliado), o seu perfil regimental não possui permissão para avaliar outros militares ou administrar o sistema.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono">
                Aceda à aba <strong>Minha FAI</strong> para consultar a sua nota, tomar conhecimento formal ou interpor recurso/reclamação.
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/minha-fai">
                  <Button variant="default" size="sm" className="text-xs flex items-center gap-1.5 bg-[#0F3323] hover:bg-[#184A34] text-white">
                    <Award className="w-4 h-4 text-[#D4AF37]" /> Ir para Minha FAI
                  </Button>
                </Link>
                <Link href={`/militares/${profile.nip}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Meu Dossiê
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

