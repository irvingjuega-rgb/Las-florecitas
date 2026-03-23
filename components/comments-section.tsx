"use client"

import { useState, useEffect } from "react"
import { Proposal } from "@/lib/proposals-data"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, User } from "lucide-react"

interface Comment {
  Id: number
  MejoraId: number
  Usuario: string
  Comentario: string
  FechaCreacion: string
}

interface CommentsSectionProps {
  proposal: Proposal
}

export function CommentsSection({ proposal }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments, proposal.id])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/comentarios?mejoraId=${proposal.id}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated || !user) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mejoraId: proposal.id,
          usuario: user.username,
          comentario: newComment.trim()
        })
      })

      if (response.ok) {
        setNewComment("")
        fetchComments()
      } else {
        alert("Error al guardar el comentario")
      }
    } catch (error) {
      console.error("Error saving comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date)
    } catch {
      return dateString
    }
  }

  if (!showComments) {
    return (
      <div className="mt-6 border-t border-border/50 pt-4 flex justify-center">
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setShowComments(true)}>
          <MessageSquare className="h-4 w-4" />
          Ver / Añadir Comentarios
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-6 border border-border/50 rounded-xl overflow-hidden shadow-sm flex flex-col bg-background">
      <div className="px-4 py-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <MessageSquare className="h-4 w-4 text-primary" />
          Comentarios
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowComments(false)}>
          Ocultar
        </Button>
      </div>

      <div className="max-h-[300px] overflow-y-auto p-4 space-y-3 bg-secondary/5">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={comment.Id || index} className="bg-card border border-border/50 rounded-xl p-3 shadow-sm text-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-2.5 w-2.5 text-primary" />
                  </div>
                  {comment.Usuario}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
                  {formatDate(comment.FechaCreacion)}
                </span>
              </div>
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed pl-6">
                {comment.Comentario}
              </p>
            </div>
          ))
        ) : (
           <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
             <MessageSquare className="h-6 w-6 opacity-20 mb-2" />
             <p className="text-sm font-medium">No hay comentarios aún</p>
           </div>
        )}
      </div>

      <div className="p-3 border-t border-border/50 bg-card">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[50px] max-h-[120px] text-sm resize-none py-2 rounded-xl focus-visible:ring-1 bg-muted/30"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting} 
              className="px-3 rounded-xl shadow-sm self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
            <p className="text-xs font-medium text-amber-600 flex items-center justify-center gap-1.5">
              <User className="h-3 w-3" />
              Inicia sesión para comentar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
