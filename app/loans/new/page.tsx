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
import { ArrowLeft, Save, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

const loanSchema = z.object({
  userId: z.string().min(1, "Usuário é obrigatório"),
  bookId: z.string().min(1, "Livro é obrigatório"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
})

type LoanFormData = z.infer<typeof loanSchema>

interface User {
  id: string
  name: string
  email: string
  status: string
}

interface Book {
  id: string
  title: string
  author: string
  availableCopies: number
}

const fetchUsers = async (search?: string): Promise<User[]> => {
  const url = search ? `/api/users?search=${encodeURIComponent(search)}&status=ACTIVE` : "/api/users?status=ACTIVE"
  const response = await fetch(url)
  if (!response.ok) throw new Error("Erro ao buscar usuários")
  return response.json()
}

const fetchBooks = async (search?: string): Promise<Book[]> => {
  const url = search ? `/api/books?search=${encodeURIComponent(search)}&available=true` : "/api/books?available=true"
  const response = await fetch(url)
  if (!response.ok) throw new Error("Erro ao buscar livros")
  return response.json()
}

const createLoan = async (data: LoanFormData): Promise<void> => {
  const response = await fetch("/api/loans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Erro ao criar empréstimo")
  }
}

export default function NewLoanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [bookSearch, setBookSearch] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingBooks, setLoadingBooks] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days from now
    },
  })

  const selectedUserId = watch("userId")
  const selectedBookId = watch("bookId")

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true)
      try {
        const data = await fetchUsers(userSearch)
        setUsers(data)
      } catch (error) {
        toast.error("Erro ao carregar usuários")
      } finally {
        setLoadingUsers(false)
      }
    }

    const timer = setTimeout(loadUsers, 300)
    return () => clearTimeout(timer)
  }, [userSearch])

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      setLoadingBooks(true)
      try {
        const data = await fetchBooks(bookSearch)
        setBooks(data)
      } catch (error) {
        toast.error("Erro ao carregar livros")
      } finally {
        setLoadingBooks(false)
      }
    }

    const timer = setTimeout(loadBooks, 300)
    return () => clearTimeout(timer)
  }, [bookSearch])

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true)
    try {
      await createLoan(data)
      toast.success("Empréstimo criado com sucesso!")
      router.push("/loans")
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar empréstimo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedUser = users.find((u) => u.id === selectedUserId)
  const selectedBook = books.find((b) => b.id === selectedBookId)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/loans">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Empréstimo</h1>
          <p className="text-gray-600">Registre um novo empréstimo de livro</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Empréstimo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Usuário */}
            <div className="space-y-2">
              <Label htmlFor="userId">Usuário *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar usuário por nome ou email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select onValueChange={(value) => setValue("userId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingUsers ? (
                      <SelectItem value="loading" disabled>
                        Carregando...
                      </SelectItem>
                    ) : users.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Nenhum usuário encontrado
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {errors.userId && <p className="text-sm text-red-600">{errors.userId.message}</p>}
              {selectedUser && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              )}
            </div>

            {/* Livro */}
            <div className="space-y-2">
              <Label htmlFor="bookId">Livro *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar livro por título ou autor..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select onValueChange={(value) => setValue("bookId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingBooks ? (
                      <SelectItem value="loading" disabled>
                        Carregando...
                      </SelectItem>
                    ) : books.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Nenhum livro disponível
                      </SelectItem>
                    ) : (
                      books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} - {book.author} ({book.availableCopies} disponíveis)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {errors.bookId && <p className="text-sm text-red-600">{errors.bookId.message}</p>}
              {selectedBook && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium">{selectedBook.title}</p>
                  <p className="text-sm text-gray-600">por {selectedBook.author}</p>
                  <p className="text-sm text-gray-600">{selectedBook.availableCopies} cópias disponíveis</p>
                </div>
              )}
            </div>

            {/* Data de Vencimento */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-sm text-red-600">{errors.dueDate.message}</p>}
              <p className="text-sm text-gray-500">Prazo padrão: 14 dias</p>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Link href="/loans" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Empréstimo
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
