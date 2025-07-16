"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(15, "Telefone muito longo"),
  membershipType: z.enum(["STUDENT", "TEACHER", "COMMUNITY"], {
    required_error: "Tipo de membro é obrigatório",
  }),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
    required_error: "Status é obrigatório",
  }),
})

type UserFormData = z.infer<typeof userSchema>

interface User extends UserFormData {
  id: string
  joinDate: string
  activeLoans: number
}

const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) {
    throw new Error("Erro ao buscar usuário")
  }
  return response.json()
}

const updateUser = async (id: string, data: UserFormData): Promise<void> => {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Erro ao atualizar usuário")
  }
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const selectedMembershipType = watch("membershipType")
  const selectedStatus = watch("status")

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchUser(params.id)
        reset({
          name: user.name,
          email: user.email,
          phone: user.phone,
          membershipType: user.membershipType,
          status: user.status,
        })
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar usuário")
        router.push("/users")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [params.id, reset, router])

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      await updateUser(params.id, data)
      toast.success("Usuário atualizado com sucesso!")
      router.push("/users")
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar usuário")
    } finally {
      setIsSubmitting(false)
    }
  }

  const membershipTypes = [
    { value: "STUDENT", label: "Estudante" },
    { value: "TEACHER", label: "Professor" },
    { value: "COMMUNITY", label: "Comunidade" },
  ]

  const statusOptions = [
    { value: "ACTIVE", label: "Ativo" },
    { value: "INACTIVE", label: "Inativo" },
    { value: "SUSPENDED", label: "Suspenso" },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuário</h1>
          <p className="text-gray-600">Atualize as informações do usuário</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input id="name" {...register("name")} placeholder="Digite o nome completo" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="usuario@email.com" />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" {...register("phone")} placeholder="(11) 99999-9999" />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* Tipo de Membro e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="membershipType">Tipo de Membro *</Label>
                <Select
                  value={selectedMembershipType}
                  onValueChange={(value) => setValue("membershipType", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.membershipType && <p className="text-sm text-red-600">{errors.membershipType.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={selectedStatus} onValueChange={(value) => setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-600">{errors.status.message}</p>}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Link href="/users" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Atualizar Usuário
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
