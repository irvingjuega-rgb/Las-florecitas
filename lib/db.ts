// lib/db.ts
import sql from 'mssql';

const config: sql.config = {
  server: '172.16.10.239',
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: {
    instanceName: 'THESPIDERSERVER',  // <- instancia nombrada va aquí
    encrypt: false,                    // false para servidores locales/red interna
    trustServerCertificate: true,
  },
  port: 1433,
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  if (pool) return pool;
  console.log('Connecting to SQL Server:', config.server, config.options?.instanceName);
  try {
    pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully');
    return pool;
  } catch (err) {
    console.error('Error connecting to SQL Server:', err);
    throw err;
  }
}