import React from 'react';
import FaiDetailClient from './fai-detail-client';

export function generateStaticParams() {
  return [
    { id: 'detalhes' },
    { id: 'FAI-2025-44440004' },
    { id: 'FAI-2025-55550005' },
    { id: 'FAI-2025-66660006' },
  ];
}

export default async function FaiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <React.Suspense fallback={<div className="p-16 text-center text-xs font-mono text-slate-400">A carregar processo FAI...</div>}>
      <FaiDetailClient faiId={resolvedParams.id} />
    </React.Suspense>
  );
}
