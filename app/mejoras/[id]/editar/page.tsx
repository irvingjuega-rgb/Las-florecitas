import { Metadata } from "next"
import { MejoraForm } from "@/components/mejora-form"
import { Proposal } from "@/lib/proposals-data"

export const metadata: Metadata = {
    title: "Editar Mejora | Bioflex TI",
    description: "Formulario para editar una propuesta de mejora existente.",
}

// Function to fetch the proposal data in a server component
async function getProposal(id: string): Promise<Proposal | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/mejoras`, { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();

        if (json.ok && Array.isArray(json.data)) {
            const rawProposal = json.data.find((item: any) => item.Id?.toString() === id);
            if (!rawProposal) return null;

            return {
                id: rawProposal.Id?.toString() || "",
                codigo: rawProposal.Codigo || "",
                titulo: rawProposal.Titulo_Mejora || "",
                quienPropone: rawProposal.Quien_Propone || "",
                descripcion: rawProposal.Descripcion_Propuesta || "",
                equipoMultidisciplinario: rawProposal.Equipo_Multidisciplinario || "",
                factible: rawProposal.Factible ? "SI" : "NO",
                prioridad: rawProposal.Prioridad || "",
                tipo: rawProposal.Tipo || "",
                proceso: rawProposal.Proceso || "",
                status: rawProposal.Status || "Pendiente",
                fechaInicio: rawProposal.Fecha_Inicio || "",
                fechaTermino: rawProposal.Fecha_Termino || "",
                impactaA: rawProposal.Impacta_A || "",
                observaciones: rawProposal.Observaciones || ""
            };
        }
    } catch (error) {
        console.error("Error fetching proposal details:", error);
    }
    return null;
}

export default async function EditarMejoraPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const proposal = await getProposal(resolvedParams.id);

    if (!proposal) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <h1 className="text-2xl font-bold text-destructive">Propuesta no encontrada</h1>
                <p className="text-muted-foreground mt-2">La propuesta que intentas editar no existe o ha sido eliminada.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center max-w-3xl mx-auto">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
                    Editar Mejora
                </h1>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    Modifica los datos de la propuesta de mejora existente.
                </p>
                <div className="mt-2 text-sm text-primary font-mono">{proposal.codigo}</div>
            </div>

            <MejoraForm initialData={proposal} />
        </div>
    )
}
