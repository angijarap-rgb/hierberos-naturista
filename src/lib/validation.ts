import { z } from "zod";

/**
 * Expresiones que atribuyen beneficios clínicos no sustentados.
 * El caso exige no difundir afirmaciones de curación (H10).
 */
const AFIRMACIONES_PROHIBIDAS = [
  /\bcura(?:r|n|s)?\b/i,
  /\bsana(?:r|n)?\b/i,
  /elimina(?:r)? el c[aá]ncer/i,
  /\bmilagros[oa]\b/i,
  /reemplaza (?:al|el) (?:m[eé]dico|tratamiento)/i,
  /garantizad[oa]/i,
];

export function contieneAfirmacionClinica(texto: string): boolean {
  return AFIRMACIONES_PROHIBIDAS.some((re) => re.test(texto));
}

const textoSeguro = (campo: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${campo}: máximo ${max} caracteres`)
    .refine((t) => !/[<>]/.test(t), `${campo}: no se permiten etiquetas HTML`);

/** H9, H10, H13: reglas para publicar un producto. */
export const productoSchema = z.object({
  nombre: textoSeguro("Nombre", 80).pipe(z.string().min(2, "Nombre: mínimo 2 caracteres")),
  planta_id: z.string().uuid().nullable().optional(),
  precio: z.coerce
    .number({ error: "Precio inválido" })
    .positive("El precio debe ser mayor que 0")
    .max(1000, "El precio no puede superar S/ 1000"),
  unidad: z.enum(["atado", "100 g", "250 g", "500 g", "1 kg", "frasco", "sobre", "unidad"]),
  stock: z.coerce.number().int("El stock debe ser entero").min(0, "El stock no puede ser negativo").max(10000),
  procedencia: textoSeguro("Procedencia", 80).pipe(z.string().min(3, "La procedencia es obligatoria")),
  uso_tradicional: textoSeguro("Uso tradicional", 400)
    .refine((t) => !contieneAfirmacionClinica(t), "No se permiten afirmaciones de curación o beneficios clínicos")
    .optional()
    .nullable(),
  publicado: z.coerce.boolean().default(false),
});

export type ProductoInput = z.infer<typeof productoSchema>;

/** H14: actualización parcial de precio y stock. */
export const actualizacionSchema = productoSchema.pick({ precio: true, stock: true });

export const puestoSchema = z.object({
  nombre: textoSeguro("Nombre", 80).pipe(z.string().min(3)),
  tipo: z.enum(["hierbero", "tienda"]),
  mercado: textoSeguro("Mercado", 80).optional().nullable(),
  distrito: textoSeguro("Distrito", 40).pipe(z.string().min(3)),
  direccion: textoSeguro("Dirección", 120).pipe(z.string().min(5)),
  horario: textoSeguro("Horario", 60).pipe(z.string().min(3)),
  telefono: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, "Teléfono: 9 dígitos que empiezan con 9")
    .optional()
    .nullable()
    .or(z.literal("")),
});
