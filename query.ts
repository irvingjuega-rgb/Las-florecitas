import { getConnection } from "./lib/db.js";
async function main() {
  const pool = await getConnection();
  const res = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Calificaciones_Mejoras' AND TABLE_SCHEMA='dbo';");
  console.log(JSON.stringify(res.recordset, null, 2));
  process.exit(0);
}
main().catch(console.error);
