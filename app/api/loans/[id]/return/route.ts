import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Find the loan
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
    })

    if (!loan) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 })
    }

    if (loan.status !== "ACTIVE") {
      return NextResponse.json({ error: "Empréstimo não está ativo" }, { status: 400 })
    }

    // Return the book and update availability in a transaction
    const result = await prisma.$transaction([
      prisma.loan.update({
        where: { id: params.id },
        data: {
          status: "RETURNED",
          returnDate: new Date(),
        },
      }),
      prisma.book.update({
        where: { id: loan.bookId },
        data: {
          availableCopies: {
            increment: 1,
          },
        },
      }),
    ])

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error returning loan:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
