import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [totalBooks, totalUsers, activeLoans, overdueLoans] = await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.loan.count({ where: { status: "ACTIVE" } }),
      prisma.loan.count({
        where: {
          status: "ACTIVE",
          dueDate: { lt: new Date() },
        },
      }),
    ])

    return NextResponse.json({
      totalBooks,
      totalUsers,
      activeLoans,
      overdueLoans,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
