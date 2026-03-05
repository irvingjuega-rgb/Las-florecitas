"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const mejoraSchema = z.object({
    fecha_entrada: z.string().min(1, "Requerido"),
    codigo: z.string().max(50, "Máximo 50 caracteres").optional().or(z.literal("")),
    titulo_mejora: z.string().min(1, "Requerido").max(200, "Máximo 200 caracteres"),
    quien_propone: z.string().min(1, "Requerido").max(150, "Máximo 150 caracteres"),
    descripcion_propuesta: z.string().min(1, "Requerido"),
    equipo_multidisciplinario: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
    factible: z.boolean().default(true),
    prioridad: z.string().min(1, "Requerido"),
    tipo: z.string().min(1, "Requerido"),
    proceso: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
    status: z.string().min(1, "Requerido"),
    fecha_inicio: z.string().optional().or(z.literal("")),
    fecha_termino: z.string().optional().or(z.literal("")),
    impacta_a: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),

    observaciones: z.string().optional().or(z.literal("")),
    formato_a3: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
    imagen: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
})

type MejoraFormValues = z.infer<typeof mejoraSchema>

export function MejoraForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<MejoraFormValues>({
        resolver: zodResolver(mejoraSchema),
        defaultValues: {
            fecha_entrada: new Date().toISOString().split("T")[0],
            codigo: "",
            titulo_mejora: "",
            quien_propone: "",
            descripcion_propuesta: "",
            equipo_multidisciplinario: "",
            factible: true,
            prioridad: "Media",
            tipo: "Mejora",
            proceso: "",
            status: "Pendiente",
            fecha_inicio: "",
            fecha_termino: "",
            impacta_a: "",

            observaciones: "",
            formato_a3: "",
            imagen: "",
        },
    })

    async function onSubmit(data: MejoraFormValues) {
        setIsLoading(true)
        try {
            const response = await fetch("/api/mejoras", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    fecha_inicio: data.fecha_inicio || null,
                    fecha_termino: data.fecha_termino || null,
                }),
            })

            if (!response.ok) {
                throw new Error("Error al enviar los datos")
            }

            toast.success("Mejora registrada correctamente")
            form.reset()
            router.refresh()
        } catch (error) {
            toast.error("Hubo un error al registrar la mejora")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Link href="/">
                    <Button variant="outline" size="icon" type="button" className="mt-1">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="grid gap-1">
                    <CardTitle className="text-2xl font-bold">Registrar Nueva Mejora</CardTitle>
                    <CardDescription>
                        Completa el siguiente formulario para ingresar una propuesta de mejora en el sistema.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Información Básica */}
                            <FormField
                                control={form.control}
                                name="fecha_entrada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Entrada *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="codigo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. MEJ-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quien_propone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quién Propone *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del solicitante" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="titulo_mejora"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <FormLabel>Título de la Mejora *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Optimización del proceso de envíos" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="descripcion_propuesta"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <FormLabel>Descripción de la Propuesta *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Escribe en qué consiste la mejora..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Detalles y Clasificación */}
                            <FormField
                                control={form.control}
                                name="prioridad"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridad *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona prioridad" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Baja">Baja</SelectItem>
                                                <SelectItem value="Media">Media</SelectItem>
                                                <SelectItem value="Alta">Alta</SelectItem>
                                                <SelectItem value="Urgente">Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Preventiva">Preventiva</SelectItem>
                                                <SelectItem value="Correctiva">Correctiva</SelectItem>
                                                <SelectItem value="Mejora">Mejora Innovación</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estatus *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el estatus" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                                <SelectItem value="En Proceso">En Proceso</SelectItem>
                                                <SelectItem value="Completado">Completado</SelectItem>
                                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="proceso"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proceso Afectado</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Logística" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="impacta_a"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Impacta a (Área / Roles)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Almacenistas" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="equipo_multidisciplinario"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Equipo Multidisciplinario</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Juan, María, Pedro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fechas */}
                            <FormField
                                control={form.control}
                                name="fecha_inicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Inicio del Proyecto</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fecha_termino"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Término del Proyecto</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="factible"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>¿Es Factible?</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />


                            {/* Archivos y Observaciones */}
                            <FormField
                                control={form.control}
                                name="observaciones"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <FormLabel>Observaciones Extras</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Comentarios adicionales" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="formato_a3"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2">
                                        <FormLabel>URL del Formato A3</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imagen"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <FormLabel>URL de la Imagen de Respaldo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="flex justify-end mt-6">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Enviando..." : "Registrar Mejora"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
