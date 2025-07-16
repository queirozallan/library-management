"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, RotateCcw, CheckCircle, Plus, User } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

interface Loan {
  id: string
  bookTitle: string
  bookAuthor: string
  userName: string
  userEmail: string
  loanDate: string
  dueDate: string
  returnDate?: string
  status: "ACTIVE" | "RETURNED" | "OVERDUE"
  renewalCount: number
  maxRenewals: number
}

const fetchLoans = async (search?: string, status?: string): Promise<Loan[]> => {
  const params = new URLSearchParams()
  if (search) params.append("search", search)
  if (status && status !== "all") params.append("status", status)

  const url = `/api/loans${params.toString() ? `?${params.toString()}` : ""}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Erro ao buscar empréstimos")
  }

  return response.json()
}

const renewLoan = async (id: string): Promise<void> => {
  const response = await fetch(`/api/loans/${id}/renew`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Erro ao renovar empréstimo")
  }
}

const returnLoan = async (id: string): Promise<void> => {
  const response = await fetch(`/api/loans/${id}/return`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Erro ao processar devolução")
  }
}

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: loans = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["loans", debouncedSearch, statusFilter],
    queryFn: () => fetchLoans(debouncedSearch, statusFilter),
  })

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar empréstimos")
    }
  }, [error])

  const handleRenew = async (id: string, bookTitle: string) => {
    try {
      await renewLoan(id)
      toast.success(`Empréstimo de "${bookTitle}" renovado com sucesso!`)
      refetch()
    } catch (error) {
      toast.error("Erro ao renovar empréstimo")
    }
  }

  const handleReturn = async (id: string, bookTitle: string) => {
    try {
      await returnLoan(id)
      toast.success(`"${bookTitle}" devolvido com sucesso!`)
      refetch()
    } catch (error) {
      toast.error("Erro ao processar devolução")
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "default",
      RETURNED: "secondary",
      OVERDUE: "destructive",
    }
    return colors[status as keyof typeof colors] || "default"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: "Ativo",
      RETURNED: "Devolvido",
      OVERDUE: "Atrasado",
    }
    return labels[status as keyof typeof labels] || status
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status === "ACTIVE" && new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Empréstimos</h1>
          <p className="text-gray-600">Controle empréstimos, devoluções e renovações</p>
        </div>
        <Link href="/loans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Empréstimo
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por livro, usuário ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="ACTIVE">Ativos</SelectItem>
            <SelectItem value="OVERDUE">Atrasados</SelectItem>
            <SelectItem value="RETURNED">Devolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loans.map((loan) => (
          <Card key={loan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{loan.bookTitle}</CardTitle>
                  <p className="text-sm text-gray-600 mb-2">por {loan.bookAuthor}</p>
                  <Badge variant={getStatusColor(loan.status) as any}>{getStatusLabel(loan.status)}</Badge>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{loan.userName}</p>
                    <p className="text-xs">{loan.userEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Empréstimo:</p>
                    <p className="font-medium">{new Date(loan.loanDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Vencimento:</p>
                    <p className={`font-medium ${isOverdue(loan.dueDate, loan.status) ? "text-red-600" : ""}`}>
                      {new Date(loan.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {loan.status === "ACTIVE" && (
                  <div className="text-sm">
                    <p className="text-gray-500">Dias restantes:</p>
                    <p
                      className={`font-medium ${getDaysUntilDue(loan.dueDate) < 0 ? "text-red-600" : getDaysUntilDue(loan.dueDate) <= 3 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {getDaysUntilDue(loan.dueDate) < 0
                        ? `${Math.abs(getDaysUntilDue(loan.dueDate))} dias atrasado`
                        : `${getDaysUntilDue(loan.dueDate)} dias`}
                    </p>
                  </div>
                )}

                {loan.returnDate && (
                  <div className="text-sm">
                    <p className="text-gray-500">Devolvido em:</p>
                    <p className="font-medium text-green-600">
                      {new Date(loan.returnDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}

                <div className="text-sm">
                  <p className="text-gray-500">
                    Renovações: {loan.renewalCount}/{loan.maxRenewals}
                  </p>
                </div>
              </div>

              {(loan.status === "ACTIVE" || loan.status === "OVERDUE") && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenew(loan.id, loan.bookTitle)}
                    disabled={loan.renewalCount >= loan.maxRenewals}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Renovar
                  </Button>
                  <Button size="sm" onClick={() => handleReturn(loan.id, loan.bookTitle)} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Devolver
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {loans.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum empréstimo encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros de busca ou registre um novo empréstimo.</p>
        </div>
      )}
    </div>
  )
}
