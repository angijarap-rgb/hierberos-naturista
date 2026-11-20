import { notFound } from "next/navigation";
import { ProductoCard } from "@/components/ProductoCard";
import { obtenerPuesto } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { puesto, productos } = await obtenerPuesto(id);
  if (!puesto) notFound();

  return (
    <>
      <h1>{puesto.nombre}</h1>
      <div className="card">
        <p className="meta">{puesto.tipo === "hierbero" ? "Hierbero" : "Tienda naturista"} · {puesto.mercado ?? "Local propio"}</p>
        <p className="meta">Dirección: {puesto.direccion}, {puesto.distrito}</p>
        <p className="meta">Horario: {puesto.horario}</p>
        <p className="meta">Contacto: {puesto.telefono ?? "No registrado"}</p>
      </div>
      <h2>Productos publicados</h2>
      {productos.length === 0 ? (
        <p>Este puesto aún no publica productos.</p>
      ) : (
        <section className="grid">
          {productos.map((p) => (
            <ProductoCard key={p.id} p={p} mostrarPuesto={false} />
          ))}
        </section>
      )}
    </>
  );
}
