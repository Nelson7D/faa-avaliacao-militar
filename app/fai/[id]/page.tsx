import React from 'react';
import FaiDetailClient from './fai-detail-client';

export function generateStaticParams() {
  return [{ id: 'detalhes' }];
}

export default async function FaiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <FaiDetailClient faiId={resolvedParams.id} />;
}
