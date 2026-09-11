import React from 'react';
import MilitarDossieClient from './militar-dossie-client';

export function generateStaticParams() {
  return [{ nip: 'dossie' }];
}

export default async function MilitarDossiePage({ params }: { params: Promise<{ nip: string }> }) {
  const resolvedParams = await params;
  return <MilitarDossieClient nip={resolvedParams.nip} />;
}
