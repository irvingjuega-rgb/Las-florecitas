"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, X, Plus, Image as ImageIcon, Loader2 } from "lucide-react"
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

import { Proposal, PROPOSAL_STATUSES, getProposalImageUrl, getProposalImages } from "@/lib/proposals-data"

const mejoraSchema = z.object({
    fecha_entrada: z.string().min(1, "Requerido"),
    codigo: z.string().max(50, "Máximo 50 caracteres").optional().or(z.literal("")),
    titulo_mejora: z.string().min(1, "Requerido").max(200, "Máximo 200 caracteres"),
    quien_propone: z.string().min(1, "Requerido").max(150, "Máximo 150 caracteres"),
    descripcion_propuesta: z.string().min(1, "Requerido"),
    situacion_actual: z.string().optional().or(z.literal("")),
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
    beneficios: z.string().optional().or(z.literal("")),
    formato_a3: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
    imagen: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
})

type MejoraFormValues = z.infer<typeof mejoraSchema>

interface MejoraFormProps {
    initialData?: Proposal
}

export function MejoraForm({ initialData }: MejoraFormProps = {}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [mounted, setMounted] = useState(false)
    const isEditing = !!initialData

    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<MejoraFormValues>({
        resolver: zodResolver(mejoraSchema),
        defaultValues: {
            fecha_entrada: initialData?.fechaEntrada ? new Date(initialData.fechaEntrada).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            codigo: initialData?.codigo || "",
            titulo_mejora: initialData?.titulo || "",
            quien_propone: initialData?.quienPropone || "",
            descripcion_propuesta: initialData?.descripcion || "",
            situacion_actual: initialData?.situacionActual || "",
            equipo_multidisciplinario: initialData?.equipoMultidisciplinario || "",
            factible: initialData ? initialData.factible === "SI" : true,
            prioridad: initialData?.prioridad || "Media",
            tipo: initialData?.tipo || "Mejora Tecnologica",
            proceso: initialData?.proceso || "",
            status: initialData?.status || "Pendiente",
            fecha_inicio: initialData?.fechaInicio ? new Date(initialData.fechaInicio).toISOString().split("T")[0] : "",
            fecha_termino: initialData?.fechaTermino ? new Date(initialData.fechaTermino).toISOString().split("T")[0] : "",
            impacta_a: initialData?.impactaA || "",
            observaciones: initialData?.observaciones || "",
            beneficios: initialData?.Beneficios || "",
            formato_a3: initialData?.formatoA3 || "",
            imagen: initialData?.imagen || "",
        },
    })

    const currentImageValue = form.watch("imagen")
    const images = getProposalImages(currentImageValue)

    async function handleImageUpload(file: File) {
        setIsUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/imagenes", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()
            if (!response.ok || !result.ok) {
                throw new Error(result?.error || "No se pudo subir la imagen")
            }

            const newFilename = result.data.filename
            const currentImages = form.getValues("imagen")
            const updatedImages = currentImages
                ? `${currentImages},${newFilename}`
                : newFilename

            form.setValue("imagen", updatedImages, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            })
            toast.success("Imagen subida correctamente")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen")
        } finally {
            setIsUploadingImage(false)
        }
    }

    const removeImage = (indexToRemove: number) => {
        const currentImagesString = form.getValues("imagen") || "";
        const currentImages = currentImagesString.split(',').map(img => img.trim()).filter(Boolean)
        const updatedImages = currentImages.filter((_, index) => index !== indexToRemove).join(',')

        form.setValue("imagen", updatedImages, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        })
    }

    async function onSubmit(data: MejoraFormValues) {
        setIsLoading(true)
        try {
            const bodyData = {
                ...data,
                fecha_inicio: data.fecha_inicio || null,
                fecha_termino: data.fecha_termino || null,
                ...(isEditing && { id: initialData.id })
            }

            const url = isEditing ? `/api/mejoras?id=${initialData.id}` : "/api/mejoras"
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => null)
                throw new Error(errData?.error || "Error al enviar los datos")
            }

            toast.success(isEditing ? "Mejora actualizada correctamente" : "Mejora registrada correctamente")
            if (!isEditing) {
                form.reset()
            }
            router.push('/')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Hubo un error al guardar la mejora")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
                    <div className="grid gap-1 flex-1">
                        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
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

                            <FormField
                                control={form.control}
                                name="situacion_actual"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <FormLabel>Situación Actual o Problemática</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe la problemática o la situación que se busca resolver..."
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
                                                <SelectItem value="Mejora Tecnologica">Mejora Tecnologica</SelectItem>
                                                <SelectItem value="Mejora Operativa">Mejora Operativa</SelectItem>
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
                                                {PROPOSAL_STATUSES.map(status => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
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
                                        <FormLabel>Proceso</FormLabel>
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
                                name="beneficios"
                                render={({ field }) => (
                                    <FormItem className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <FormLabel>Beneficios</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe los beneficios de esta mejora..." {...field} />
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
                                        <FormLabel>Imágenes de Respaldo</FormLabel>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {images.map((url, index) => (
                                                    <div key={index} className="relative group aspect-square rounded-xl border bg-muted/20 overflow-hidden">
                                                        <img
                                                            src={url}
                                                            alt={`Imagen ${index + 1}`}
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}

                                                <label className={`
                                                    relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed 
                                                    cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50
                                                    ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}>
                                                    {isUploadingImage ? (
                                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <>
                                                            <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                                                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Añadir</span>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        disabled={isLoading || isUploadingImage}
                                                        onChange={async (event) => {
                                                            const file = event.target.files?.[0]
                                                            if (!file) return
                                                            await handleImageUpload(file)
                                                            event.target.value = ""
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            <FormControl>
                                                <Input
                                                    placeholder="Nombres de archivos o URLs (separados por coma)"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>

                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4" />
                                                {isUploadingImage ? "Subiendo imagen..." : "Puedes subir varios archivos o pegar URLs separadas por coma."}
                                            </p>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="flex justify-end mt-6">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Enviando..." : isEditing ? "Actualizar Mejora" : "Registrar Mejora"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
