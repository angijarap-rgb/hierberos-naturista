import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Intercambia el código del correo de confirmación por una sesión y redirige al panel. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const sb = await supabaseServer();
  if (code && sb) {
    await sb.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL("/panel", req.nextUrl.origin));
}
