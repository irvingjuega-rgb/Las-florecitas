"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Proposal } from "@/lib/proposals-data"

interface RawRating {
    proposalId: string
    costoBeneficio: number
    usoIA: number
    impactoCliente: number
    facilidadImplementacion: number
    escalabilidad: number
    ipAddress: string
    userAgent: string
    createdAt: string
}

interface ProposalAverage {
    proposalId: string
    proposalName: string
    totalScore: number
    ratingsCount: number
}

import { useAuth } from "@/contexts/auth-context"
import { ProposalDetailsDialog } from "./proposal-details-dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AverageRatingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    proposals: Proposal[]
}

export function AverageRatingDialog({
    open,
    onOpenChange,
    proposals,
}: AverageRatingDialogProps) {
    const { isAuthenticated } = useAuth()
    const [averages, setAverages] = useState<ProposalAverage[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredAverages = averages.filter(avg => 
        avg.proposalName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleRowClick = (proposalId: string) => {
        const proposal = proposals.find(p => p.id === proposalId)
        if (proposal) {
            setSelectedProposal(proposal)
            setDetailsOpen(true)
        }
    }

    useEffect(() => {
        if (open && isAuthenticated) {
            setLoading(true)
            fetch("/api/calificaciones/detalles")
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        const rawRatings: RawRating[] = data.data

                        // Group and calculate averages
                        const grouped = rawRatings.reduce((acc, rating) => {
                            if (!acc[rating.proposalId]) {
                                const proposalName = proposals.find(p => p.id === rating.proposalId)?.codigo || `ID: ${rating.proposalId}`
                                acc[rating.proposalId] = {
                                    proposalId: rating.proposalId,
                                    proposalName,
                                    totalScoreSum: 0,
                                    ratingsCount: 0
                                }
                            }

                            const mapOldRating = (val: number) => {
                                if (val > 5) return Math.min(5, Math.ceil(val / 2))
                                return Math.max(1, Math.min(5, Math.round(val)))
                            }

                            const cb = mapOldRating(Number(rating.costoBeneficio) || 0);
                            const ia = mapOldRating(Number(rating.usoIA) || 0);
                            const ic = mapOldRating(Number(rating.impactoCliente) || 0);
                            const fi = mapOldRating(Number(rating.facilidadImplementacion) || 0);
                            const esc = mapOldRating(Number(rating.escalabilidad) || 0);

                            const total = cb * 0.20 + ia * 0.30 + ic * 0.20 + fi * 0.15 + esc * 0.15;

                            acc[rating.proposalId].totalScoreSum += total
                            acc[rating.proposalId].ratingsCount += 1

                            return acc
                        }, {} as Record<string, { proposalId: string, proposalName: string, totalScoreSum: number, ratingsCount: number }>)

                        const averagedData = Object.values(grouped).map(group => ({
                            proposalId: group.proposalId,
                            proposalName: group.proposalName,
                            totalScore: group.totalScoreSum / group.ratingsCount,
                            ratingsCount: group.ratingsCount
                        })).sort((a, b) => b.totalScore - a.totalScore) // Sort descending by score

                        setAverages(averagedData)
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [open, isAuthenticated])

    if (!isAuthenticated) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] bg-card/95 backdrop-blur-xl border-border/50 flex flex-col p-6 overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Promedio General por Propuesta</DialogTitle>
                </DialogHeader>

                <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por código de propuesta..." 
                        className="pl-10 h-10 rounded-xl bg-muted/30 border-border/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-hidden mt-4">
                    <ScrollArea className="h-[60vh] w-full border rounded-lg bg-card shadow-sm">
                        <div className="w-full">
                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                    <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    Calculando promedios...
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10">
                                        <TableRow>
                                            <TableHead>Propuesta</TableHead>
                                            <TableHead className="text-center">Total de Calificaciones</TableHead>
                                            <TableHead className="text-right">Promedio General (1-5)</TableHead>
                                            <TableHead className="text-right">Promedio (1-10)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAverages.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                    {searchQuery ? "No se encontraron propuestas con ese código." : "No hay calificaciones registradas aún para calcular promedios."}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAverages.map((row, idx) => (
                                                <TableRow 
                                                    key={idx} 
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                    onClick={() => handleRowClick(row.proposalId)}
                                                >
                                                    <TableCell className="font-medium text-base">
                                                        {row.proposalName}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-medium px-2.5 py-0.5 rounded-full text-xs">
                                                            {row.ratingsCount} {row.ratingsCount === 1 ? 'evaluación' : 'evaluaciones'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-primary text-xl">
                                                        {row.totalScore.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 5</span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-primary text-xl">
                                                        {(row.totalScore * 2).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                
                <ProposalDetailsDialog 
                    open={detailsOpen} 
                    onOpenChange={setDetailsOpen} 
                    proposal={selectedProposal} 
                />
            </DialogContent>
        </Dialog>
    )
}
