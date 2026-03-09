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
        Fecha_Creacion as createdAt
      FROM BioflexRFID.dbo.Calificaciones_Mejoras
      ORDER BY MejoraId DESC
    `)

    return NextResponse.json({ ok: true, data: result.recordset })
  } catch (error) {
    console.error("Error al obtener detalles de calificaciones:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
