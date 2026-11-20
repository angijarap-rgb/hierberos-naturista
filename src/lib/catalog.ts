import type { FiltrosCatalogo, Producto, ProductoCatalogo, Puesto } from "./types";

export const AVISO_USO_TRADICIONAL =
  "Información de uso tradicional declarada por el vendedor; no reemplaza la consulta médica ni constituye una indicación de tratamiento.";

/** Normaliza texto para búsquedas: minúsculas y sin tildes. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** H8: solo los productos publicados llegan al catálogo. */
export function soloPublicados<T extends Pick<Producto, "publicado">>(productos: T[]): T[] {
  return productos.filter((p) => p.publicado === true);
}

/** H6: estado de disponibilidad a partir del stock. */
export function disponibilidad(producto: Pick<Producto, "stock">): "Disponible" | "Agotado" {
  return producto.stock > 0 ? "Disponible" : "Agotado";
}

export function formatearPrecio(precio: number): string {
  return `S/ ${precio.toFixed(2)}`;
}

/** H5 + H7: búsqueda por nombre/planta y filtros de distrito, disponibilidad y precio. */
export function filtrarCatalogo(productos: ProductoCatalogo[], filtros: FiltrosCatalogo): ProductoCatalogo[] {
  const q = filtros.q ? normalizar(filtros.q) : "";
  return soloPublicados(productos).filter((p) => {
    if (q) {
      const campos = [p.nombre, p.planta?.nombre_comun ?? "", p.planta?.nombre_cientifico ?? ""].map(normalizar);
      if (!campos.some((c) => c.includes(q))) return false;
    }
    if (filtros.distrito && p.puesto.distrito !== filtros.distrito) return false;
    if (filtros.soloDisponibles && p.stock <= 0) return false;
    if (typeof filtros.precioMax === "number" && !Number.isNaN(filtros.precioMax) && p.precio > filtros.precioMax) {
      return false;
    }
    return true;
  });
}

/** H2: filtro de puestos por distrito ("" o "Todos" devuelve todos). */
export function filtrarPuestos(puestos: Puesto[], distrito?: string): Puesto[] {
  if (!distrito || distrito === "Todos") return puestos;
  return puestos.filter((p) => p.distrito === distrito);
}

export function distritosDe(puestos: Pick<Puesto, "distrito">[]): string[] {
  return [...new Set(puestos.map((p) => p.distrito))].sort((a, b) => a.localeCompare(b, "es"));
}

/** Convierte los searchParams de la URL en filtros tipados. */
export function leerFiltros(sp: Record<string, string | string[] | undefined>): FiltrosCatalogo {
  const uno = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const max = uno("max");
  return {
    q: uno("q")?.slice(0, 60) || undefined,
    distrito: uno("distrito") || undefined,
    soloDisponibles: uno("disponible") === "1",
    precioMax: max ? Number(max) : undefined,
  };
}
