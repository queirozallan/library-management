import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const updateBookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  isbn: z.string().min(10).max(17),
  publishedYear: z.number().min(1000).max(new Date().getFullYear()),
  genre: z.string().min(1),
  totalCopies: z.number().min(1).max(100),
  description: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
    })

    if (!book) {
      return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validatedData = updateBookSchema.parse(body)

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id },
    })

    if (!existingBook) {
      return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 })
    }

    // Check if ISBN is being changed and if it already exists
    if (validatedData.isbn !== existingBook.isbn) {
      const isbnExists = await prisma.book.findUnique({
        where: { isbn: validatedData.isbn },
      })

      if (isbnExists) {
        return NextResponse.json({ error: "ISBN já existe" }, { status: 400 })
      }
    }

    // Calculate new available copies based on the difference in total copies
    const copyDifference = validatedData.totalCopies - existingBook.totalCopies
    const newAvailableCopies = Math.max(0, existingBook.availableCopies + copyDifference)

    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        availableCopies: newAvailableCopies,
      },
    })

    return NextResponse.json(book)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }

    console.error("Error updating book:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if book has active loans
    const activeLoans = await prisma.loan.count({
      where: {
        bookId: params.id,
        status: "ACTIVE",
      },
    })

    if (activeLoans > 0) {
      return NextResponse.json({ error: "Não é possível excluir livro com empréstimos ativos" }, { status: 400 })
    }

    await prisma.book.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Livro excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
