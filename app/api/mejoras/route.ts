//  POST app/api/mejoras/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { proposals } from '@/lib/proposals-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pool = await getConnection();

    await pool.request()
      .input('Fecha_Entrada', sql.Date, body.fecha_entrada ?? null)
      .input('Codigo', sql.VarChar(50), body.codigo ?? null)
      .input('Titulo_Mejora', sql.VarChar(200), body.titulo_mejora ?? null)
      .input('Quien_Propone', sql.VarChar(150), body.quien_propone ?? null)
      .input('Descripcion_Propuesta', sql.NVarChar(sql.MAX), body.descripcion_propuesta ?? null)
      .input('Equipo_Multidisciplinario', sql.NVarChar(500), body.equipo_multidisciplinario ?? null)
      .input('Factible', sql.Bit, body.factible ?? null)
      .input('Prioridad', sql.VarChar(20), body.prioridad ?? null)
      .input('Tipo', sql.VarChar(20), body.tipo ?? null)
      .input('Proceso', sql.VarChar(200), body.proceso ?? null)
      .input('Status', sql.VarChar(50), body.status ?? null)
      .input('Fecha_Inicio', sql.Date, body.fecha_inicio ?? null)
      .input('Fecha_Termino', sql.Date, body.fecha_termino ?? null)
      .input('Impacta_A', sql.VarChar(200), body.impacta_a ?? null)
      .input('Costo_Beneficio', sql.Decimal(5, 2), body.costo_beneficio ?? null)
      .input('Uso_IA_Tecnologia', sql.Decimal(5, 2), body.uso_ia_tecnologia ?? null)
      .input('Impacto_Satisfaccion_Cliente', sql.Decimal(5, 2), body.impacto_satisfaccion_cliente ?? null)
      .input('Facilidad_Implementacion', sql.Decimal(5, 2), body.facilidad_implementacion ?? null)
      .input('Escalabilidad', sql.Decimal(5, 2), body.escalabilidad ?? null)
      .input('Observaciones', sql.NVarChar(sql.MAX), body.observaciones ?? null)
      .input('Formato_A3', sql.VarChar(500), body.formato_a3 ?? null)
      .input('Imagen', sql.VarChar(500), body.imagen ?? null)
      .input('Situacion_Actual', sql.NVarChar(sql.MAX), body.situacion_actual ?? null)
      .query(`
        INSERT INTO dbo.Mejoras (
          Fecha_Entrada, Codigo, Titulo_Mejora, Quien_Propone,
          Descripcion_Propuesta, Equipo_Multidisciplinario, Factible,
          Prioridad, Tipo, Proceso, Status, Fecha_Inicio, Fecha_Termino,
          Impacta_A, Costo_Beneficio, Uso_IA_Tecnologia,
          Impacto_Satisfaccion_Cliente, Facilidad_Implementacion,
          Escalabilidad, Observaciones, Formato_A3, Imagen, Situacion_Actual
        ) VALUES (
          @Fecha_Entrada, @Codigo, @Titulo_Mejora, @Quien_Propone,
          @Descripcion_Propuesta, @Equipo_Multidisciplinario, @Factible,
          @Prioridad, @Tipo, @Proceso, @Status, @Fecha_Inicio, @Fecha_Termino,
          @Impacta_A, @Costo_Beneficio, @Uso_IA_Tecnologia,
          @Impacto_Satisfaccion_Cliente, @Facilidad_Implementacion,
          @Escalabilidad, @Observaciones, @Formato_A3, @Imagen, @Situacion_Actual
        )
      `);

    return NextResponse.json({ ok: true, message: 'Mejora registrada correctamente' }, { status: 201 });

  } catch (error) {
    console.error('Error al insertar mejora:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// GET  /api/mejoras          → Listar todas
// GET  /api/mejoras?id=123   → Obtener una por ID
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    let pool;
    try {
      pool = await getConnection();
    } catch (connErr) {
      console.warn('⚠️ Base de datos no disponible. Usando datos mock para GET /api/mejoras');
      
      if (id) {
        const mockItem = proposals.find(p => p.id === id);
        if (!mockItem) return NextResponse.json({ ok: false, error: 'Mejora no encontrada (Mock)' }, { status: 404 });
        return NextResponse.json({ ok: true, data: mockItem });
      }
      
      const includeHidden = searchParams.get('includeHidden') === 'true';
      const mockData = includeHidden ? proposals : proposals.filter(p => p.visible !== false);
      return NextResponse.json({ ok: true, data: mockData, isMock: true });
    }

    if (id) {
      // ── Obtener una mejora por ID ──────────────
      const result = await pool.request()
        .input('Id', sql.Int, Number(id))
        .query('SELECT * FROM dbo.Mejoras WHERE Id = @Id');

      if (result.recordset.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'Mejora no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({ ok: true, data: result.recordset[0] });
    }

    // ── Listar todas las mejoras ───────────────
    const includeHidden = searchParams.get('includeHidden') === 'true';
    let query = 'SELECT * FROM dbo.Mejoras';
    if (!includeHidden) {
      query += ' WHERE Visible = 1 OR Visible IS NULL';
    }
    query += ' ORDER BY Fecha_Entrada DESC';

    const result = await pool.request().query(query);

    return NextResponse.json({ ok: true, data: result.recordset });
  } catch (error) {
    console.error('Error al obtener mejoras:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// PUT  /api/mejoras?id=123  → Actualizar mejora
// ─────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const id = searchParams.get('id') || body.id;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Se requiere el parámetro id' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('Id', sql.Int, Number(id))
      .input('Fecha_Entrada', sql.Date, body.fecha_entrada ?? null)
      .input('Codigo', sql.VarChar(50), body.codigo ?? null)
      .input('Titulo_Mejora', sql.VarChar(200), body.titulo_mejora ?? null)
      .input('Quien_Propone', sql.VarChar(150), body.quien_propone ?? null)
      .input('Descripcion_Propuesta', sql.NVarChar(sql.MAX), body.descripcion_propuesta ?? null)
      .input('Equipo_Multidisciplinario', sql.NVarChar(500), body.equipo_multidisciplinario ?? null)
      .input('Factible', sql.Bit, body.factible ?? null)
      .input('Prioridad', sql.VarChar(20), body.prioridad ?? null)
      .input('Tipo', sql.VarChar(20), body.tipo ?? null)
      .input('Proceso', sql.VarChar(200), body.proceso ?? null)
      .input('Status', sql.VarChar(50), body.status ?? null)
      .input('Fecha_Inicio', sql.Date, body.fecha_inicio ?? null)
      .input('Fecha_Termino', sql.Date, body.fecha_termino ?? null)
      .input('Impacta_A', sql.VarChar(200), body.impacta_a ?? null)
      .input('Costo_Beneficio', sql.Decimal(5, 2), body.costo_beneficio ?? null)
      .input('Uso_IA_Tecnologia', sql.Decimal(5, 2), body.uso_ia_tecnologia ?? null)
      .input('Impacto_Satisfaccion_Cliente', sql.Decimal(5, 2), body.impacto_satisfaccion_cliente ?? null)
      .input('Facilidad_Implementacion', sql.Decimal(5, 2), body.facilidad_implementacion ?? null)
      .input('Escalabilidad', sql.Decimal(5, 2), body.escalabilidad ?? null)
      .input('Observaciones', sql.NVarChar(sql.MAX), body.observaciones ?? null)
      .input('Formato_A3', sql.VarChar(500), body.formato_a3 ?? null)
      .input('Imagen', sql.VarChar(500), body.imagen ?? null)
      .input('Situacion_Actual', sql.NVarChar(sql.MAX), body.situacion_actual ?? null)
      .query(`
        UPDATE dbo.Mejoras SET
          Fecha_Entrada                 = @Fecha_Entrada,
          Codigo                        = @Codigo,
          Titulo_Mejora                 = @Titulo_Mejora,
          Quien_Propone                 = @Quien_Propone,
          Descripcion_Propuesta         = @Descripcion_Propuesta,
          Equipo_Multidisciplinario     = @Equipo_Multidisciplinario,
          Factible                      = @Factible,
          Prioridad                     = @Prioridad,
          Tipo                          = @Tipo,
          Proceso                       = @Proceso,
          Status                        = @Status,
          Fecha_Inicio                  = @Fecha_Inicio,
          Fecha_Termino                 = @Fecha_Termino,
          Impacta_A                     = @Impacta_A,
          Costo_Beneficio               = @Costo_Beneficio,
          Uso_IA_Tecnologia             = @Uso_IA_Tecnologia,
          Impacto_Satisfaccion_Cliente  = @Impacto_Satisfaccion_Cliente,
          Facilidad_Implementacion      = @Facilidad_Implementacion,
          Escalabilidad                 = @Escalabilidad,
          Observaciones                 = @Observaciones,
          Formato_A3                    = @Formato_A3,
          Imagen                        = @Imagen,
          Situacion_Actual              = @Situacion_Actual
        WHERE Id = @Id
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { ok: false, error: 'Mejora no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: 'Mejora actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar mejora:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// DELETE  /api/mejoras?id=123  → Eliminar mejora
// ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Se requiere el parámetro id' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('Id', sql.Int, Number(id))
      .query('DELETE FROM dbo.Mejoras WHERE Id = @Id');

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { ok: false, error: 'Mejora no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: 'Mejora eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar mejora:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// PATCH  /api/mejoras?id=123  → Toggle visibilidad (Soft Delete)
// ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Se requiere el parámetro id' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const visible = body.visible;

    if (visible === undefined || visible === null) {
      return NextResponse.json(
        { ok: false, error: 'Se requiere el campo visible en el cuerpo de la petición' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const result = await pool.request()
      .input('Id', sql.Int, Number(id))
      .input('Visible', sql.Bit, visible ? 1 : 0)
      .query('UPDATE dbo.Mejoras SET Visible = @Visible WHERE Id = @Id');

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { ok: false, error: 'Mejora no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: 'Visibilidad actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar visibilidad:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

