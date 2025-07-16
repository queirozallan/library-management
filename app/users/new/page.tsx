"use client"

import { useState } from "react"
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
})

type UserFormData = z.infer<typeof userSchema>

const createUser = async (data: UserFormData): Promise<void> => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Erro ao criar usuário")
  }
}

export default function NewUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const selectedMembershipType = watch("membershipType")

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      await createUser(data)
      toast.success("Usuário cadastrado com sucesso!")
      router.push("/users")
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar usuário")
    } finally {
      setIsSubmitting(false)
    }
  }

  const membershipTypes = [
    { value: "STUDENT", label: "Estudante" },
    { value: "TEACHER", label: "Professor" },
    { value: "COMMUNITY", label: "Comunidade" },
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">Cadastrar Novo Usuário</h1>
          <p className="text-gray-600">Preencha as informações do usuário</p>
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

            {/* Tipo de Membro */}
            <div className="space-y-2">
              <Label htmlFor="membershipType">Tipo de Membro *</Label>
              <Select onValueChange={(value) => setValue("membershipType", value as any)}>
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
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cadastrar Usuário
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
