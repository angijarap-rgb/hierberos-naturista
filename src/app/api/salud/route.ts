import { NextResponse } from "next/server";
import { supabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/** Health check usado por la verificación post-despliegue. No expone secretos. */
export function GET() {
  return NextResponse.json({
    estado: "ok",
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    entorno: process.env.VERCEL_ENV ?? "local",
    baseDeDatos: supabaseConfig() ? "supabase" : "demo",
  });
}
