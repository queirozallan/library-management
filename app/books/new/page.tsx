"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

const bookSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  author: z.string().min(1, "Autor é obrigatório").max(100, "Nome do autor muito longo"),
  isbn: z.string().min(10, "ISBN deve ter pelo menos 10 caracteres").max(17, "ISBN muito longo"),
  publishedYear: z.number().min(1000, "Ano inválido").max(new Date().getFullYear(), "Ano não pode ser futuro"),
  genre: z.string().min(1, "Gênero é obrigatório"),
  totalCopies: z.number().min(1, "Deve ter pelo menos 1 cópia").max(100, "Muitas cópias"),
  description: z.string().optional(),
})

type BookFormData = z.infer<typeof bookSchema>

const createBook = async (data: BookFormData): Promise<void> => {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Erro ao criar livro")
  }
}

export default function NewBookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      totalCopies: 1,
      publishedYear: new Date().getFullYear(),
    },
  })

  const selectedGenre = watch("genre")

  const onSubmit = async (data: BookFormData) => {
    setIsSubmitting(true)
    try {
      await createBook(data)
      toast.success("Livro adicionado com sucesso!")
      router.push("/books")
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar livro")
    } finally {
      setIsSubmitting(false)
    }
  }

  const genres = [
    "Ficção",
    "Não-ficção",
    "Fantasia",
    "Romance",
    "Mistério",
    "Tecnologia",
    "História",
    "Biografia",
    "Ciência",
    "Autoajuda",
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/books">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Novo Livro</h1>
          <p className="text-gray-600">Preencha as informações do livro</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Livro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" {...register("title")} placeholder="Digite o título do livro" />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Autor */}
            <div className="space-y-2">
              <Label htmlFor="author">Autor *</Label>
              <Input id="author" {...register("author")} placeholder="Digite o nome do autor" />
              {errors.author && <p className="text-sm text-red-600">{errors.author.message}</p>}
            </div>

            {/* ISBN */}
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input id="isbn" {...register("isbn")} placeholder="978-0000000000" />
              {errors.isbn && <p className="text-sm text-red-600">{errors.isbn.message}</p>}
            </div>

            {/* Ano e Gênero */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishedYear">Ano de Publicação *</Label>
                <Input id="publishedYear" type="number" {...register("publishedYear", { valueAsNumber: true })} />
                {errors.publishedYear && <p className="text-sm text-red-600">{errors.publishedYear.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Gênero *</Label>
                <Select onValueChange={(value) => setValue("genre", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.genre && <p className="text-sm text-red-600">{errors.genre.message}</p>}
              </div>
            </div>

            {/* Total de Cópias */}
            <div className="space-y-2">
              <Label htmlFor="totalCopies">Total de Cópias *</Label>
              <Input
                id="totalCopies"
                type="number"
                min="1"
                max="100"
                {...register("totalCopies", { valueAsNumber: true })}
              />
              {errors.totalCopies && <p className="text-sm text-red-600">{errors.totalCopies.message}</p>}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Breve descrição do livro..."
                rows={4}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Link href="/books" className="flex-1">
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
                    Salvar Livro
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
