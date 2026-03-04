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