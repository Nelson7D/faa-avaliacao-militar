import React from 'react';
import MilitarDossieClient from './militar-dossie-client';

export function generateStaticParams() {
  return [
    { nip: 'dossie' },
    { nip: '10293847' },
    { nip: '44440004' },
    { nip: '11110001' },
    { nip: '22220002' },
    { nip: '33330003' },
    { nip: '55550005' },
    { nip: '66660006' },
    { nip: '00000001' },
    { nip: '00000002' },
  ];
}

export default async function MilitarDossiePage({ params }: { params: Promise<{ nip: string }> }) {
  const resolvedParams = await params;
  return (
    <React.Suspense fallback={<div className="p-16 text-center text-xs font-mono text-slate-400">A carregar dossiê militar...</div>}>
      <MilitarDossieClient nip={resolvedParams.nip} />
    </React.Suspense>
  );
}
