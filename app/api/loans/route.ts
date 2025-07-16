import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const createLoanSchema = z.object({
  userId: z.string().min(1),
  bookId: z.string().min(1),
  dueDate: z.string().transform((str) => new Date(str)),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const where: any = {}

    if (search) {
      where.OR = [
        { book: { title: { contains: search, mode: "insensitive" } } },
        { book: { author: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (status) {
      if (status === "OVERDUE") {
        where.AND = [{ status: "ACTIVE" }, { dueDate: { lt: new Date() } }]
      } else {
        where.status = status
      }
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: { loanDate: "desc" },
    })

    // Transform the data to match the frontend interface
    const transformedLoans = loans.map((loan) => ({
      id: loan.id,
      bookTitle: loan.book.title,
      bookAuthor: loan.book.author,
      userName: loan.user.name,
      userEmail: loan.user.email,
      loanDate: loan.loanDate.toISOString(),
      dueDate: loan.dueDate.toISOString(),
      returnDate: loan.returnDate?.toISOString(),
      status: loan.dueDate < new Date() && loan.status === "ACTIVE" ? "OVERDUE" : loan.status,
      renewalCount: loan.renewalCount,
      maxRenewals: loan.maxRenewals,
    }))

    return NextResponse.json(transformedLoans)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createLoanSchema.parse(body)

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Usuário não encontrado ou inativo" }, { status: 400 })
    }

    // Check if book exists and has available copies
    const book = await prisma.book.findUnique({
      where: { id: validatedData.bookId },
    })

    if (!book || book.availableCopies <= 0) {
      return NextResponse.json({ error: "Livro não disponível" }, { status: 400 })
    }

    // Check if user already has this book on loan
    const existingLoan = await prisma.loan.findFirst({
      where: {
        userId: validatedData.userId,
        bookId: validatedData.bookId,
        status: "ACTIVE",
      },
    })

    if (existingLoan) {
      return NextResponse.json({ error: "Usuário já possui este livro emprestado" }, { status: 400 })
    }

    // Create loan and update book availability in a transaction
    const result = await prisma.$transaction([
      prisma.loan.create({
        data: {
          userId: validatedData.userId,
          bookId: validatedData.bookId,
          dueDate: validatedData.dueDate,
        },
      }),
      prisma.book.update({
        where: { id: validatedData.bookId },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      }),
    ])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }

    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
