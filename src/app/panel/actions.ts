"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { actualizacionSchema, productoSchema, puestoSchema } from "@/lib/validation";

export type Estado = { ok?: string; error?: string };

async function sesion() {
  const sb = await supabaseServer();
  if (!sb) redirect("/login");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return { sb, user };
}

const primerError = (e: { issues: { message: string }[] }) => e.issues[0]?.message ?? "Datos inválidos";

export async function crearPuesto(_: Estado, fd: FormData): Promise<Estado> {
  const { sb, user } = await sesion();
  const parsed = puestoSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: primerError(parsed.error) };
  const { error } = await sb.from("puestos").insert({ ...parsed.data, telefono: parsed.data.telefono || null, owner_id: user.id });
  if (error) return { error: "No se pudo registrar el puesto." };
  revalidatePath("/panel");
  return { ok: "Puesto registrado." };
}

/** H13: el puesto se obtiene de la sesión; RLS impide insertar en puestos ajenos (H15). */
export async function crearProducto(_: Estado, fd: FormData): Promise<Estado> {
  const { sb, user } = await sesion();
  const datos = Object.fromEntries(fd);
  const parsed = productoSchema.safeParse({
    ...datos,
    planta_id: datos.planta_id || null,
    uso_tradicional: datos.uso_tradicional || null,
    publicado: datos.publicado === "on",
  });
  if (!parsed.success) return { error: primerError(parsed.error) };
  const { data: puesto } = await sb.from("puestos").select("id").eq("owner_id", user.id).maybeSingle();
  if (!puesto) return { error: "Primero registra tu puesto." };
  const { error } = await sb.from("productos").insert({ ...parsed.data, puesto_id: puesto.id });
  if (error) return { error: "No se pudo guardar el producto." };
  revalidatePath("/panel");
  revalidatePath("/");
  return { ok: "Producto guardado." };
}

/** H14: actualizar precio y stock de un producto propio. */
export async function actualizarProducto(_: Estado, fd: FormData): Promise<Estado> {
  const { sb } = await sesion();
  const id = String(fd.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Producto inválido" };
  const parsed = actualizacionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: primerError(parsed.error) };
  const { data, error } = await sb.from("productos").update(parsed.data).eq("id", id).select("id");
  if (error || !data?.length) return { error: "No autorizado o producto inexistente." };
  revalidatePath("/panel");
  revalidatePath("/");
  return { ok: "Actualizado." };
}

export async function salir() {
  const sb = await supabaseServer();
  await sb?.auth.signOut();
  redirect("/");
}
