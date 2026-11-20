import { NextResponse, type NextRequest } from "next/server";
import { filtrarCatalogo, leerFiltros } from "@/lib/catalog";
import { obtenerCatalogo } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/productos?q=&distrito=&disponible=1&max= — ruta crítica del MVP (solo productos publicados). */
export async function GET(req: NextRequest) {
  try {
    const filtros = leerFiltros(Object.fromEntries(req.nextUrl.searchParams));
    const { productos, fuente } = await obtenerCatalogo();
    const data = filtrarCatalogo(productos, filtros);
    return NextResponse.json({
      fuente,
      total: data.length,
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      aviso: "Datos ficticios con fines académicos",
      productos: data,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo consultar el catálogo" }, { status: 500 });
  }
}
