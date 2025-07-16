"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Edit, Trash2, Plus, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

interface User {
  id: string
  name: string
  email: string
  phone: string
  membershipType: "STUDENT" | "TEACHER" | "COMMUNITY"
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  joinDate: string
  activeLoans: number
}

const fetchUsers = async (search?: string): Promise<User[]> => {
  const url = search ? `/api/users?search=${encodeURIComponent(search)}` : "/api/users"
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Erro ao buscar usuários")
  }

  return response.json()
}

const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Erro ao excluir usuário")
  }
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: users = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["users", debouncedSearch],
    queryFn: () => fetchUsers(debouncedSearch),
  })

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar usuários")
    }
  }, [error])

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      try {
        await deleteUser(id)
        toast.success("Usuário excluído com sucesso!")
        refetch()
      } catch (error) {
        toast.error("Erro ao excluir usuário")
      }
    }
  }

  const getMembershipTypeLabel = (type: string) => {
    const labels = {
      STUDENT: "Estudante",
      TEACHER: "Professor",
      COMMUNITY: "Comunidade",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      SUSPENDED: "destructive",
    }
    return colors[status as keyof typeof colors] || "default"
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: "Ativo",
      INACTIVE: "Inativo",
      SUSPENDED: "Suspenso",
    }
    return labels[status as keyof typeof labels] || status
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Usuários</h1>
          <p className="text-gray-600">Gerencie os membros da biblioteca</p>
        </div>
        <Link href="/users/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Usuário
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou tipo de membro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{user.name}</CardTitle>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{getMembershipTypeLabel(user.membershipType)}</Badge>
                    <Badge variant={getStatusColor(user.status) as any}>{getStatusLabel(user.status)}</Badge>
                  </div>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Membro desde:</strong> {new Date(user.joinDate).toLocaleDateString("pt-BR")}
                  </p>
                  <p>
                    <strong>Empréstimos ativos:</strong> {user.activeLoans}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/users/${user.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user.id, user.name)}
                  disabled={user.activeLoans > 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {user.activeLoans > 0 && (
                <p className="text-xs text-orange-600 mt-2">Não é possível excluir usuário com empréstimos ativos</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros de busca ou cadastre um novo usuário.</p>
        </div>
      )}
    </div>
  )
}
