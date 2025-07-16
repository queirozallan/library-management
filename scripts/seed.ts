import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // Limpar dados existentes
  await prisma.loan.deleteMany()
  await prisma.book.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(11) 99999-9999",
        membershipType: "STUDENT",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "(11) 88888-8888",
        membershipType: "TEACHER",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        name: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        phone: "(11) 77777-7777",
        membershipType: "COMMUNITY",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ana Costa",
        email: "ana.costa@email.com",
        phone: "(11) 66666-6666",
        membershipType: "STUDENT",
        status: "SUSPENDED",
      },
    }),
  ])

  console.log(`✅ Criados ${users.length} usuários`)

  // Criar livros
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0132350884",
        publishedYear: 2008,
        genre: "Tecnologia",
        totalCopies: 3,
        availableCopies: 2,
        description: "Um guia para escrever código limpo e maintível.",
      },
    }),
    prisma.book.create({
      data: {
        title: "O Senhor dos Anéis: A Sociedade do Anel",
        author: "J.R.R. Tolkien",
        isbn: "978-8533613379",
        publishedYear: 1954,
        genre: "Fantasia",
        totalCopies: 5,
        availableCopies: 4,
        description: "O primeiro volume da épica trilogia de Tolkien.",
      },
    }),
    prisma.book.create({
      data: {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0451524935",
        publishedYear: 1949,
        genre: "Ficção",
        totalCopies: 2,
        availableCopies: 1,
        description: "Uma distopia sobre totalitarismo e vigilância.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Dom Casmurro",
        author: "Machado de Assis",
        isbn: "978-8525406958",
        publishedYear: 1899,
        genre: "Literatura Brasileira",
        totalCopies: 4,
        availableCopies: 4,
        description: "Clássico da literatura brasileira.",
      },
    }),
    prisma.book.create({
      data: {
        title: "Algoritmos: Teoria e Prática",
        author: "Thomas H. Cormen",
        isbn: "978-8535236996",
        publishedYear: 2012,
        genre: "Tecnologia",
        totalCopies: 2,
        availableCopies: 2,
        description: "Livro fundamental sobre algoritmos e estruturas de dados.",
      },
    }),
    prisma.book.create({
      data: {
        title: "O Pequeno Príncipe",
        author: "Antoine de Saint-Exupéry",
        isbn: "978-8595081413",
        publishedYear: 1943,
        genre: "Infantil",
        totalCopies: 6,
        availableCopies: 5,
        description: "Uma fábula poética sobre amizade e humanidade.",
      },
    }),
  ])

  console.log(`✅ Criados ${books.length} livros`)

  // Criar empréstimos
  const loans = await Promise.all([
    prisma.loan.create({
      data: {
        userId: users[0].id, // João Silva
        bookId: books[0].id, // Clean Code
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias a partir de hoje
        status: "ACTIVE",
      },
    }),
    prisma.loan.create({
      data: {
        userId: users[1].id, // Maria Santos
        bookId: books[1].id, // O Senhor dos Anéis
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás (atrasado)
        status: "ACTIVE",
        renewalCount: 1,
      },
    }),
    prisma.loan.create({
      data: {
        userId: users[2].id, // Pedro Oliveira
        bookId: books[2].id, // 1984
        loanDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 dias atrás
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
        returnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // devolvido 5 dias atrás
        status: "RETURNED",
      },
    }),
    prisma.loan.create({
      data: {
        userId: users[0].id, // João Silva
        bookId: books[5].id, // O Pequeno Príncipe
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de hoje
        status: "ACTIVE",
      },
    }),
  ])

  console.log(`✅ Criados ${loans.length} empréstimos`)

  console.log("🎉 Seed concluído com sucesso!")
  console.log("\n📊 Resumo:")
  console.log(`- ${users.length} usuários`)
  console.log(`- ${books.length} livros`)
  console.log(`- ${loans.length} empréstimos`)
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
