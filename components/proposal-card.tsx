"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Proposal, Rating } from "@/lib/proposals-data"
import { useAuth } from "@/contexts/auth-context"
import { Users, Calendar, Target, CheckCircle2, Clock, AlertCircle, Sparkles, Star, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProposalCardProps {
  proposal: Proposal
  rating?: Rating
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
        dot: "bg-emerald-500"
      }
    case "avanzada":
      return {
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/30",
        hoverBorder: "hover:border-primary",
        dot: "bg-primary"
      }
    case "iniciada":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-600",
        border: "border-amber-500/30",
        hoverBorder: "hover:border-amber-500",
        dot: "bg-amber-500"
      }
    case "pendiente":
    default:
      return {
        bg: "bg-muted",
        text: "text-muted-foreground",
        border: "border-muted-foreground/30",
        hoverBorder: "hover:border-muted-foreground/60",
        dot: "bg-muted-foreground"
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

export function ProposalCard({ proposal, rating, onClick, onToggleVisibility }: ProposalCardProps) {
  const statusStyles = getStatusStyles(proposal.status)
  const { isAuthenticated } = useAuth()

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
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onToggleVisibility}
                title={proposal.visible === false ? "Mostrar propuesta" : "Ocultar propuesta"}
              >
                {proposal.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

        <div className="space-y-2.5">
          {isAuthenticated && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="truncate font-medium">{proposal.quienPropone}</span>
            </div>
          )}

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

        {rating && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-medium text-muted-foreground">Calificacion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                    style={{ width: `${(rating.totalScore / 10) * 100}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {rating.totalScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
