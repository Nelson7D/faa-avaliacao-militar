import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-destructive border border-red-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-primary font-mono uppercase">
        404 - Documento Militar Não Encontrado
      </h1>
      <p className="text-xs text-muted-foreground max-w-md">
        O processo individual, ficha de avaliação ou recurso solicitado não consta dos arquivos do sistema ou foi arquivado.
      </p>
      <Link href="/dashboard">
        <Button variant="default" size="sm" className="text-xs flex items-center gap-1.5 mt-2">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Central (Dashboard)
        </Button>
      </Link>
    </div>
  );
}
