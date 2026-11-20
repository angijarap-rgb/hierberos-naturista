import { describe, expect, it } from "vitest";
import {
  disponibilidad,
  distritosDe,
  filtrarCatalogo,
  filtrarPuestos,
  formatearPrecio,
  leerFiltros,
  normalizar,
  soloPublicados,
} from "@/lib/catalog";
import { PLANTAS, PRODUCTOS, PUESTOS } from "@/lib/seed";
import type { ProductoCatalogo } from "@/lib/types";

function catalogo(): ProductoCatalogo[] {
  return PRODUCTOS.map((p) => {
    const puesto = PUESTOS.find((x) => x.id === p.puesto_id)!;
    const planta = PLANTAS.find((x) => x.id === p.planta_id) ?? null;
    return { ...p, puesto, planta };
  });
}

describe("H8 · solo productos publicados", () => {
  it("excluye borradores del catálogo", () => {
    const publicados = soloPublicados(PRODUCTOS);
    expect(publicados.every((p) => p.publicado)).toBe(true);
    expect(publicados.find((p) => p.nombre === "Muña (borrador)")).toBeUndefined();
  });

  it("filtrarCatalogo nunca devuelve borradores aunque coincidan con la búsqueda", () => {
    const r = filtrarCatalogo(catalogo(), { q: "borrador" });
    expect(r).toHaveLength(0);
  });
});

describe("H5 · búsqueda por nombre de hierba", () => {
  it("encuentra 'muña' sin distinguir mayúsculas ni tildes", () => {
    const r = filtrarCatalogo(catalogo(), { q: "MUNA" });
    expect(r.map((p) => p.nombre).sort()).toEqual(["Muña fresca", "Muña seca"]);
  });

  it("busca también por nombre científico", () => {
    const r = filtrarCatalogo(catalogo(), { q: "uncaria" });
    expect(r).toHaveLength(1);
    expect(r[0].nombre).toContain("Uña de gato");
  });

  it("devuelve vacío cuando no hay coincidencias", () => {
    expect(filtrarCatalogo(catalogo(), { q: "planta-inexistente" })).toEqual([]);
  });

  it("normalizar quita tildes y espacios", () => {
    expect(normalizar("  Hierba LUISA ")).toBe("hierba luisa");
    expect(normalizar("Uña")).toBe("una");
  });
});

describe("H6 · precio y disponibilidad", () => {
  it("stock 0 se muestra como Agotado", () => {
    expect(disponibilidad({ stock: 0 })).toBe("Agotado");
    expect(disponibilidad({ stock: 3 })).toBe("Disponible");
  });

  it("formatea precios en soles con dos decimales", () => {
    expect(formatearPrecio(2.5)).toBe("S/ 2.50");
  });
});

describe("H7 · filtros por disponibilidad y precio máximo", () => {
  it("solo disponibles excluye productos con stock 0", () => {
    const r = filtrarCatalogo(catalogo(), { soloDisponibles: true });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.stock > 0)).toBe(true);
  });

  it("precio máximo S/ 5 incluye 5 y excluye mayores", () => {
    const r = filtrarCatalogo(catalogo(), { precioMax: 5 });
    expect(r.every((p) => p.precio <= 5)).toBe(true);
    expect(r.some((p) => p.precio === 5)).toBe(true);
  });

  it("combina búsqueda, distrito y disponibilidad", () => {
    const r = filtrarCatalogo(catalogo(), { q: "hierba luisa", distrito: "Breña", soloDisponibles: true });
    expect(r).toHaveLength(0); // en Breña la hierba luisa está agotada
  });

  it("leerFiltros interpreta los parámetros de la URL", () => {
    expect(leerFiltros({ q: "muña", disponible: "1", max: "4.5", distrito: "Breña" })).toEqual({
      q: "muña",
      distrito: "Breña",
      soloDisponibles: true,
      precioMax: 4.5,
    });
  });
});

describe("H1/H2 · directorio de puestos", () => {
  it("filtra por distrito y 'Todos' devuelve todo", () => {
    expect(filtrarPuestos(PUESTOS, "Breña").every((p) => p.distrito === "Breña")).toBe(true);
    expect(filtrarPuestos(PUESTOS, "Todos")).toHaveLength(PUESTOS.length);
  });

  it("lista distritos únicos ordenados", () => {
    const d = distritosDe(PUESTOS);
    expect(new Set(d).size).toBe(d.length);
    expect(d[0]).toBe("Breña");
  });
});
