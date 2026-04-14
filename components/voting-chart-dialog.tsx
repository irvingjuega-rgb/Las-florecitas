"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { Proposal, Rating, PROPOSAL_STATUSES } from "@/lib/proposals-data"
import { BarChart3, Filter } from "lucide-react"

interface VotingChartDialogProps {
  proposals: Proposal[]
  ratings: Rating[]
}

export function VotingChartDialog({ proposals, ratings }: VotingChartDialogProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const chartData = useMemo(() => {
    return proposals
      .filter(p => statusFilter === "all" || p.status === statusFilter)
      .map(p => {
        const rating = ratings.find(r => r.proposalId === p.id)
        return {
          id: p.id,
          codigo: p.codigo,
          titulo: p.titulo,
          status: p.status,
          score: rating ? parseFloat(rating.totalScore.toFixed(2)) : 0,
        }
      })
      .filter(d => d.score > 0) // Solo mostrar los que tienen calificación
      .sort((a, b) => b.score - a.score)
  }, [proposals, ratings, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "terminada":
        return "var(--color-emerald-500, #10b981)"
      case "avanzada":
        return "var(--color-blue-500, #3b82f6)"
      case "iniciada":
        return "var(--color-amber-500, #f59e0b)"
      case "pendiente":
      default:
        return "var(--color-slate-500, #64748b)"
    }
  }

  const chartConfig = {
    score: {
      label: "Calificación Total",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl shadow-sm">
          <BarChart3 className="h-4 w-4" />
          Grafica votaciones
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <DialogTitle className="text-2xl font-bold">Calificaciones de Propuestas</DialogTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-9 rounded-lg">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {PROPOSAL_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="mt-6 min-h-[400px] w-full">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <BarChart
                data={chartData}
                margin={{ top: 60, right: 30, left: 40, bottom: 60 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                <XAxis 
                  xAxisId="top"
                  orientation="top"
                  type="number" 
                  domain={[0, 5]} 
                  ticks={[0, 1, 2, 3, 4, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ 
                    value: 'CALIFICACIÓN (1-5)', 
                    position: 'top', 
                    offset: 20, 
                    fill: 'hsl(var(--foreground))', 
                    fontSize: 14, 
                    fontWeight: 700,
                    style: { textAnchor: 'middle' }
                  }}
                />
                <XAxis 
                  xAxisId="bottom"
                  orientation="bottom"
                  type="number" 
                  domain={[0, 10]} 
                  ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ 
                    value: 'CALIFICACIÓN (1-10)', 
                    position: 'bottom', 
                    offset: 20, 
                    fill: 'hsl(var(--foreground))', 
                    fontSize: 14, 
                    fontWeight: 700,
                    style: { textAnchor: 'middle' }
                  }}
                />
                <YAxis 
                  dataKey="codigo" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  label={{ 
                    value: 'PROPUESTA', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: -5, 
                    dy: 40,
                    fill: 'hsl(var(--foreground))', 
                    fontSize: 14, 
                    fontWeight: 700 
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  xAxisId="top"
                  dataKey="score" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed rounded-xl">
              <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
              <p>No hay propuestas calificadas con este filtro</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          * La gráfica muestra las propuestas que han recibido al menos una calificación, ordenadas de mayor a menor puntaje.
        </div>
      </DialogContent>
    </Dialog>
  )
}
