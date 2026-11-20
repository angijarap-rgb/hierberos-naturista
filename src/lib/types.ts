export type TipoPuesto = "hierbero" | "tienda";

export interface Puesto {
  id: string;
  nombre: string;
  tipo: TipoPuesto;
  mercado: string | null;
  distrito: string;
  direccion: string;
  horario: string;
  telefono: string | null;
}

export interface Planta {
  id: string;
  nombre_comun: string;
  nombre_cientifico: string;
}

export interface Producto {
  id: string;
  puesto_id: string;
  planta_id: string | null;
  nombre: string;
  precio: number;
  unidad: string;
  stock: number;
  procedencia: string;
  uso_tradicional: string | null;
  publicado: boolean;
}

/** Producto listo para mostrar en el catálogo, con su puesto y planta. */
export interface ProductoCatalogo extends Producto {
  puesto: Pick<Puesto, "id" | "nombre" | "distrito" | "mercado">;
  planta: Pick<Planta, "nombre_comun" | "nombre_cientifico"> | null;
}

export interface FiltrosCatalogo {
  q?: string;
  distrito?: string;
  soloDisponibles?: boolean;
  precioMax?: number;
}
