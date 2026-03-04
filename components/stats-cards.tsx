"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Proposal, Rating } from "@/lib/proposals-data"
import { FileText, CheckCircle2, Clock, Star, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  proposals: Proposal[]
  ratings: Rating[]
}

export function StatsCards({ proposals, ratings }: StatsCardsProps) {
  const totalProposals = proposals.length
  const ratedProposals = ratings.length
  const completedProposals = proposals.filter(p => p.status.toLowerCase() === "terminada").length
  const inProgressProposals = proposals.filter(p => 
    ["avanzada", "iniciada"].includes(p.status.toLowerCase())
  ).length
  
  const averageScore = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.totalScore, 0) / ratings.length
    : 0

  const stats = [
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
    },
    {
      label: "Promedio",
      value: averageScore.toFixed(1),
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      suffix: "/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`border ${stat.borderColor} bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}>
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
  )
}
