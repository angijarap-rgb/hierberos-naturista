import { PLANTAS, PRODUCTOS, PUESTOS } from "./seed";
import { soloPublicados } from "./catalog";
import { supabaseServer } from "./supabase/server";
import type { ProductoCatalogo, Puesto } from "./types";

const SELECT_CATALOGO =
  "id,puesto_id,planta_id,nombre,precio,unidad,stock,procedencia,uso_tradicional,publicado,puesto:puestos(id,nombre,distrito,mercado),planta:plantas(nombre_comun,nombre_cientifico)";

export type Fuente = "supabase" | "demo";

function catalogoDemo(): ProductoCatalogo[] {
  return soloPublicados(PRODUCTOS).map((p) => {
    const puesto = PUESTOS.find((x) => x.id === p.puesto_id)!;
    const planta = PLANTAS.find((x) => x.id === p.planta_id) ?? null;
    return {
      ...p,
      puesto: { id: puesto.id, nombre: puesto.nombre, distrito: puesto.distrito, mercado: puesto.mercado },
      planta: planta ? { nombre_comun: planta.nombre_comun, nombre_cientifico: planta.nombre_cientifico } : null,
    };
  });
}

/** Productos publicados. La regla se aplica en la consulta y también en RLS (defensa en profundidad). */
export async function obtenerCatalogo(): Promise<{ productos: ProductoCatalogo[]; fuente: Fuente }> {
  const sb = await supabaseServer();
  if (!sb) return { productos: catalogoDemo(), fuente: "demo" };
  const { data, error } = await sb.from("productos").select(SELECT_CATALOGO).eq("publicado", true).order("nombre");
  if (error) throw new Error(`Error consultando catálogo: ${error.message}`);
  const productos = ((data ?? []) as unknown as ProductoCatalogo[]).map((p) => ({ ...p, precio: Number(p.precio) }));
  return { productos, fuente: "supabase" };
}

export async function obtenerPuestos(): Promise<Puesto[]> {
  const sb = await supabaseServer();
  if (!sb) return PUESTOS;
  const { data, error } = await sb
    .from("puestos")
    .select("id,nombre,tipo,mercado,distrito,direccion,horario,telefono")
    .order("nombre");
  if (error) throw new Error(`Error consultando puestos: ${error.message}`);
  return (data ?? []) as Puesto[];
}

export async function obtenerPuesto(id: string): Promise<{ puesto: Puesto | null; productos: ProductoCatalogo[] }> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { puesto: null, productos: [] };
  const puestos = await obtenerPuestos();
  const puesto = puestos.find((p) => p.id === id) ?? null;
  if (!puesto) return { puesto: null, productos: [] };
  const { productos } = await obtenerCatalogo();
  return { puesto, productos: productos.filter((p) => p.puesto_id === id) };
}
