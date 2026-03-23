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
import { proposals } from "@/lib/proposals-data"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

interface GlobalRatingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GlobalRatingDialog({
    open,
    onOpenChange,
}: GlobalRatingDialogProps) {
    const [details, setDetails] = useState<RawRating[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setLoading(true)
            fetch("/api/calificaciones/detalles")
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        setDetails(data.data)
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [open])

    // Helper config to format user agent string safely
    function getDeviceName(ua: string) {
        if (!ua) return "Desconocido"
        if (ua.includes("Windows NT 10.0")) return "Windows 10/11"
        if (ua.includes("Mac OS X")) return "Mac"
        if (ua.includes("Android")) return "Android"
        if (ua.includes("iPhone")) return "iPhone"
        if (ua.includes("Linux")) return "Linux"
        return "Otro Dispositivo"
    }

    function getProposalName(id: string) {
        return proposals.find(p => p.id === id)?.codigo || `ID: ${id}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl w-full max-h-[90vh] bg-card/95 backdrop-blur-xl border-border/50 flex flex-col p-6 overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Detalle de Calificaciones Emitidas</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-6">
                    <ScrollArea className="h-[65vh] w-full border rounded-lg bg-card shadow-sm">
                        <div className="min-w-[650px] w-full">
                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                    <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    Cargando registros...
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10">
                                        <TableRow>
                                            <TableHead>Propuesta</TableHead>
                                            <TableHead>Usuario Evaluador</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead className="text-right">Calificación Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {details.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                    No hay calificaciones registradas aún.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            details.map((row, idx) => {
                                                const mapOldRating = (val: number) => {
                                                    if (val > 5) return Math.min(5, Math.ceil(val / 2))
                                                    return Math.max(1, Math.min(5, Math.round(val)))
                                                }

                                                const cb = mapOldRating(Number(row.costoBeneficio) || 0);
                                                const ia = mapOldRating(Number(row.usoIA) || 0);
                                                const ic = mapOldRating(Number(row.impactoCliente) || 0);
                                                const fi = mapOldRating(Number(row.facilidadImplementacion) || 0);
                                                const esc = mapOldRating(Number(row.escalabilidad) || 0);

                                                const total = cb * 0.20 + ia * 0.30 + ic * 0.20 + fi * 0.15 + esc * 0.15;

                                                const isIP = row.ipAddress.includes('.') || row.ipAddress.includes(':') || row.ipAddress === 'unknown';

                                                return (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">
                                                            {getProposalName(row.proposalId)}
                                                        </TableCell>
                                                        <TableCell className="text-sm max-w-[150px] truncate">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-foreground">
                                                                    {isIP ? 'Evaluador Anónimo' : row.ipAddress}
                                                                </span>
                                                                {isIP && (
                                                                    <span className="text-muted-foreground text-[10px] truncate">
                                                                        IP: {row.ipAddress}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                            {row.createdAt ? format(new Date(row.createdAt), "d 'de' MMMM, yyyy · HH:mm", { locale: es }) : "—"}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-primary text-lg">
                                                            {total.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 5</span>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
