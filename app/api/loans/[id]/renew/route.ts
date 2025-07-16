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

    if (loan.renewalCount >= loan.maxRenewals) {
      return NextResponse.json({ error: "Limite de renovações atingido" }, { status: 400 })
    }

    // Renew the loan (extend due date by 14 days)
    const newDueDate = new Date(loan.dueDate)
    newDueDate.setDate(newDueDate.getDate() + 14)

    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        dueDate: newDueDate,
        renewalCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(updatedLoan)
  } catch (error) {
    console.error("Error renewing loan:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
