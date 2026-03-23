import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mejoraId = searchParams.get('mejoraId');
    if (!mejoraId) {
      return NextResponse.json({ ok: false, error: 'Se requiere el parámetro mejoraId' }, { status: 400 });
    }
    
    let pool;
    try {
      pool = await getConnection();
    } catch (connErr) {
      return NextResponse.json({ ok: true, data: [], isMock: true });
    }

    const result = await pool.request()
      .input('MejoraId', sql.Int, Number(mejoraId))
      .query(`
        SELECT Id, MejoraId, Usuario, Comentario, FechaCreacion 
        FROM dbo.Comentarios 
        WHERE MejoraId = @MejoraId 
        ORDER BY FechaCreacion DESC
      `);

    return NextResponse.json({ ok: true, data: result.recordset });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.mejoraId || !body.usuario || !body.comentario) {
      return NextResponse.json({ ok: false, error: 'Faltan datos requeridos (mejoraId, usuario, comentario)' }, { status: 400 });
    }

    let pool;
    try {
      pool = await getConnection();
    } catch (connErr) {
      return NextResponse.json({ ok: false, error: 'Base de datos no disponible' }, { status: 503 });
    }
    
    await pool.request()
      .input('MejoraId', sql.Int, Number(body.mejoraId))
      .input('Usuario', sql.NVarChar(150), body.usuario)
      .input('Comentario', sql.NVarChar(sql.MAX), body.comentario)
      .query(`
        INSERT INTO dbo.Comentarios (MejoraId, Usuario, Comentario, FechaCreacion)
        VALUES (@MejoraId, @Usuario, @Comentario, GETDATE())
      `);

    return NextResponse.json({ ok: true, message: 'Comentario agregado correctamente' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
