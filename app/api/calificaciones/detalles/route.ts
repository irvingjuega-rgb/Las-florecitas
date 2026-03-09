import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const pool = await getConnection()

    // Retrieve all records from the table
    const result = await pool.request().query(`
      SELECT 
        CAST(MejoraId AS VARCHAR) as proposalId,
        CAST(Costo_Beneficio as INT) as costoBeneficio,
        CAST(Uso_IA_Tecnologia as INT) as usoIA,
        CAST(Impacto_Satisfaccion_Cliente as INT) as impactoCliente,
        CAST(Facilidad_Implementacion as INT) as facilidadImplementacion,
        CAST(Escalabilidad as INT) as escalabilidad,
        IP_Address as ipAddress,
        User_Agent as userAgent,
        Fecha_Calificacion as createdAt
      FROM BioflexRFID.dbo.Calificaciones_Mejoras
      ORDER BY MejoraId DESC
    `)

    const mapped = result.recordset.map(row => ({
      proposalId: row.proposalId,
      costoBeneficio: row.costoBeneficio,
      usoIA: row.usoIA,
      impactoCliente: row.impactoCliente,
      facilidadImplementacion: row.facilidadImplementacion,
      escalabilidad: row.escalabilidad,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt
    }))

    return NextResponse.json({ ok: true, data: mapped })
  } catch (error) {
    console.error("Error al obtener detalles de calificaciones:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
