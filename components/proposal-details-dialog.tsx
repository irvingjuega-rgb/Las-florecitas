"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Proposal, ratingCriteria } from "@/lib/proposals-data"
import { User, MessageSquare, Star, BarChart3, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface Comment {
  Id: number
  MejoraId: number
  Usuario: string
  Comentario: string
  FechaCreacion: string
}

interface RatingDetail {
  costoBeneficio: number
  usoIA: number
  impactoCliente: number
  facilidadImplementacion: number
  escalabilidad: number
  username: string
  createdAt: string
}

interface ProposalDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposal: Proposal | null
}

export function ProposalDetailsDialog({
  open,
  onOpenChange,
  proposal,
}: ProposalDetailsDialogProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [ratings, setRatings] = useState<RatingDetail[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && proposal) {
      setLoading(true)
      Promise.all([
        fetch(`/api/comentarios?mejoraId=${proposal.id}`).then(res => res.json()),
        fetch(`/api/calificaciones/detalles?proposalId=${proposal.id}`).then(res => res.json())
      ])
        .then(([commentsData, ratingsData]) => {
          if (commentsData.ok) setComments(commentsData.data || [])
          if (ratingsData.ok) {
             // Filtrar solo las del proposal actual si la API no lo hace
             const allRatings = ratingsData.data || []
             setRatings(allRatings.filter((r: any) => r.proposalId === proposal.id))
          }
        })
        .finally(() => setLoading(false))
    }
  }, [open, proposal])

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

  const getAverageByCriterion = (criterion: string) => {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((acc, r) => acc + (Number(r[criterion as keyof RatingDetail]) || 0), 0)
    return sum / ratings.length
  }

  if (!proposal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-card border-border/50">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-primary border-primary/30 px-2 py-0.5 rounded-lg font-mono">
              {proposal.codigo}
            </Badge>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 px-2 py-0.5 rounded-lg border-none">
              {proposal.status}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold leading-tight">{proposal.titulo}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            Propuesto por: <span className="font-semibold text-foreground">{proposal.quienPropone}</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Sección de Criterios */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg uppercase tracking-wider text-primary/80">Desglose de Calificaciones</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ratingCriteria.map((criterion) => {
                  const avg = getAverageByCriterion(criterion.id)
                  return (
                    <div key={criterion.id} className="bg-secondary/20 border border-border/50 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">{criterion.label}</span>
                        <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-xl border border-border/50 shadow-sm">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-lg font-bold text-primary tabular-nums">{avg.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/20">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                          style={{ width: `${(avg / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 italic">
                * El promedio se calcula con base en {ratings.length} {ratings.length === 1 ? 'evaluación recibida' : 'evaluaciones recibidas'}.
              </p>
            </section>

            <Separator className="bg-border/50" />

            {/* Sección de Comentarios */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg uppercase tracking-wider text-primary/80">Comentarios y Observaciones</h3>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length > 0 ? (
                <div className="grid gap-4">
                  {comments.map((comment) => (
                    <div key={comment.Id} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm transition-all hover:bg-muted/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-primary">
                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {comment.Usuario}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                          <Clock className="h-3 w-3" />
                          {formatDate(comment.FechaCreacion)}
                        </div>
                      </div>
                      <Separator className="my-2 bg-border/30" />
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pl-1 pt-1">
                        {comment.Comentario}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/5">
                  <MessageSquare className="h-12 w-12 opacity-10 mb-3" />
                  <p className="text-sm font-medium">No se han registrado comentarios para esta propuesta.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
