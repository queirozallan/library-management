# 🚀 Guia de Instalação - Sistema de Biblioteca

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **PostgreSQL** - [Download aqui](https://www.postgresql.org/download/)
- **Git** (opcional) - [Download aqui](https://git-scm.com/)

## 🛠️ Passo a Passo

### 1. 📦 Extrair o Projeto
\`\`\`bash
# Extrair o arquivo ZIP baixado
# Navegar para a pasta extraída
cd library-management-system
\`\`\`

### 2. 📚 Instalar Dependências
\`\`\`bash
npm install
\`\`\`

### 3. 🗄️ Configurar Banco de Dados

#### Opção A: PostgreSQL Local
\`\`\`bash
# Criar banco de dados
createdb library_db

# Ou via psql:
psql -U postgres
CREATE DATABASE library_db;
\q
\`\`\`

#### Opção B: PostgreSQL na Nuvem (Supabase/Neon)
- Criar conta no [Supabase](https://supabase.com) ou [Neon](https://neon.tech)
- Criar novo projeto/banco
- Copiar a connection string

### 4. ⚙️ Configurar Variáveis de Ambiente
\`\`\`bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
\`\`\`

**Configurar no .env:**
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db?schema=public"
\`\`\`

### 5. 🔧 Configurar Prisma
\`\`\`bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações (criar tabelas)
npm run db:migrate

# Popular banco com dados de exemplo
npm run db:seed
\`\`\`

### 6. 🚀 Executar o Sistema
\`\`\`bash
npm run dev
\`\`\`

**Sistema disponível em:** `http://localhost:3000`

## 📊 Dados de Exemplo

Após executar o seed, você terá:

### 👥 Usuários:
- **João Silva** - joao.silva@email.com (Estudante)
- **Maria Santos** - maria.santos@email.com (Professor)  
- **Pedro Oliveira** - pedro.oliveira@email.com (Comunidade)
- **Ana Costa** - ana.costa@email.com (Estudante - Suspenso)

### 📚 Livros:
- Clean Code - Robert C. Martin
- O Senhor dos Anéis - J.R.R. Tolkien
- 1984 - George Orwell
- Dom Casmurro - Machado de Assis
- Algoritmos - Thomas H. Cormen
- O Pequeno Príncipe - Antoine de Saint-Exupéry

### 📄 Empréstimos:
- Alguns empréstimos ativos
- Alguns empréstimos atrasados
- Alguns empréstimos devolvidos

## 🔧 Scripts Disponíveis

\`\`\`bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm run start

# Linting
npm run lint

# Prisma
npm run db:generate    # Gerar cliente
npm run db:push        # Push schema
npm run db:migrate     # Executar migrações
npm run db:seed        # Popular dados
\`\`\`

## ❗ Solução de Problemas

### Erro de Conexão com Banco
\`\`\`bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Reiniciar PostgreSQL
sudo service postgresql restart
\`\`\`

### Erro de Permissões
\`\`\`bash
# Dar permissões ao usuário
sudo -u postgres psql
ALTER USER your_username CREATEDB;
\q
\`\`\`

### Erro de Porta Ocupada
\`\`\`bash
# Verificar processo na porta 3000
lsof -i :3000

# Matar processo
kill -9 PID
\`\`\`

### Reset do Banco
\`\`\`bash
# Resetar migrações
npx prisma migrate reset

# Executar seed novamente
npm run db:seed
\`\`\`

## 🌐 Deploy

### Vercel (Recomendado)
1. Fazer push para GitHub
2. Conectar repositório na Vercel
3. Configurar variáveis de ambiente
4. Deploy automático

### Outras Plataformas
- **Netlify**: Para frontend
- **Railway**: Para fullstack
- **Heroku**: Para fullstack

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs no terminal
2. Conferir configuração do .env
3. Verificar se PostgreSQL está rodando
4. Consultar documentação do Prisma

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Projeto extraído
- [ ] Dependências instaladas (`npm install`)
- [ ] Banco de dados criado
- [ ] Arquivo .env configurado
- [ ] Prisma configurado (`npm run db:generate`)
- [ ] Migrações executadas (`npm run db:migrate`)
- [ ] Dados populados (`npm run db:seed`)
- [ ] Sistema rodando (`npm run dev`)
- [ ] Acessível em http://localhost:3000

🎉 **Parabéns! Sistema instalado com sucesso!**
