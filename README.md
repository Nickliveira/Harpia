# Harpia — Formulário de Pesquisa

Formulário interativo para pesquisa acadêmica (TCC) sobre segurança inteligente em pipelines CI/CD.

## Stack

- **Next.js 16** — App Router
- **React 19** + **Framer Motion** — UI e animações
- **Tailwind CSS 4** — Estilização
- **Neon PostgreSQL** — Banco de dados serverless

## Setup

```bash
npm install
```

Crie o arquivo `.env.local` com:

```
DATABASE_URL="postgresql://..."
```

Execute a migração do banco:

```bash
npm run migrate
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Estrutura

```
src/
  app/
    api/submit/route.ts   # API de submissão
    layout.tsx
    page.tsx
  components/
    FormSurvey.tsx         # Componente principal do formulário
  data/
    questions.ts           # Perguntas e configuração
  lib/
    db.ts                  # Conexão com o banco
scripts/
  migrate.ts              # Script de migração
```
