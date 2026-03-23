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
import { Proposal, ratingCriteria, Rating, calculateTotalScore, getProposalImages, RATING_SCALE_OPTIONS } from "@/lib/proposals-data"
import { useAuth } from "@/contexts/auth-context"
import { Users, Target, Calendar, Building, CheckCircle2, Lightbulb, Save, RotateCcw, Info, Edit, Maximize2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { CommentsSection } from "@/components/comments-section"

interface RatingDialogProps {
  proposal: Proposal | null
  existingRating?: Rating
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (rating: Omit<Rating, 'totalScore'>) => void | Promise<void>
}

export function RatingDialog({ proposal, existingRating, open, onOpenChange, onSave }: RatingDialogProps) {
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [isSaving, setIsSaving] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [ratings, setRatings] = useState({
    costoBeneficio: 5,
    usoIA: 5,
    impactoCliente: 5,
    facilidadImplementacion: 5,
    escalabilidad: 5,
  })

  useEffect(() => {
    if (existingRating) {
      const mapOldRating = (val: number) => {
        if (val > 5) return Math.min(5, Math.ceil(val / 2))
        return Math.max(1, Math.min(5, Math.round(val)))
      }
      setRatings({
        costoBeneficio: mapOldRating(existingRating.costoBeneficio),
        usoIA: mapOldRating(existingRating.usoIA),
        impactoCliente: mapOldRating(existingRating.impactoCliente),
        facilidadImplementacion: mapOldRating(existingRating.facilidadImplementacion),
        escalabilidad: mapOldRating(existingRating.escalabilidad),
      })
    } else {
      setRatings({
        costoBeneficio: 3,
        usoIA: 3,
        impactoCliente: 3,
        facilidadImplementacion: 3,
        escalabilidad: 3,
      })
    }
  }, [existingRating, proposal])

  if (!proposal) return null

  const totalScore = calculateTotalScore(ratings)
  const images = getProposalImages(proposal.imagen)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (typeof onSave === 'function') {
        await Promise.resolve(onSave({
          proposalId: proposal.id,
          ...ratings,
        }))
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving rating:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setRatings({
      costoBeneficio: 3,
      usoIA: 3,
      impactoCliente: 3,
      facilidadImplementacion: 3,
      escalabilidad: 3,
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              {isAdmin && (
                <div className="ml-auto">
                  <Link href={`/mejoras/${proposal.id}/editar`}>
                    <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-medium">
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <DialogTitle className="text-xl leading-tight pr-8">
              {proposal.titulo || "Sin titulo"}
            </DialogTitle>

            {proposal.situacionActual && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Situación Actual:</h4>
                <DialogDescription className="text-sm text-foreground">
                  {proposal.situacionActual}
                </DialogDescription>
              </div>
            )}

            <div className={proposal.situacionActual ? "mt-4" : "mt-2"}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Propuesta:</h4>
              <DialogDescription className="text-sm text-muted-foreground">
                {proposal.descripcion || "Sin descripcion disponible"}
              </DialogDescription>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Beneficios:</h4>
              <DialogDescription className="text-sm text-muted-foreground">
                {proposal.Beneficios || "Sin beneficios registrados"}
              </DialogDescription>
            </div>

            {images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Imágenes de respaldo:</h4>
                <div className="relative group">
                  {images.length === 1 ? (
                    <div
                      className="relative overflow-hidden rounded-xl border bg-muted/20 cursor-pointer"
                      onClick={() => setZoomedImage(images[0])}
                    >
                      <img
                        src={images[0]}
                        alt={`Imagen de la propuesta ${proposal.codigo}`}
                        className="max-h-80 w-full object-contain bg-background"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-none shadow-lg"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {images.map((img, index) => (
                          <CarouselItem key={index}>
                            <div
                              className="relative overflow-hidden rounded-xl border bg-muted/20 cursor-pointer"
                              onClick={() => setZoomedImage(img)}
                            >
                              <img
                                src={img}
                                alt={`Imagen ${index + 1} de la propuesta ${proposal.codigo}`}
                                className="max-h-80 w-full object-contain bg-background"
                              />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-none shadow-lg"
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <CarouselPrevious className="relative left-0 translate-y-0 h-8 w-8" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Gallería de {images.length} imágenes
                        </span>
                        <CarouselNext className="relative right-0 translate-y-0 h-8 w-8" />
                      </div>
                    </Carousel>
                  )}
                </div>
              </div>
            )}
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
                <span>
                  {(() => {
                    if (!proposal.fechaInicio) return "";
                    try {
                      const date = new Date(proposal.fechaInicio);
                      const timeZoneOffset = date.getTimezoneOffset() * 60000;
                      const localDate = new Date(date.getTime() + timeZoneOffset);
                      return localDate.toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                    } catch (e) {
                      return proposal.fechaInicio;
                    }
                  })()}
                </span>
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
              <span>Califica cada criterio del 1 al 5 ("Insuficiente" a "Sobresaliente"). La puntuacion total se calcula segun los pesos establecidos.</span>
            </div>

            {ratingCriteria.map((criterion) => (
              <div key={criterion.id} className="space-y-3 bg-card border border-border/40 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {criteriaIcons[criterion.id as keyof typeof criteriaIcons]}
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{criterion.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({(criterion.weight * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
                    <span className="text-xl font-bold text-primary">
                      {ratings[criterion.id as keyof typeof ratings]}
                    </span>
                    <span className="text-xs text-primary/70 font-medium">/ 5</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {RATING_SCALE_OPTIONS.map((option) => {
                    const isSelected = ratings[criterion.id as keyof typeof ratings] === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={() => setRatings(prev => ({ ...prev, [criterion.id]: option.value }))}
                        className={`
                          flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all group
                          ${isSelected 
                            ? 'border-primary bg-primary/10 shadow-sm' 
                            : 'border-border/40 bg-muted/20 hover:border-primary/50 hover:bg-muted/50'
                          }
                        `}
                      >
                        <span className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                          {option.value}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight mt-1 ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/80'}`}>
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/30">
                  <span className="font-semibold text-foreground/80 mr-1">
                    {RATING_SCALE_OPTIONS.find(o => o.value === ratings[criterion.id as keyof typeof ratings])?.label}:
                  </span>
                  {RATING_SCALE_OPTIONS.find(o => o.value === ratings[criterion.id as keyof typeof ratings])?.description}
                </div>
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
                <span className="text-lg text-muted-foreground ml-1">/ 5</span>
              </div>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={handleReset} className="gap-2" disabled={isSaving}>
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>
              <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Guardando..." : "Guardar Calificacion"}
              </Button>
            </div>
          )}
          
          <CommentsSection proposal={proposal} />
        </DialogContent>
      </Dialog >

      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden border-none bg-transparent shadow-none flex items-center justify-center">
          <DialogHeader className="sr-only">
            <DialogTitle>Vista ampliada de imagen</DialogTitle>
            <DialogDescription>
              Imagen de respaldo de la propuesta {proposal.codigo}
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center group">
            {zoomedImage && (
              <img
                src={zoomedImage}
                alt="Imagen ampliada"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all"
              onClick={() => setZoomedImage(null)}
            >
              <Maximize2 className="h-5 w-5 rotate-45" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
