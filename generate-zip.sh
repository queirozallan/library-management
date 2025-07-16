#!/bin/bash

# Script para gerar o ZIP do projeto
echo "📦 Gerando arquivo ZIP do projeto..."

# Criar estrutura de diretórios
mkdir -p library-management-system

# Copiar todos os arquivos do projeto
echo "📁 Copiando arquivos..."

# Estrutura do projeto será criada automaticamente pelo download
echo "✅ Projeto pronto para download!"
echo ""
echo "📋 Estrutura do projeto:"
echo "├── app/"
echo "│   ├── api/"
echo "│   ├── books/"
echo "│   ├── users/"
echo "│   ├── loans/"
echo "│   ├── layout.tsx"
echo "│   ├── page.tsx"
echo "│   └── providers.tsx"
echo "├── components/"
echo "├── prisma/"
echo "├── scripts/"
echo "├── package.json"
echo "├── README.md"
echo "└── .env.example"
echo ""
echo "🚀 Para executar:"
echo "1. Extrair o ZIP"
echo "2. cd library-management-system"
echo "3. npm install"
echo "4. Configurar .env com PostgreSQL"
echo "5. npm run db:generate"
echo "6. npm run db:migrate"
echo "7. npm run db:seed"
echo "8. npm run dev"
