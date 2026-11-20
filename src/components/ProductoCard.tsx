import Link from "next/link";
import { AVISO_USO_TRADICIONAL, disponibilidad, formatearPrecio } from "@/lib/catalog";
import type { ProductoCatalogo } from "@/lib/types";

export function ProductoCard({ p, mostrarPuesto = true }: { p: ProductoCatalogo; mostrarPuesto?: boolean }) {
  const estado = disponibilidad(p);
  return (
    <article className="card" data-testid="producto">
      <h3>{p.nombre}</h3>
      {p.planta && <div className="sci">{p.planta.nombre_comun} · {p.planta.nombre_cientifico}</div>}
      <p className="meta">
        <span className="precio">{formatearPrecio(p.precio)}</span> / {p.unidad}{" "}
        <span className={`badge ${estado === "Disponible" ? "ok" : "off"}`}>{estado}</span>
      </p>
      <p className="meta">Procedencia declarada: <strong>{p.procedencia}</strong></p>
      {mostrarPuesto && (
        <p className="meta">
          <Link href={`/puestos/${p.puesto.id}`}>{p.puesto.nombre}</Link> · {p.puesto.mercado ?? "Tienda"} · {p.puesto.distrito}
        </p>
      )}
      {p.uso_tradicional && (
        <>
          <p className="meta">Uso tradicional: {p.uso_tradicional}</p>
          <div className="aviso">{AVISO_USO_TRADICIONAL}</div>
        </>
      )}
    </article>
  );
}
