import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { salir } from "./actions";
import { FormActualizar, FormProducto, FormPuesto } from "./forms";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const sb = await supabaseServer();
  if (!sb) redirect("/login");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: puesto } = await sb.from("puestos").select("id,nombre,distrito").eq("owner_id", user.id).maybeSingle();
  const { data: plantas } = await sb.from("plantas").select("id,nombre_comun").order("nombre_comun");
  const { data: productos } = puesto
    ? await sb.from("productos").select("id,nombre,precio,stock,publicado").eq("puesto_id", puesto.id).order("nombre")
    : { data: [] };

  return (
    <>
      <h1>Panel del hierbero</h1>
      <p className="meta">
        Sesión: {user.email} ·{" "}
        <form action={salir} style={{ display: "inline" }}>
          <button className="sec" type="submit">Salir</button>
        </form>
      </p>
      {!puesto ? (
        <>
          <h2>Registra tu puesto</h2>
          <FormPuesto />
        </>
      ) : (
        <>
          <h2>{puesto.nombre} · {puesto.distrito}</h2>
          <h3>Mis productos</h3>
          {productos && productos.length > 0 ? (
            <table>
              <thead>
                <tr><th>Producto</th><th>Estado</th><th>Precio y stock</th></tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.publicado ? "Publicado" : "Borrador"}</td>
                    <td><FormActualizar id={p.id} precio={Number(p.precio)} stock={p.stock} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aún no tienes productos.</p>
          )}
          <h3>Publicar producto</h3>
          <FormProducto plantas={plantas ?? []} />
        </>
      )}
    </>
  );
}
