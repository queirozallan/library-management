"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  publishedYear: number
  genre: string
  totalCopies: number
  availableCopies: number
  description?: string
  createdAt: string
  updatedAt: string
}

const fetchBooks = async (search?: string): Promise<Book[]> => {
  const url = search ? `/api/books?search=${encodeURIComponent(search)}` : "/api/books"
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Erro ao buscar livros")
  }

  return response.json()
}

const deleteBook = async (id: string): Promise<void> => {
  const response = await fetch(`/api/books/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Erro ao excluir livro")
  }
}

export default function BooksPage() {
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
    data: books = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["books", debouncedSearch],
    queryFn: () => fetchBooks(debouncedSearch),
  })

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar livros")
    }
  }, [error])

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      try {
        await deleteBook(id)
        toast.success("Livro excluído com sucesso!")
        refetch()
      } catch (error) {
        toast.error("Erro ao excluir livro")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Livros</h1>
          <p className="text-gray-600">Gerencie o acervo da biblioteca</p>
        </div>
        <Link href="/books/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Livro
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por título, autor ou gênero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{book.title}</CardTitle>
                  <p className="text-sm text-gray-600 mb-2">por {book.author}</p>
                  <Badge variant={book.availableCopies > 0 ? "default" : "destructive"}>
                    {book.availableCopies > 0 ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <strong>ISBN:</strong> {book.isbn}
                </p>
                <p>
                  <strong>Ano:</strong> {book.publishedYear}
                </p>
                <p>
                  <strong>Gênero:</strong> {book.genre}
                </p>
                <p>
                  <strong>Cópias:</strong> {book.availableCopies}/{book.totalCopies} disponíveis
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/books/${book.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(book.id, book.title)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum livro encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros de busca ou adicione um novo livro.</p>
        </div>
      )}
    </div>
  )
}
