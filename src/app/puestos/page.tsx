import Link from "next/link";
import { distritosDe, filtrarPuestos } from "@/lib/catalog";
import { obtenerPuestos } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ distrito?: string }> };

export default async function PuestosPage({ searchParams }: Props) {
  const { distrito } = await searchParams;
  const todos = await obtenerPuestos();
  const puestos = filtrarPuestos(todos, distrito);

  return (
    <>
      <h1>Hierberos y tiendas naturistas</h1>
      <form method="get" className="filtros" style={{ gridTemplateColumns: "1fr auto" }}>
        <label>
          Distrito
          <select name="distrito" defaultValue={distrito ?? "Todos"}>
            <option value="Todos">Todos</option>
            {distritosDe(todos).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <button type="submit">Filtrar</button>
      </form>
      {puestos.length === 0 ? (
        <p>No hay puestos registrados.</p>
      ) : (
        <section className="grid">
          {puestos.map((p) => (
            <article className="card" key={p.id} data-testid="puesto">
              <h3><Link href={`/puestos/${p.id}`}>{p.nombre}</Link></h3>
              <p className="meta">{p.tipo === "hierbero" ? "Hierbero" : "Tienda naturista"} · {p.mercado ?? "Local propio"}</p>
              <p className="meta">{p.distrito}</p>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
