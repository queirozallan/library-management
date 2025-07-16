# Sistema de Gerenciamento de Biblioteca

Sistema completo para gerenciamento de biblioteca desenvolvido com **Next.js 14**, **Prisma**, **PostgreSQL** e **React Query**.

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** (App Router)
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **React Hook Form** + **Zod** para validação
- **React Query** para gerenciamento de estado
- **React-Toastify** para notificações
- **Lucide React** para ícones

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL** como banco de dados
- **Zod** para validação de dados

## 📋 Funcionalidades

### 📚 Gerenciamento de Livros
- ✅ Listar todos os livros
- ✅ Buscar livros por título, autor ou gênero
- ✅ Adicionar novos livros
- ✅ Editar informações dos livros
- ✅ Excluir livros (apenas sem empréstimos ativos)
- ✅ Controle de disponibilidade de cópias

### 👥 Gerenciamento de Usuários
- ✅ Listar todos os usuários
- ✅ Buscar usuários por nome ou email
- ✅ Cadastrar novos usuários
- ✅ Editar informações dos usuários
- ✅ Excluir usuários (apenas sem empréstimos ativos)
- ✅ Controle de status (Ativo, Inativo, Suspenso)
- ✅ Tipos de membro (Estudante, Professor, Comunidade)

### 📄 Gerenciamento de Empréstimos
- ✅ Listar todos os empréstimos
- ✅ Filtrar por status (Ativo, Devolvido, Atrasado)
- ✅ Buscar por livro, usuário ou autor
- ✅ Criar novos empréstimos
- ✅ Renovar empréstimos (até 2 vezes)
- ✅ Processar devoluções
- ✅ Controle automático de empréstimos atrasados
- ✅ Validações de negócio

### 📊 Dashboard
- ✅ Estatísticas gerais do sistema
- ✅ Total de livros, usuários e empréstimos
- ✅ Empréstimos atrasados
- ✅ Navegação rápida

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### 1. Clone o repositório
\`\`\`bash
git clone <repository-url>
cd library-management-system
\`\`\`

### 2. Instale as dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configure o banco de dados
\`\`\`bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure a URL do banco no arquivo .env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db?schema=public"
\`\`\`

### 4. Configure o Prisma
\`\`\`bash
# Gere o cliente Prisma
npm run db:generate

# Execute as migrações
npm run db:migrate

# Popule o banco com dados de exemplo
npm run db:seed
\`\`\`

### 5. Execute o projeto
\`\`\`bash
npm run dev
\`\`\`

O sistema estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/                 # API Routes
│   │   ├── books/          # Endpoints de livros
│   │   ├── users/          # Endpoints de usuários
│   │   ├── loans/          # Endpoints de empréstimos
│   │   └── dashboard/      # Endpoints do dashboard
│   ├── books/              # Páginas de livros
│   ├── users/              # Páginas de usuários
│   ├── loans/              # Páginas de empréstimos
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página inicial
│   └── providers.tsx       # Providers (React Query)
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   └── navigation.tsx      # Componente de navegação
├── prisma/
│   └── schema.prisma       # Schema do banco de dados
├── scripts/
│   └── seed.ts             # Script de seed
└── lib/
    └── utils.ts            # Utilitários
\`\`\`

## 🗄️ Modelo de Dados

### Usuário (User)
- ID, Nome, Email, Telefone
- Tipo de membro (Estudante, Professor, Comunidade)
- Status (Ativo, Inativo, Suspenso)
- Data de cadastro

### Livro (Book)
- ID, Título, Autor, ISBN
- Ano de publicação, Gênero
- Total de cópias, Cópias disponíveis
- Descrição (opcional)

### Empréstimo (Loan)
- ID, Usuário, Livro
- Data do empréstimo, Data de vencimento
- Data de devolução (opcional)
- Status (Ativo, Devolvido, Atrasado)
- Contador de renovações

## 🔧 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm run start

# Linting
npm run lint

# Prisma
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Push do schema para o banco
npm run db:migrate     # Executar migrações
npm run db:seed        # Popular banco com dados de exemplo
\`\`\`

## 🎯 Validações Implementadas

### Livros
- Título obrigatório (máx. 200 caracteres)
- Autor obrigatório (máx. 100 caracteres)
- ISBN único (10-17 caracteres)
- Ano de publicação válido
- Gênero obrigatório
- Total de cópias (1-100)

### Usuários
- Nome obrigatório (máx. 100 caracteres)
- Email único e válido
- Telefone (10-15 dígitos)
- Tipo de membro obrigatório

### Empréstimos
- Usuário deve estar ativo
- Livro deve ter cópias disponíveis
- Usuário não pode ter o mesmo livro emprestado
- Data de vencimento obrigatória
- Máximo 2 renovações por empréstimo

## 🚦 Regras de Negócio

1. **Livros**: Não podem ser excluídos se tiverem empréstimos ativos
2. **Usuários**: Não podem ser excluídos se tiverem empréstimos ativos
3. **Empréstimos**: Prazo padrão de 14 dias
4. **Renovações**: Máximo 2 renovações, cada uma estende por 14 dias
5. **Disponibilidade**: Cópias disponíveis são atualizadas automaticamente
6. **Status**: Empréstimos são marcados como atrasados automaticamente

## 🎨 Interface

- Design responsivo com Tailwind CSS
- Componentes reutilizáveis com shadcn/ui
- Navegação intuitiva
- Feedback visual com toasts
- Loading states e validações em tempo real
- Busca e filtros em todas as listagens

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops

## 🔒 Segurança

- Validação de dados no frontend e backend
- Sanitização de inputs
- Validações de negócio rigorosas
- Tratamento de erros adequado

## 🚀 Deploy

O projeto está pronto para deploy em plataformas como:
- Vercel (recomendado para Next.js)
- Netlify
- Railway
- Heroku

## 📄 Licença

Este projeto está sob a licença MIT.
