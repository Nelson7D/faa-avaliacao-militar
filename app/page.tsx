'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (profile) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [loading, profile, router]);

  return (
    <div className="min-h-screen bg-[#0B1612] flex flex-col items-center justify-center text-white space-y-3">
      <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono text-slate-300">A iniciar Sistema FAI...</p>
      <p className="text-[11px] font-sans text-[#D4AF37] font-semibold">Ficha de Avaliação Individual</p>
    </div>
  );
}
