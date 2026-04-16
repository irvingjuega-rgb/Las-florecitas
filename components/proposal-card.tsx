"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Proposal, Rating, getProposalImages } from "@/lib/proposals-data"
import { useAuth } from "@/contexts/auth-context"
import { Users, Calendar, Target, CheckCircle2, Clock, AlertCircle, Sparkles, Star, Trash2, ArchiveRestore, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProposalCardProps {
  proposal: Proposal
  rating?: Rating
  globalRating?: Rating
  onClick: () => void
  onToggleVisibility?: (e: React.MouseEvent) => void
}

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "terminada":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600",
        border: "border-emerald-500/30",
        hoverBorder: "hover:border-emerald-500",
        dot: "bg-emerald-500",
        separator: "border-emerald-500/20"
      }
    case "avanzada":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-600",
        border: "border-blue-500/30",
        hoverBorder: "hover:border-blue-500",
        dot: "bg-blue-500",
        separator: "border-blue-500/20"
      }
    case "iniciada":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-600",
        border: "border-amber-500/30",
        hoverBorder: "hover:border-amber-500",
        dot: "bg-amber-500",
        separator: "border-amber-500/20"
      }
    case "pendiente":
    default:
      return {
        bg: "bg-slate-500/10",
        text: "text-slate-600",
        border: "border-slate-500/30",
        hoverBorder: "hover:border-slate-500/60",
        dot: "bg-slate-500",
        separator: "border-slate-500/20"
      }
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "terminada":
      return <CheckCircle2 className="h-3.5 w-3.5" />
    case "avanzada":
      return <Sparkles className="h-3.5 w-3.5" />
    case "iniciada":
      return <Clock className="h-3.5 w-3.5" />
    case "pendiente":
    default:
      return <AlertCircle className="h-3.5 w-3.5" />
  }
}

export function ProposalCard({ proposal, rating, globalRating, onClick, onToggleVisibility }: ProposalCardProps) {
  const statusStyles = getStatusStyles(proposal.status)
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const images = getProposalImages(proposal.imagen)

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Ajuste para evitar problemas de zona horaria aislando año, mes y día
      const timeZoneOffset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() + timeZoneOffset);

      return localDate.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-4 ${statusStyles.border} ${statusStyles.hoverBorder} group bg-card/80 backdrop-blur-sm overflow-hidden ${proposal.visible === false ? 'opacity-60 saturate-50' : ''}`}
      onClick={onClick}
    >
      <div className={`h-1 w-full ${statusStyles.dot}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              {proposal.codigo}
            </span>
            {proposal.tipo && (
              <Badge variant="outline" className="text-xs rounded-lg border-border/50">
                {proposal.tipo}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 text-muted-foreground transition-colors ${proposal.visible === false ? "hover:text-amber-500 hover:bg-amber-500/10" : "hover:text-destructive hover:bg-destructive/10"}`}
                onClick={onToggleVisibility}
                title={proposal.visible === false ? "Restaurar propuesta" : "Mover a papelera"}
              >
                {proposal.visible === false ? <ArchiveRestore className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            )}
            <Badge className={`${statusStyles.bg} ${statusStyles.text} flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1`}>
              {getStatusIcon(proposal.status)}
              {proposal.status || "Sin estado"}
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-3 text-balance">
          {proposal.titulo || "Sin titulo"}
        </h3>

        {images.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-hidden">
            {images.slice(0, 3).map((img, idx) => (
              <div
                key={idx}
                className={`relative rounded-lg overflow-hidden border bg-muted/20 ${images.length === 1 ? 'w-full aspect-video h-24' :
                    images.length === 2 ? 'w-1/2 aspect-square h-20' :
                      'w-1/3 aspect-square h-16'
                  }`}
              >
                <img
                  src={img}
                  alt={`${proposal.titulo} ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {idx === 2 && images.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white text-[10px] font-bold">
                    +{images.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {proposal.situacionActual && (
          <div className="mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Situación Actual:</span>
            <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
              {proposal.situacionActual}
            </p>
          </div>
        )}

        <div className="mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Propuesta:</span>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {proposal.descripcion || "Sin descripcion disponible"}
          </p>
        </div>

        <div className="mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Beneficios:</span>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {proposal.Beneficios || "Sin beneficios registrados"}
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="truncate font-medium">{proposal.quienPropone}</span>
          </div>

          {proposal.proceso && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="truncate">{proposal.proceso}</span>
            </div>
          )}

          {proposal.fechaInicio && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>{formatDate(proposal.fechaInicio)}</span>
            </div>
          )}
        </div>

        {(rating || (isAdmin && globalRating)) && (
          <div className={`mt-4 pt-4 border-t ${statusStyles.separator} space-y-2`}>
            {rating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tu Calificacion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(rating.totalScore / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {rating.totalScore.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {isAdmin && globalRating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Promedio Global</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(globalRating.totalScore / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-blue-600 tabular-nums">
                    {globalRating.totalScore.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
