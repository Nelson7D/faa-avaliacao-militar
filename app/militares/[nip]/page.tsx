'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { fetchMilitarByNip, fetchFais } from '@/services/firebase/firestore';
import { Militar } from '@/types/militar';
import { FaiDocument } from '@/types/fai';
import { DossieHeader } from '@/components/dossie/dossie-header';
import { MatriculaTab } from '@/components/dossie/matricula-tab';
import { HistoricoFaisTab } from '@/components/dossie/historico-fais-tab';
import { PromocoesTab } from '@/components/dossie/promocoes-tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, FileText, History, Award, ShieldAlert } from 'lucide-react';

export default function MilitarDossiePage({ params }: { params: Promise<{ nip: string }> }) {
  const resolvedParams = use(params);
  const nip = resolvedParams.nip;

  const [militar, setMilitar] = useState<Militar | null>(null);
  const [fais, setFais] = useState<FaiDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mil, allFais] = await Promise.all([
          fetchMilitarByNip(nip),
          fetchFais(),
        ]);
        if (mil) setMilitar(mil);
        setFais(allFais.filter((f) => f.militarNip === nip));
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
          <TabsTrigger value="promocoes" icon={<Award className="w-4 h-4 text-[#C5962B]" />}>
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
