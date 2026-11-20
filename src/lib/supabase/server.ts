import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "./config";

/** Cliente de Supabase para Server Components, Route Handlers y Server Actions. Usa la sesión del usuario (cookies). */
export async function supabaseServer() {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  const store = await cookies();
  return createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // En Server Components no se pueden escribir cookies; el middleware refresca la sesión.
        }
      },
    },
  });
}
