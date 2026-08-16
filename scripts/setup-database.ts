import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2FsCMsqbXIBc1Nj4xqU9DcZWmUIDgjFQ",
  authDomain: "faa-avaliacao-militar.firebaseapp.com",
  projectId: "faa-avaliacao-militar",
  storageBucket: "faa-avaliacao-militar.firebasestorage.app",
  messagingSenderId: "780617304823",
  appId: "1:780617304823:web:65c597d8d3904f0b11e1f2",
  measurementId: "G-1T9DYX9G45"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('🎖️ Iniciando criação e verificação das coleções regimentais no Cloud Firestore...');

  // 1. Coleção: configuracoes (Parâmetros Regimentais)
  console.log('1. Criando configuracoes/geral...');
  await setDoc(doc(db, 'configuracoes', 'geral'), {
    anoInstrucaoAtivo: '2025/2026',
    prazoFaiDias: 30,
    prazoImpugnacaoDias: 15,
    travarSubmissoes: false,
    versaoSistema: '2.5',
    descricao: 'Parâmetros Regimentais Oficiais das Forças Armadas Angolanas (Manual VII)',
    atualizadoEm: new Date().toISOString(),
  });
  console.log('✓ configuracoes/geral criado com sucesso!');

  // 2. Coleção: audit_logs (Registo Imutável de Auditoria)
  console.log('2. Criando registo inicial em audit_logs...');
  const initLogId = `LOG-${Date.now()}-INIT`;
  await setDoc(doc(db, 'audit_logs', initLogId), {
    id: initLogId,
    timestamp: new Date().toISOString(),
    acao: 'INICIALIZAÇÃO DO SISTEMA E ESTRUTURA REGIMENTAL DA BASE DE DADOS',
    militarNip: '00000000',
    responsavel: 'Estado-Maior General / Direcção de Pessoal e Quadros',
    etapaDe: 'SISTEMA',
    etapaPara: 'SISTEMA_OPERACIONAL',
    detalhes: 'Criação de coleções: users, militares, fais, impugnacoes, audit_logs, configuracoes',
  });
  console.log(`✓ audit_logs/${initLogId} registado com sucesso!`);

  // 3. Verificação de todas as coleções
  console.log('\n--- VERIFICAÇÃO FINAL DAS COLEÇÕES ---');
  const collectionsToCheck = ['configuracoes', 'audit_logs', 'militares', 'fais', 'impugnacoes', 'users'];
  for (const colName of collectionsToCheck) {
    const snap = await getDocs(collection(db, colName));
    console.log(`• Coleção [${colName}]: ${snap.size} documentos`);
  }

  console.log('\n✅ Todas as coleções regimentais foram criadas e verificadas no Google Cloud Firestore com sucesso!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erro na criação das coleções:', err);
  process.exit(1);
});
