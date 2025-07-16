import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  isbn: z.string().min(10).max(17),
  publishedYear: z.number().min(1000).max(new Date().getFullYear()),
  genre: z.string().min(1),
  totalCopies: z.number().min(1).max(100),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const available = searchParams.get("available")

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { genre: { contains: search, mode: "insensitive" } },
      ]
    }

    if (available === "true") {
      where.availableCopies = { gt: 0 }
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { title: "asc" },
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBookSchema.parse(body)

    // Check if ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn: validatedData.isbn },
    })

    if (existingBook) {
      return NextResponse.json({ error: "ISBN já existe" }, { status: 400 })
    }

    const book = await prisma.book.create({
      data: {
        ...validatedData,
        availableCopies: validatedData.totalCopies,
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }

    console.error("Error creating book:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
