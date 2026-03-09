import { getConnection } from "./lib/db.js";
async function main() {
  const pool = await getConnection();
  const res = await pool.request().query("SELECT * FROM BioflexRFID.dbo.Calificaciones_Mejoras;");
  console.log(Object.keys(res.recordset[0]));
  process.exit(0);
}
main().catch(console.error);
