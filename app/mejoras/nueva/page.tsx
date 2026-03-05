import { Metadata } from "next"
import { MejoraForm } from "@/components/mejora-form"

export const metadata: Metadata = {
    title: "Registrar Nueva Mejora | Bioflex TI",
    description: "Formulario para registrar una nueva propuesta de mejora.",
}

export default function NuevaMejoraPage() {
    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center max-w-3xl mx-auto">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
                    Nueva Mejora
                </h1>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    Utiliza este formulario para registrar una nueva propuesta de mejora, detallando la problemática y la solución propuesta.
                </p>
            </div>

            <MejoraForm />
        </div>
    )
}
