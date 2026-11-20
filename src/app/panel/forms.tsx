"use client";

import { useActionState } from "react";
import { actualizarProducto, crearProducto, crearPuesto, type Estado } from "./actions";

const inicial: Estado = {};

function Mensaje({ s }: { s: Estado }) {
  if (s.error) return <p className="error">{s.error}</p>;
  if (s.ok) return <p className="ok-msg">{s.ok}</p>;
  return null;
}

export function FormPuesto() {
  const [s, action, pending] = useActionState(crearPuesto, inicial);
  return (
    <form action={action} className="stack card">
      <label>Nombre del puesto<input name="nombre" required /></label>
      <label>Tipo
        <select name="tipo"><option value="hierbero">Hierbero</option><option value="tienda">Tienda naturista</option></select>
      </label>
      <label>Mercado o feria<input name="mercado" /></label>
      <label>Distrito<input name="distrito" required /></label>
      <label>Dirección<input name="direccion" required /></label>
      <label>Horario<input name="horario" required placeholder="Lun-Sáb 6:00-14:00" /></label>
      <label>Teléfono<input name="telefono" inputMode="numeric" placeholder="9XXXXXXXX" /></label>
      <button disabled={pending}>Registrar puesto</button>
      <Mensaje s={s} />
    </form>
  );
}

export function FormProducto({ plantas }: { plantas: { id: string; nombre_comun: string }[] }) {
  const [s, action, pending] = useActionState(crearProducto, inicial);
  return (
    <form action={action} className="stack card">
      <label>Nombre<input name="nombre" required /></label>
      <label>Planta
        <select name="planta_id">
          <option value="">(Sin ficha)</option>
          {plantas.map((p) => <option key={p.id} value={p.id}>{p.nombre_comun}</option>)}
        </select>
      </label>
      <label>Precio (S/)<input name="precio" type="number" step="0.1" min="0.1" required /></label>
      <label>Unidad
        <select name="unidad">
          {["atado", "100 g", "250 g", "500 g", "1 kg", "frasco", "sobre", "unidad"].map((u) => <option key={u}>{u}</option>)}
        </select>
      </label>
      <label>Stock<input name="stock" type="number" min="0" step="1" required /></label>
      <label>Procedencia (región/provincia)<input name="procedencia" required /></label>
      <label>Uso tradicional (sin afirmaciones médicas)<textarea name="uso_tradicional" maxLength={400} /></label>
      <label className="check"><input type="checkbox" name="publicado" /> Publicar en el catálogo</label>
      <button disabled={pending}>Guardar producto</button>
      <Mensaje s={s} />
    </form>
  );
}

export function FormActualizar({ id, precio, stock }: { id: string; precio: number; stock: number }) {
  const [s, action, pending] = useActionState(actualizarProducto, inicial);
  return (
    <form action={action} style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={id} />
      <input name="precio" type="number" step="0.1" defaultValue={precio} style={{ width: 90 }} aria-label="Precio" />
      <input name="stock" type="number" step="1" defaultValue={stock} style={{ width: 80 }} aria-label="Stock" />
      <button disabled={pending}>Guardar</button>
      <Mensaje s={s} />
    </form>
  );
}
