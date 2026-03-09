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
            <DialogContent className="max-w-6xl w-full max-h-[85vh] bg-card/95 backdrop-blur-xl border-border/50 flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl">Detalle de Calificaciones Emitidas</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    <ScrollArea className="h-[60vh] border rounded-md">
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
                                        <TableHead>Sistema/Dispositivo</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Calificación Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {details.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                                No hay calificaciones registradas aún.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        details.map((row, idx) => {
                                            const total = row.costoBeneficio * 0.20 +
                                                row.usoIA * 0.30 +
                                                row.impactoCliente * 0.20 +
                                                row.facilidadImplementacion * 0.15 +
                                                row.escalabilidad * 0.15

                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">
                                                        {getProposalName(row.proposalId)}
                                                    </TableCell>
                                                    <TableCell className="text-xs max-w-[150px] truncate" title={row.userAgent}>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{getDeviceName(row.userAgent)}</span>
                                                            <span className="text-muted-foreground text-[10px] truncate">
                                                                IP: {row.ipAddress}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                        {row.createdAt ? format(new Date(row.createdAt), "d 'de' MMMM, yyyy · HH:mm", { locale: es }) : "—"}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-primary text-lg">
                                                        {total.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
