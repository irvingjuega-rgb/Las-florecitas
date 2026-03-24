"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Proposal, Rating, calculateTotalScore } from "@/lib/proposals-data"
import { FileText, CheckCircle2, Clock, Star, TrendingUp } from "lucide-react"
import { GlobalRatingDialog } from "./global-rating-dialog"
import { AverageRatingDialog } from "./average-rating-dialog"

interface StatsCardsProps {
  proposals: Proposal[]
  ratings: Rating[]
}

export function StatsCards({ proposals, ratings }: StatsCardsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [averageDialogOpen, setAverageDialogOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const totalProposals = proposals.filter(p => p.visible !== false).length
  const ratedProposals = ratings.length
  const completedProposals = proposals.filter(p => p.visible !== false &&
    p.status.toLowerCase() === "terminada").length
  const inProgressProposals = proposals.filter(p =>
    p.visible !== false && ["avanzada", "iniciada"].includes(p.status.toLowerCase())
  ).length

  const averageScore = ratings.length > 0
    ? ratings.reduce((sum, r) => {
        const mapOldRating = (val: number) => {
          if (val > 5) return Math.min(5, Math.ceil(val / 2))
          return Math.max(1, Math.min(5, Math.round(val)))
        }
        const cb = mapOldRating(r.costoBeneficio || 0)
        const ia = mapOldRating(r.usoIA || 0)
        const ic = mapOldRating(r.impactoCliente || 0)
        const fi = mapOldRating(r.facilidadImplementacion || 0)
        const esc = mapOldRating(r.escalabilidad || 0)
        
        const total = calculateTotalScore({
          costoBeneficio: cb,
          usoIA: ia,
          impactoCliente: ic,
          facilidadImplementacion: fi,
          escalabilidad: esc
        })
        return sum + total;
      }, 0) / ratings.length
    : 0

  const allStats = [
    {
      label: "Total Propuestas",
      value: totalProposals,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      label: "En Progreso",
      value: inProgressProposals,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Terminadas",
      value: completedProposals,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Calificadas",
      value: ratedProposals,
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      interactive: true,
    },
    {
      label: "Promedio",
      value: averageScore.toFixed(1),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      suffix: "/5",
      interactive: true,
    },
  ]

  const stats = allStats

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`border-4 ${stat.borderColor} bg-card/60 backdrop-blur-sm shadow-sm transition-all ${stat.interactive && isAdmin
              ? 'cursor-pointer hover:shadow-md hover:bg-card/80 hover:-translate-y-0.5'
              : 'hover:shadow-md'
              }`}
            onClick={() => {
              if (stat.interactive && isAdmin) {
                if (stat.label === "Calificadas") {
                  setDialogOpen(true)
                } else if (stat.label === "Promedio") {
                  setAverageDialogOpen(true)
                }
              }
            }}
          >

            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {stat.value}
                    {stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <GlobalRatingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AverageRatingDialog
        open={averageDialogOpen}
        onOpenChange={setAverageDialogOpen}
      />
    </>
  )
}
