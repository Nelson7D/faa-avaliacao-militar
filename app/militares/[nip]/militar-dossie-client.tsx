'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMilitarByNip, fetchFais } from '@/services/firebase/firestore';
import { Militar } from '@/types/militar';
import { FaiDocument } from '@/types/fai';
import { DossieHeader } from '@/components/dossie/dossie-header';
import { MatriculaTab } from '@/components/dossie/matricula-tab';
import { HistoricoFaisTab } from '@/components/dossie/historico-fais-tab';
import { PromocoesTab } from '@/components/dossie/promocoes-tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, History, Award, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { canConsultarMilitar } from '@/lib/hierarchy';
import { Button } from '@/components/ui/button';

export default function MilitarDossieClient({ nip }: { nip: string }) {
  const { profile } = useAuth();
  const [militar, setMilitar] = useState<Militar | null>(null);
  const [fais, setFais] = useState<FaiDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const queryNip = searchParams?.get('nip');
        const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
        const candidateNip = pathParts[1];
        let targetNip = (nip === 'dossie' && candidateNip && candidateNip !== 'dossie') ? candidateNip : nip;
        if (targetNip === 'dossie') {
          targetNip = queryNip || '10293847';
        }

        const [mil, allFais] = await Promise.all([
          fetchMilitarByNip(targetNip),
          fetchFais(),
        ]);
        if (mil) setMilitar(mil);
        setFais(allFais.filter((f) => f.militarNip === targetNip));
      } catch (err) {
        console.error('Erro ao carregar dossier:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [nip]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground animate-pulse">
        Carregando Dossiê do Militar (NIP {nip})...
      </div>
    );
  }

  if (!militar) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-bold text-destructive">Militar NIP {nip} não encontrado no cadastro.</p>
        <Link href="/dashboard" className="text-xs text-primary font-bold hover:underline">
          &larr; Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  // Princípio da Hierarquia Militar FAA (Ponto 2):
  // Subordinado não tem permissão para consultar dossiê de superior
  if (!canConsultarMilitar(profile, militar)) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-2xl shadow-card text-center space-y-4 animate-in fade-in">
        <div className="inline-flex p-3 bg-rose-50 rounded-full text-rose-700 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
          Acesso Negado • Violação da Hierarquia Militar
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Em conformidade com o <strong>Princípio da Hierarquia Militar das FAA</strong>, o superior hierárquico tem acesso aos seus subordinados para efeitos funcionais e de avaliação, mas o subordinado não possui autorização para consultar dados cadastrais ou avaliações do seu superior hierárquico.
        </p>
        <p className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          Utilizador Atual: {profile?.posto} {profile?.nomeGuerra || profile?.nomeCompleto} • Alvo: {militar.posto} {militar.nomeCompleto}
        </p>
        <div className="pt-2">
          <Link href={profile?.role === 'MILITAR_AVALIADO' ? '/minha-fai' : '/militares'}>
            <Button size="sm" className="text-xs bg-[#0F3323] hover:bg-[#184A34] text-white">
              Voltar aos Registos Autorizados
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-mono pb-2 border-b border-border">
        <Link href="/militares" className="hover:text-primary transition-colors">
          Processos Individuais
        </Link>
        <span>&gt;</span>
        <span className="text-primary font-bold">Dossiê Executivo (NIP {nip})</span>
      </div>

      {/* Header Profile Card */}
      <DossieHeader militar={militar} />

      {/* 3 Main Tabs */}
      <Tabs defaultValue="matricula" className="w-full">
        <TabsList className="bg-white px-2 rounded-t border border-border">
          <TabsTrigger value="matricula" icon={<FileText className="w-4 h-4 text-primary" />}>
            Folha de Matrícula
          </TabsTrigger>
          <TabsTrigger value="historico" icon={<History className="w-4 h-4 text-primary" />}>
            Histórico das FAIs ({fais.length})
          </TabsTrigger>
          <TabsTrigger value="promocoes" icon={<Award className="w-4 h-4 text-[#B89047]" />}>
            Carreira & Promoções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matricula">
          <MatriculaTab militar={militar} onMilitarUpdated={setMilitar} />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoFaisTab fais={fais} />
        </TabsContent>

        <TabsContent value="promocoes">
          <PromocoesTab militar={militar} fais={fais} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
