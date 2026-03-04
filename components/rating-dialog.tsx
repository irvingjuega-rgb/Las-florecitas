"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Proposal, ratingCriteria, Rating, calculateTotalScore } from "@/lib/proposals-data"
import { Users, Target, Calendar, Building, CheckCircle2, Lightbulb, Save, RotateCcw, Info } from "lucide-react"

interface RatingDialogProps {
  proposal: Proposal | null
  existingRating?: Rating
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (rating: Omit<Rating, 'totalScore'>) => void
}

export function RatingDialog({ proposal, existingRating, open, onOpenChange, onSave }: RatingDialogProps) {
  const [ratings, setRatings] = useState({
    costoBeneficio: 5,
    usoIA: 5,
    impactoCliente: 5,
    facilidadImplementacion: 5,
    escalabilidad: 5,
  })

  useEffect(() => {
    if (existingRating) {
      setRatings({
        costoBeneficio: existingRating.costoBeneficio,
        usoIA: existingRating.usoIA,
        impactoCliente: existingRating.impactoCliente,
        facilidadImplementacion: existingRating.facilidadImplementacion,
        escalabilidad: existingRating.escalabilidad,
      })
    } else {
      setRatings({
        costoBeneficio: 5,
        usoIA: 5,
        impactoCliente: 5,
        facilidadImplementacion: 5,
        escalabilidad: 5,
      })
    }
  }, [existingRating, proposal])

  if (!proposal) return null

  const totalScore = calculateTotalScore(ratings)

  const handleSave = () => {
    onSave({
      proposalId: proposal.id,
      ...ratings,
    })
    onOpenChange(false)
  }

  const handleReset = () => {
    setRatings({
      costoBeneficio: 5,
      usoIA: 5,
      impactoCliente: 5,
      facilidadImplementacion: 5,
      escalabilidad: 5,
    })
  }

  const criteriaIcons = {
    costoBeneficio: <span className="text-base">$</span>,
    usoIA: <Lightbulb className="h-4 w-4" />,
    impactoCliente: <CheckCircle2 className="h-4 w-4" />,
    facilidadImplementacion: <Building className="h-4 w-4" />,
    escalabilidad: <Target className="h-4 w-4" />,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-1 rounded">
              {proposal.codigo}
            </span>
            {proposal.tipo && (
              <Badge variant="outline" className="text-xs">
                {proposal.tipo}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {proposal.status}
            </Badge>
          </div>
          <DialogTitle className="text-xl leading-tight pr-8">
            {proposal.titulo || "Sin titulo"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {proposal.descripcion || "Sin descripcion disponible"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4 text-sm border-y">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-primary/70" />
            <span className="font-medium">Propone:</span>
            <span className="truncate">{proposal.quienPropone}</span>
          </div>
          {proposal.proceso && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4 text-primary/70" />
              <span className="font-medium">Proceso:</span>
              <span className="truncate">{proposal.proceso}</span>
            </div>
          )}
          {proposal.equipoMultidisciplinario && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Building className="h-4 w-4 text-primary/70" />
              <span className="font-medium">Equipo:</span>
              <span className="truncate">{proposal.equipoMultidisciplinario}</span>
            </div>
          )}
          {proposal.fechaInicio && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary/70" />
              <span className="font-medium">Inicio:</span>
              <span>{proposal.fechaInicio}</span>
            </div>
          )}
          {proposal.impactaA && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary/70" />
              <span className="font-medium">Impacta:</span>
              <span className="truncate">{proposal.impactaA}</span>
            </div>
          )}
        </div>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Info className="h-4 w-4 shrink-0" />
            <span>Califica cada criterio del 1 al 10. La puntuacion total se calcula segun los pesos establecidos.</span>
          </div>

          {ratingCriteria.map((criterion) => (
            <div key={criterion.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {criteriaIcons[criterion.id as keyof typeof criteriaIcons]}
                  </div>
                  <div>
                    <span className="font-medium text-sm">{criterion.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({(criterion.weight * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary w-8 text-right">
                    {ratings[criterion.id as keyof typeof ratings]}
                  </span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </div>
              <Slider
                value={[ratings[criterion.id as keyof typeof ratings]]}
                onValueChange={(value) => 
                  setRatings(prev => ({ ...prev, [criterion.id]: value[0] }))
                }
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Puntuacion Total Ponderada</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Basada en los criterios y sus pesos
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-primary">{totalScore.toFixed(2)}</span>
              <span className="text-lg text-muted-foreground ml-1">/10</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Calificacion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
