// POST /api/calificaciones
// GET  /api/calificaciones
import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"
import sql from "mssql"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pool = await getConnection()

    // Extraer Headers para auditoria de IP y Client
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"
    
    // Si viene un username en el body, lo usamos como identificador unico en lugar de la IP
    const identifier = body.username || ipAddress

    await pool.request()
      .input("MejoraId", sql.Int, Number(body.proposalId))
      .input("Costo_Beneficio", sql.Int, body.costoBeneficio)
      .input("Uso_IA_Tecnologia", sql.Int, body.usoIA)
      .input("Impacto_Satisfaccion_Cliente", sql.Int, body.impactoCliente)
      .input("Facilidad_Implementacion", sql.Int, body.facilidadImplementacion)
      .input("Escalabilidad", sql.Int, body.escalabilidad)
      .input("IP_Address", sql.VarChar(45), identifier)
      .input("User_Agent", sql.NVarChar(sql.MAX), userAgent)
      .query(`
        IF EXISTS (SELECT 1 FROM BioflexRFID.dbo.Calificaciones_Mejoras WHERE MejoraId = @MejoraId AND IP_Address = @IP_Address)
        BEGIN
          UPDATE BioflexRFID.dbo.Calificaciones_Mejoras
          SET 
            Costo_Beneficio = @Costo_Beneficio,
            Uso_IA_Tecnologia = @Uso_IA_Tecnologia,
            Impacto_Satisfaccion_Cliente = @Impacto_Satisfaccion_Cliente,
            Facilidad_Implementacion = @Facilidad_Implementacion,
            Escalabilidad = @Escalabilidad,
            User_Agent = @User_Agent
          WHERE MejoraId = @MejoraId AND IP_Address = @IP_Address
        END
        ELSE
        BEGIN
          INSERT INTO BioflexRFID.dbo.Calificaciones_Mejoras (
            MejoraId, 
            Costo_Beneficio, 
            Uso_IA_Tecnologia, 
            Impacto_Satisfaccion_Cliente, 
            Facilidad_Implementacion, 
            Escalabilidad,
            IP_Address,
            User_Agent
          ) VALUES (
            @MejoraId, 
            @Costo_Beneficio, 
            @Uso_IA_Tecnologia, 
            @Impacto_Satisfaccion_Cliente, 
            @Facilidad_Implementacion, 
            @Escalabilidad,
            @IP_Address,
            @User_Agent
          )
        END
      `)

    return NextResponse.json({ ok: true, message: "Calificacion registrada correctamente" }, { status: 201 })
  } catch (error) {
    console.error("================ ERROR AL INSERTAR CALIFICACION ================")
    console.error(error)
    console.error("==================================================================")
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
export async function GET(req: NextRequest) {
  try {
    let pool;
    try {
      pool = await getConnection();
    } catch (connErr) {
      console.warn('⚠️ Base de datos no disponible. Usando datos vacios para GET /api/calificaciones');
      return NextResponse.json({ ok: true, data: [], isMock: true });
    }

    // Retorna todos los registros agrupados (promedios) por MejoraId
    const result = await pool.request().query(`
      SELECT
        CAST(MejoraId AS VARCHAR) as proposalId,
        AVG(CAST(Costo_Beneficio as FLOAT)) as costoBeneficio,
        AVG(CAST(Uso_IA_Tecnologia as FLOAT)) as usoIA,
        AVG(CAST(Impacto_Satisfaccion_Cliente as FLOAT)) as impactoCliente,
        AVG(CAST(Facilidad_Implementacion as FLOAT)) as facilidadImplementacion,
        AVG(CAST(Escalabilidad as FLOAT)) as escalabilidad
      FROM BioflexRFID.dbo.Calificaciones_Mejoras
      GROUP BY MejoraId
    `)

    return NextResponse.json({ ok: true, data: result.recordset })
  } catch (error) {
    console.error("Error al obtener calificaciones:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
