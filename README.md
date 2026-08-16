# Sistema de Avaliação Individual dos Militares (FAA) - FAI Digital v2.5

Plataforma oficial para abertura, tramitação e homologação das Fichas de Avaliação Individual (FAI) dos quadros permanentes das Forças Armadas Angolanas (FAA), em estrita conformidade com o **Manual de Preparação Especial VII — Departamento de Ciências e Tecnologias Militares (Academia Militar, Lobito 2021)**.

## 🚀 Live Demo & Hospedagem
- **Hospedagem Oficial Firebase**: [https://faa-avaliacao-militar.web.app](https://faa-avaliacao-militar.web.app)

## 🏛️ Estrutura Canónica dos 12 Blocos Regimentais
1. **Bloco 01**: Identificação do Militar Avaliado (NIP, Posto, U/E/O, QE, ASC)
2. **Bloco 02**: Período e Tipo de Avaliação (Ordinária Anual vs Extraordinária)
3. **Bloco 03**: Identificação dos Avaliadores (1º, 2º Avaliador e Comandante da Unidade)
4. **Bloco 04**: Grelha de Factores de Avaliação (F1 a F16)
5. **Bloco 05**: Média Final Regimental (Fórmula MP = (C x N) / Divisor Base)
   - Divisor 52 para Oficiais e Sargentos
   - Divisor 31 para Praças (Exclusão canónica de F6, F8, F10, F11, F13, F14)
6. **Bloco 06**: Parecer do Conselho da Arma, Serviço ou Classe (ASEC)
7. **Bloco 07**: Parecer do 1º Avaliador (Prazo: 10 dias)
8. **Bloco 08**: Parecer do 2º Avaliador (Prazo: 5 dias)
9. **Bloco 09**: Despacho do Comandante / Director / Chefe da U/E/O (Poder de Substituição - 5 dias)
10. **Bloco 10**: Áreas Preferenciais de Emprego do Militar
11. **Bloco 11**: Tomada de Conhecimento do Avaliado (Direito de Reclamação: 15 dias)
12. **Bloco 12**: Homologação Final pelo Chefe do DPQ e Inserção no Processo Individual

## 🛠️ Tecnologias
- **Next.js 15 (App Router)**
- **React 19 & TypeScript**
- **Tailwind CSS & Lucide Icons**
- **Google Cloud Firestore (Região africa-south1)**
- **Firebase Authentication & Firebase Hosting**
- **Vitest** (Testes automatizados com 100% de cobertura no motor de cálculo)

## 📦 Instalação e Execução Local
```bash
# Instalar dependências
npm install

# Executar testes unitários do Manual VII
npm run test

# Executar servidor de desenvolvimento
npm run dev

# Build de produção e exportação estática
npm run build
```
