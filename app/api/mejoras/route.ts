// app/api/mejoras/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pool = await getConnection();

    await pool.request()
      .input('Fecha_Entrada',               sql.Date,          body.fecha_entrada)
      .input('Codigo',                      sql.VarChar(50),   body.codigo)
      .input('Titulo_Mejora',               sql.VarChar(200),  body.titulo_mejora)
      .input('Quien_Propone',               sql.VarChar(150),  body.quien_propone)
      .input('Descripcion_Propuesta',       sql.NVarChar(sql.MAX), body.descripcion_propuesta)
      .input('Equipo_Multidisciplinario',   sql.NVarChar(500), body.equipo_multidisciplinario)
      .input('Factible',                    sql.Bit,           body.factible)
      .input('Prioridad',                   sql.VarChar(20),   body.prioridad)
      .input('Tipo',                        sql.VarChar(20),   body.tipo)
      .input('Proceso',                     sql.VarChar(200),  body.proceso)
      .input('Status',                      sql.VarChar(50),   body.status)
      .input('Fecha_Inicio',                sql.Date,          body.fecha_inicio)
      .input('Fecha_Termino',               sql.Date,          body.fecha_termino)
      .input('Impacta_A',                   sql.VarChar(200),  body.impacta_a)
      .input('Costo_Beneficio',             sql.Decimal(5,2),  body.costo_beneficio)
      .input('Uso_IA_Tecnologia',           sql.Decimal(5,2),  body.uso_ia_tecnologia)
      .input('Impacto_Satisfaccion_Cliente',sql.Decimal(5,2),  body.impacto_satisfaccion_cliente)
      .input('Facilidad_Implementacion',    sql.Decimal(5,2),  body.facilidad_implementacion)
      .input('Escalabilidad',               sql.Decimal(5,2),  body.escalabilidad)
      .input('Observaciones',               sql.NVarChar(sql.MAX), body.observaciones)
      .input('Formato_A3',                  sql.VarChar(500),  body.formato_a3)
      .input('Imagen',                      sql.VarChar(500),  body.imagen)
      .query(`
        INSERT INTO dbo.Mejoras (
          Fecha_Entrada, Codigo, Titulo_Mejora, Quien_Propone,
          Descripcion_Propuesta, Equipo_Multidisciplinario, Factible,
          Prioridad, Tipo, Proceso, Status, Fecha_Inicio, Fecha_Termino,
          Impacta_A, Costo_Beneficio, Uso_IA_Tecnologia,
          Impacto_Satisfaccion_Cliente, Facilidad_Implementacion,
          Escalabilidad, Observaciones, Formato_A3, Imagen
        ) VALUES (
          @Fecha_Entrada, @Codigo, @Titulo_Mejora, @Quien_Propone,
          @Descripcion_Propuesta, @Equipo_Multidisciplinario, @Factible,
          @Prioridad, @Tipo, @Proceso, @Status, @Fecha_Inicio, @Fecha_Termino,
          @Impacta_A, @Costo_Beneficio, @Uso_IA_Tecnologia,
          @Impacto_Satisfaccion_Cliente, @Facilidad_Implementacion,
          @Escalabilidad, @Observaciones, @Formato_A3, @Imagen
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
    const pool = await getConnection();

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
    const result = await pool.request()
      .query('SELECT * FROM dbo.Mejoras ORDER BY Fecha_Entrada DESC');

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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Se requiere el parámetro id' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const pool = await getConnection();

    const result = await pool.request()
      .input('Id',                           sql.Int,               Number(id))
      .input('Fecha_Entrada',                sql.Date,              body.fecha_entrada)
      .input('Codigo',                       sql.VarChar(50),       body.codigo)
      .input('Titulo_Mejora',                sql.VarChar(200),      body.titulo_mejora)
      .input('Quien_Propone',                sql.VarChar(150),      body.quien_propone)
      .input('Descripcion_Propuesta',        sql.NVarChar(sql.MAX), body.descripcion_propuesta)
      .input('Equipo_Multidisciplinario',    sql.NVarChar(500),     body.equipo_multidisciplinario)
      .input('Factible',                     sql.Bit,               body.factible)
      .input('Prioridad',                    sql.VarChar(20),       body.prioridad)
      .input('Tipo',                         sql.VarChar(20),       body.tipo)
      .input('Proceso',                      sql.VarChar(200),      body.proceso)
      .input('Status',                       sql.VarChar(50),       body.status)
      .input('Fecha_Inicio',                 sql.Date,              body.fecha_inicio)
      .input('Fecha_Termino',                sql.Date,              body.fecha_termino)
      .input('Impacta_A',                    sql.VarChar(200),      body.impacta_a)
      .input('Costo_Beneficio',              sql.Decimal(5, 2),     body.costo_beneficio)
      .input('Uso_IA_Tecnologia',            sql.Decimal(5, 2),     body.uso_ia_tecnologia)
      .input('Impacto_Satisfaccion_Cliente', sql.Decimal(5, 2),     body.impacto_satisfaccion_cliente)
      .input('Facilidad_Implementacion',     sql.Decimal(5, 2),     body.facilidad_implementacion)
      .input('Escalabilidad',                sql.Decimal(5, 2),     body.escalabilidad)
      .input('Observaciones',                sql.NVarChar(sql.MAX), body.observaciones)
      .input('Formato_A3',                   sql.VarChar(500),      body.formato_a3)
      .input('Imagen',                       sql.VarChar(500),      body.imagen)
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
          Imagen                        = @Imagen
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