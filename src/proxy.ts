import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfig } from "@/lib/supabase/config";

/** Refresca la sesión de Supabase y protege /panel (H12): sin sesión se redirige a /login. */
export async function proxy(req: NextRequest) {
  const cfg = supabaseConfig();
  let res = NextResponse.next({ request: req });
  if (!cfg) {
    return req.nextUrl.pathname.startsWith("/panel") ? NextResponse.redirect(new URL("/login", req.url)) : res;
  }
  const sb = createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user && req.nextUrl.pathname.startsWith("/panel")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return res;
}

export const config = { matcher: ["/panel/:path*"] };
