import { ProductoCard } from "@/components/ProductoCard";
import { distritosDe, filtrarCatalogo, leerFiltros } from "@/lib/catalog";
import { obtenerCatalogo } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CatalogoPage({ searchParams }: Props) {
  const filtros = leerFiltros(await searchParams);
  const { productos, fuente } = await obtenerCatalogo();
  const resultado = filtrarCatalogo(productos, filtros);
  const distritos = distritosDe(productos.map((p) => p.puesto));

  return (
    <>
      <h1>¿Qué hierba buscas?</h1>
      <p className="demo">
        Datos ficticios para demostración académica{fuente === "demo" ? " (modo demo sin base de datos)" : ""}.
      </p>
      <form className="filtros" method="get" role="search">
        <label>
          Hierba o producto
          <input name="q" defaultValue={filtros.q ?? ""} placeholder="Ej. muña, manzanilla" maxLength={60} />
        </label>
        <label>
          Distrito
          <select name="distrito" defaultValue={filtros.distrito ?? ""}>
            <option value="">Todos</option>
            {distritos.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Precio máx. (S/)
          <input name="max" type="number" min="0" step="0.5" defaultValue={filtros.precioMax ?? ""} />
        </label>
        <label className="check">
          <input type="checkbox" name="disponible" value="1" defaultChecked={filtros.soloDisponibles} /> Solo disponibles
        </label>
        <button type="submit">Buscar</button>
      </form>

      <p className="meta">{resultado.length} producto(s) encontrado(s)</p>
      {resultado.length === 0 ? (
        <p>No se encontraron productos.</p>
      ) : (
        <section className="grid">
          {resultado.map((p) => (
            <ProductoCard key={p.id} p={p} />
          ))}
        </section>
      )}
    </>
  );
}
