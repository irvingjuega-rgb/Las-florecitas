"use client"

import { useState, useMemo, useEffect } from "react"
import { Proposal, PROPOSAL_STATUSES } from "@/lib/proposals-data"
import { useRatings } from "@/hooks/use-ratings"
import { ProposalCard } from "@/components/proposal-card"
import { RatingDialog } from "@/components/rating-dialog"
import { StatsCards } from "@/components/stats-cards"
import { LoginDialog } from "@/components/login-dialog"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, LayoutGrid, List, Sparkles, Target, Plus, LogIn, LogOut, Trash2, ArchiveRestore } from "lucide-react"
import Link from "next/link"

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [proposalsLoaded, setProposalsLoaded] = useState(false)

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [processFilter, setProcessFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("codigo_asc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<"activas" | "papelera">("activas")
  const [loginOpen, setLoginOpen] = useState(false)
  const [isMock, setIsMock] = useState(false)

  const { ratings, isLoaded: ratingsLoaded, saveRating, getRating } = useRatings()
  const { isAuthenticated, isLoaded: authLoaded, logout, user } = useAuth()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    async function fetchProposals() {
      try {
        const timestamp = Date.now()
        const baseUrl = isAuthenticated ? '/api/mejoras?includeHidden=true' : '/api/mejoras'
        const url = baseUrl.includes('?') ? `${baseUrl}&t=${timestamp}` : `${baseUrl}?t=${timestamp}`

        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        })
        if (!response.ok) throw new Error('Error fetching proposals')
        const data = await response.json()

        if (data.isMock) setIsMock(true)
        else setIsMock(false)

        // Mapear los datos de SQL a nuestra interfaz de Proposal 
        // ya que la API puede devolver nombres de columna diferentes
        if (data.ok && Array.isArray(data.data)) {
          const mappedProposals: Proposal[] = data.data.map((item: any) => ({
            id: item.Id?.toString() || "",
            codigo: item.Codigo || "",
            titulo: item.Titulo_Mejora || "",
            quienPropone: item.Quien_Propone || "",
            descripcion: item.Descripcion_Propuesta || "",
            equipoMultidisciplinario: item.Equipo_Multidisciplinario || "",
            factible: item.Factible ? "SI" : "NO",
            prioridad: item.Prioridad || "",
            tipo: item.Tipo || "",
            proceso: item.Proceso || "",
            status: item.Status || "Pendiente",
            fechaEntrada: item.Fecha_Entrada || "",
            fechaInicio: item.Fecha_Inicio || "",
            fechaTermino: item.Fecha_Termino || "",
            impactaA: item.Impacta_A || "",
            observaciones: item.Observaciones || "",
            situacionActual: item.Situacion_Actual || "",
            imagen: item.Imagen || "",
            formatoA3: item.Formato_A3 || "",
            Beneficios: item.Beneficios || "",
            visible: item.Visible !== false
          }))
          setProposals(mappedProposals)
        }
      } catch (error) {
        console.error("Failed to fetch proposals:", error)
      } finally {
        setProposalsLoaded(true)
      }
    }

    fetchProposals()
  }, [isAuthenticated])

  const uniqueProcesses = useMemo(() => {
    const processes = new Set<string>()
    proposals.forEach(p => {
      if (p.proceso) {
        // Split by comma and trim each department
        const departments = p.proceso.split(/[,،]/).map(d => d.trim()).filter(Boolean)
        departments.forEach(dept => processes.add(dept))
      }
    })
    return Array.from(processes).sort()
  }, [proposals])

  const filteredProposals = useMemo(() => {
    let result = proposals.filter(proposal => {
      if (activeTab === "papelera") {
        if (proposal.visible !== false) return false
      } else {
        if (proposal.visible === false) return false
      }

      const matchesSearch = searchQuery === "" ||
        proposal.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.quienPropone.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true
      if (statusFilter === "no_calificados") {
        matchesStatus = !ratings.some(r => r.proposalId === proposal.id)
      } else {
        matchesStatus = statusFilter === "all" || proposal.status === statusFilter
      }

      const matchesProcess = processFilter === "all" ||
        (proposal.proceso && proposal.proceso.toLowerCase().includes(processFilter.toLowerCase()))

      return matchesSearch && matchesStatus && matchesProcess
    })

    // Sort logic
    if (sortBy === "codigo_asc") {
      result.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }))
    } else if (sortBy === "codigo_desc") {
      result.sort((a, b) => b.codigo.localeCompare(a.codigo, undefined, { numeric: true, sensitivity: 'base' }))
    } else if (sortBy === "tipo_asc") {
      result.sort((a, b) => (a.tipo || "").localeCompare(b.tipo || ""))
    } else if (sortBy === "tipo_desc") {
      result.sort((a, b) => (b.tipo || "").localeCompare(a.tipo || ""))
    }

    return result
  }, [searchQuery, statusFilter, processFilter, ratings, proposals, sortBy, activeTab])

  const handleCardClick = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setDialogOpen(true)
  }

  const handleToggleVisibility = async (e: React.MouseEvent, proposalId: string, currentVisible: boolean) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/mejoras?id=${proposalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: !currentVisible }),
      });
      if (response.ok) {
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, visible: !currentVisible } : p));
      }
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setProcessFilter("all")
    setSortBy("codigo_asc")
  }

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || processFilter !== "all" || sortBy !== "codigo_asc"

  if (!authLoaded || (isAuthenticated && (!ratingsLoaded || !proposalsLoaded))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">{!authLoaded ? "Verificando sesión..." : "Cargando propuestas..."}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card/80 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <img src="/logo_bioflex__Mesa de trabajo 1.png" alt="icono" className="h-20 w-auto object-contain" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Propuestas MC</h1>
              <p className="text-sm text-muted-foreground">Sistema de Evaluación de Mejora Continua</p>
            </div>
          </div>
          <LoginDialog open={true} onOpenChange={() => {}} isStatic={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-primary/5">
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        {isMock && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center">
            <p className="text-sm font-medium text-amber-600 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Modo de demostración: La base de datos no está disponible, mostrando datos de prueba locales.
            </p>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5" >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <img src="/logo_bioflex__Mesa de trabajo 1.png" alt="icono" className="h-20 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Propuestas MC</h1>
                <p className="text-sm text-muted-foreground">Sistema de Evaluacion de Mejora Continua</p>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-50 pointer-events-auto">
              <Badge variant="outline" className="hidden sm:inline-flex text-xs px-3 py-1 border-primary/30 text-primary">
                SGI-FOR-55
              </Badge>
              <Badge className="hidden sm:inline-flex text-xs px-3 py-1 bg-primary/10 text-primary hover:bg-primary/10">
                Rev. 00 | Enero 2026
              </Badge>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button
                      onClick={() => window.location.assign("/mejoras/nueva")}
                      className="gap-2 shadow-sm rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                      Nueva Mejora
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={logout} className="rounded-xl shadow-sm text-muted-foreground" title="Cerrar sesion">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setLoginOpen(true)} className="gap-2 rounded-xl shadow-sm">
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsCards proposals={proposals} ratings={ratings} />

        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-5 space-y-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por codigo, titulo, descripcion o responsable..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-background/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-3">

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl bg-background/50 border-border/50">
                  <List className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="codigo_asc">Código (Ascendente)</SelectItem>
                  <SelectItem value="codigo_desc">Código (Descendente)</SelectItem>
                  <SelectItem value="tipo_asc">Tipo (A-Z)</SelectItem>
                  <SelectItem value="tipo_desc">Tipo (Z-A)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-11 rounded-xl bg-background/50 border-border/50">
                  <Filter className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="no_calificados">No calificados</SelectItem>
                  {PROPOSAL_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={processFilter} onValueChange={setProcessFilter}>
                <SelectTrigger className="w-[180px] h-11 rounded-xl bg-background/50 border-border/50">
                  <Target className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {uniqueProcesses.map(process => (
                    <SelectItem key={process} value={process}>{process}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="hidden sm:flex border border-border/50 rounded-xl overflow-hidden bg-background/50">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none h-11 w-11"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-none h-11 w-11"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              {isAdmin && (
                <div className="hidden sm:flex border border-border/50 rounded-xl overflow-hidden bg-background/50 p-1 gap-1">
                  <Button
                    variant={activeTab === "activas" ? "secondary" : "ghost"}
                    onClick={() => setActiveTab("activas")}
                    className="h-9 px-4 rounded-lg text-sm font-medium"
                  >
                    Activas
                  </Button>
                  <Button
                    variant={activeTab === "papelera" ? "secondary" : "ghost"}
                    onClick={() => setActiveTab("papelera")}
                    className="h-9 px-4 rounded-lg text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Papelera
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/30">
            <div className="flex items-center gap-3">
              {/*<span className="text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{filteredProposals.length}</span> de {proposals.length} propuestas
              </span>*/}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs rounded-lg"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            : "flex flex-col gap-4"
        }>
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              rating={getRating(proposal.id)}
              onClick={() => handleCardClick(proposal)}
              onToggleVisibility={isAdmin ? (e) => handleToggleVisibility(e, proposal.id, proposal.visible !== false) : undefined}
            />
          ))}
        </div>

        {filteredProposals.length === 0 && (
          <div className="text-center py-16">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">No se encontraron propuestas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Intenta ajustar los filtros o la busqueda
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="rounded-lg"
              >
                Limpiar todos los filtros
              </Button>
            )}
          </div>
        )}
      </main>

      <RatingDialog
        proposal={selectedProposal}
        existingRating={selectedProposal ? getRating(selectedProposal.id) : undefined}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(r) => saveRating(r, user?.username)}
      />

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}
