// Genera supabase/seed.sql a partir de src/lib/seed.ts para que ambos datos ficticios coincidan.
// Uso: node --experimental-strip-types scripts/generar-seed.ts
import { writeFileSync } from "node:fs";
import { PLANTAS, PRODUCTOS, PUESTOS } from "../src/lib/seed.ts";

const v = (x: unknown) => (x === null || x === undefined ? "null" : typeof x === "number" || typeof x === "boolean" ? String(x) : `'${String(x).replace(/'/g, "''")}'`);

const lineas = [
  "-- DATOS FICTICIOS (generado por scripts/generar-seed.ts). No representan comercios reales.",
  ...PLANTAS.map((p) => `insert into public.plantas (id, nombre_comun, nombre_cientifico) values (${v(p.id)}, ${v(p.nombre_comun)}, ${v(p.nombre_cientifico)}) on conflict (id) do nothing;`),
  ...PUESTOS.map((p) => `insert into public.puestos (id, nombre, tipo, mercado, distrito, direccion, horario, telefono) values (${[p.id, p.nombre, p.tipo, p.mercado, p.distrito, p.direccion, p.horario, p.telefono].map(v).join(", ")}) on conflict (id) do nothing;`),
  ...PRODUCTOS.map((p) => `insert into public.productos (id, puesto_id, planta_id, nombre, precio, unidad, stock, procedencia, uso_tradicional, publicado) values (${[p.id, p.puesto_id, p.planta_id, p.nombre, p.precio, p.unidad, p.stock, p.procedencia, p.uso_tradicional, p.publicado].map(v).join(", ")}) on conflict (id) do nothing;`),
];
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lineas.join("\n") + "\n");
console.log(`seed.sql: ${PLANTAS.length} plantas, ${PUESTOS.length} puestos, ${PRODUCTOS.length} productos`);
