import { describe, expect, it } from "vitest";
import { actualizacionSchema, contieneAfirmacionClinica, productoSchema, puestoSchema } from "@/lib/validation";

const valido = {
  nombre: "Muña fresca",
  precio: "2.5",
  unidad: "atado",
  stock: "10",
  procedencia: "Huancavelica",
  uso_tradicional: "Se acostumbra preparar en infusión.",
  publicado: true,
};

describe("H13 · validar publicación de producto", () => {
  it("acepta un producto válido y convierte números", () => {
    const r = productoSchema.safeParse(valido);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.precio).toBe(2.5);
      expect(r.data.stock).toBe(10);
    }
  });

  it.each([
    [{ precio: "0" }, "El precio debe ser mayor que 0"],
    [{ precio: "-3" }, "El precio debe ser mayor que 0"],
    [{ stock: "-1" }, "El stock no puede ser negativo"],
    [{ stock: "1.5" }, "El stock debe ser entero"],
  ])("rechaza %o", (cambio, mensaje) => {
    const r = productoSchema.safeParse({ ...valido, ...cambio });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.message)).toContain(mensaje);
  });

  it("rechaza etiquetas HTML en el nombre", () => {
    expect(productoSchema.safeParse({ ...valido, nombre: "<script>x</script>" }).success).toBe(false);
  });
});

describe("H9 · procedencia obligatoria", () => {
  it("rechaza publicación sin procedencia", () => {
    const r = productoSchema.safeParse({ ...valido, procedencia: "" });
    expect(r.success).toBe(false);
  });
});

describe("H10 · uso tradicional sin afirmaciones clínicas", () => {
  it.each(["Cura la gastritis", "Elimina el cáncer", "Remedio milagroso", "Resultados garantizados"])(
    "detecta '%s'",
    (texto) => {
      expect(contieneAfirmacionClinica(texto)).toBe(true);
      expect(productoSchema.safeParse({ ...valido, uso_tradicional: texto }).success).toBe(false);
    },
  );

  it("permite descripciones de uso tradicional neutrales", () => {
    expect(contieneAfirmacionClinica("Se prepara tradicionalmente en infusión")).toBe(false);
  });
});

describe("H14 · actualizar precio y stock", () => {
  it("valida solo precio y stock", () => {
    expect(actualizacionSchema.safeParse({ precio: "3", stock: "0" }).success).toBe(true);
    expect(actualizacionSchema.safeParse({ precio: "3", stock: "-2" }).success).toBe(false);
  });
});

describe("Registro de puesto", () => {
  it("valida teléfono peruano de 9 dígitos", () => {
    const base = { nombre: "Puesto prueba", tipo: "hierbero", distrito: "Breña", direccion: "Puesto 12", horario: "Lun-Sáb" };
    expect(puestoSchema.safeParse({ ...base, telefono: "987654321" }).success).toBe(true);
    expect(puestoSchema.safeParse({ ...base, telefono: "12345" }).success).toBe(false);
  });
});
