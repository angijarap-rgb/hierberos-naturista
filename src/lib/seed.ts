import type { Planta, Producto, Puesto } from "./types";

/**
 * DATOS FICTICIOS para demostración académica.
 * Nombres de puestos, teléfonos, precios y stock son inventados.
 * Los usos tradicionales se describen como prácticas declaradas, sin atribuir beneficios clínicos.
 * Deben coincidir con supabase/seed.sql.
 */
export const PUESTOS: Puesto[] = [
  { id: "11111111-1111-4111-8111-000000000001", nombre: "Hierbas Doña Rosa (ficticio)", tipo: "hierbero", mercado: "Mercado Central", distrito: "Cercado de Lima", direccion: "Puesto 214, pabellón B", horario: "Lun-Sáb 6:00-14:00", telefono: "900000001" },
  { id: "11111111-1111-4111-8111-000000000002", nombre: "El Rincón Andino (ficticio)", tipo: "hierbero", mercado: "Mercado de Breña", distrito: "Breña", direccion: "Puesto 37, zona de hierbas", horario: "Lun-Dom 7:00-13:00", telefono: "900000002" },
  { id: "11111111-1111-4111-8111-000000000003", nombre: "Naturista Vida Verde (ficticio)", tipo: "tienda", mercado: null, distrito: "Miraflores", direccion: "Av. Ejemplo 123", horario: "Lun-Sáb 9:00-20:00", telefono: "900000003" },
  { id: "11111111-1111-4111-8111-000000000004", nombre: "Feria Ecológica - Stand 5 (ficticio)", tipo: "hierbero", mercado: "Bioferia", distrito: "Surquillo", direccion: "Parque de ejemplo s/n", horario: "Sáb 8:00-14:00", telefono: null },
  { id: "11111111-1111-4111-8111-000000000005", nombre: "Hierbería San Juan (ficticio)", tipo: "hierbero", mercado: "Mercado Modelo", distrito: "San Juan de Lurigancho", direccion: "Puesto 88", horario: "Lun-Sáb 6:30-15:00", telefono: "900000005" },
];

export const PLANTAS: Planta[] = [
  { id: "22222222-2222-4222-8222-000000000001", nombre_comun: "Muña", nombre_cientifico: "Minthostachys mollis" },
  { id: "22222222-2222-4222-8222-000000000002", nombre_comun: "Manzanilla", nombre_cientifico: "Matricaria chamomilla" },
  { id: "22222222-2222-4222-8222-000000000003", nombre_comun: "Hierba luisa", nombre_cientifico: "Cymbopogon citratus" },
  { id: "22222222-2222-4222-8222-000000000004", nombre_comun: "Uña de gato", nombre_cientifico: "Uncaria tomentosa" },
  { id: "22222222-2222-4222-8222-000000000005", nombre_comun: "Cola de caballo", nombre_cientifico: "Equisetum arvense" },
  { id: "22222222-2222-4222-8222-000000000006", nombre_comun: "Maca", nombre_cientifico: "Lepidium meyenii" },
];

const P = PUESTOS.map((p) => p.id);
const PL = PLANTAS.map((p) => p.id);

export const PRODUCTOS: Producto[] = [
  { id: "33333333-3333-4333-8333-000000000001", puesto_id: P[0], planta_id: PL[0], nombre: "Muña fresca", precio: 2.5, unidad: "atado", stock: 30, procedencia: "Huancavelica", uso_tradicional: "Se acostumbra preparar en infusión después de las comidas.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000002", puesto_id: P[0], planta_id: PL[1], nombre: "Manzanilla seca", precio: 4, unidad: "100 g", stock: 12, procedencia: "Junín", uso_tradicional: "Uso tradicional en infusión caliente por la noche.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000003", puesto_id: P[1], planta_id: PL[2], nombre: "Hierba luisa", precio: 1.5, unidad: "atado", stock: 0, procedencia: "Lima - Huaral", uso_tradicional: "Tradicionalmente se usa como infusión aromática.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000004", puesto_id: P[1], planta_id: PL[0], nombre: "Muña seca", precio: 5, unidad: "250 g", stock: 8, procedencia: "Cusco", uso_tradicional: "Se emplea en infusiones y como condimento en la cocina andina.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000005", puesto_id: P[2], planta_id: PL[3], nombre: "Uña de gato (corteza)", precio: 18, unidad: "250 g", stock: 5, procedencia: "Ucayali", uso_tradicional: "Uso tradicional amazónico en cocimiento de la corteza.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000006", puesto_id: P[2], planta_id: PL[5], nombre: "Maca en polvo", precio: 22, unidad: "500 g", stock: 15, procedencia: "Junín - Carhuamayo", uso_tradicional: "Se consume tradicionalmente en bebidas y mazamorras.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000007", puesto_id: P[3], planta_id: PL[4], nombre: "Cola de caballo", precio: 3, unidad: "atado", stock: 10, procedencia: "Áncash", uso_tradicional: "Se prepara tradicionalmente en infusión.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000008", puesto_id: P[3], planta_id: PL[1], nombre: "Manzanilla orgánica", precio: 6, unidad: "100 g", stock: 0, procedencia: "Cajamarca", uso_tradicional: null, publicado: true },
  { id: "33333333-3333-4333-8333-000000000009", puesto_id: P[4], planta_id: PL[2], nombre: "Hierba luisa fresca", precio: 2, unidad: "atado", stock: 20, procedencia: "Lima - Cieneguilla", uso_tradicional: "Infusión aromática de uso cotidiano.", publicado: true },
  { id: "33333333-3333-4333-8333-000000000010", puesto_id: P[4], planta_id: PL[0], nombre: "Muña (borrador)", precio: 2, unidad: "atado", stock: 4, procedencia: "Huánuco", uso_tradicional: null, publicado: false },
];
