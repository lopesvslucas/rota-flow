# RotaFlow 🚛

Painel de controle completo para mini transportadoras. Gerencie finanças, rotas, entregas e equipe em um único lugar.

## ✨ Funcionalidades

### 📊 Controle Financeiro
- Dashboard com cards de entradas/saídas do dia e saldo mensal
- Gráfico de barras (entradas vs saídas por dia) e donut (por categoria)
- Lançamento rápido via FAB (botão flutuante)
- Listagem com filtros e exportação CSV
- Categorias customizáveis com cores
- Atualizações em tempo real (Supabase Realtime)

### 🚚 Controle de Rotas
- Dashboard com entregas do dia, em andamento e faturamento
- CRUD completo de rotas com status visual (pipeline)
- Upload de comprovantes (imagens e PDF)
- Link público para o cliente acompanhar a entrega
- Gestão de clientes e motoristas

### 👥 Gestão de Usuários
- Convite por e-mail com Magic Link
- Roles: Proprietário, Administrador, Motorista, Visualizador
- Permissões granulares por módulo
- Edição e remoção de membros

### 🔐 Autenticação
- Login via Magic Link (sem senha)
- Onboarding automático na primeira vez
- Multi-tenant (isolamento por empresa)
- RLS (Row Level Security) em todas as tabelas

## 🛠️ Stack

| Tecnologia | Uso |
|------------|-----|
| React 19 + TypeScript | Frontend |
| Vite | Build tool |
| Tailwind CSS v4 | Estilização |
| Supabase | Auth, Database, Storage, Realtime |
| TanStack Query | Cache e sincronização |
| React Hook Form + Zod | Formulários e validação |
| Recharts | Gráficos |
| Lucide React | Ícones |
| Sonner | Toasts |

## 🚀 Setup

### 1. Clone o repositório

```bash
git clone <url-do-repo>
cd RotaFlow
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [supabase.com](https://supabase.com)
2. Execute as migrations SQL na ordem (via SQL Editor do Supabase):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage.sql`
   - `supabase/migrations/004_functions_triggers.sql`

> **Nota**: As migrations já foram aplicadas automaticamente no projeto Supabase configurado.

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha com as credenciais do seu projeto Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 5. Configure o Auth no Supabase

1. Vá em **Authentication > URL Configuration**
2. Adicione `http://localhost:5173` em **Site URL** e **Redirect URLs**
3. Adicione seu domínio de produção nas Redirect URLs também
4. Em **Email Templates**, certifique-se que o Magic Link está habilitado

### 6. Rode localmente

```bash
npm run dev
```

## 📦 Deploy no Netlify

1. Conecte o repositório no [Netlify](https://netlify.com)
2. O `netlify.toml` já está configurado
3. Adicione as variáveis de ambiente em **Site Settings > Environment Variables**
4. No Supabase, adicione o domínio do Netlify nas Redirect URLs

## 📁 Estrutura

```
src/
├── components/
│   ├── layout/       # Sidebar, Header, BottomNav, AppLayout
│   ├── financial/    # TransactionModal, CategoryManager
│   └── routes/       # RouteForm
├── hooks/            # useAuth, useTransactions, useRoutes, useTheme
├── lib/              # supabase, formatters, permissions, utils
├── pages/            # Login, Onboarding, Dashboard, Financial,
│                     # Routes, RouteDetail, Users, Settings,
│                     # PublicDelivery
└── types/            # TypeScript interfaces
```

## 🎨 Design

- **Tema escuro** como padrão (com toggle para claro)
- **Fonte**: Geist (Vercel CDN)
- **Paleta**: Azul-violeta `#6366f1`, Verde `#22c55e`, Vermelho `#ef4444`
- Sidebar colapsável no desktop, bottom nav no mobile
- Transições suaves, hover states
- Valores em `R$ 1.234,56` e datas em `dd/mm/aaaa`

## 📄 Licença

MIT
