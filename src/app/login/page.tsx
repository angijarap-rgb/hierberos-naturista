"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"ingresar" | "registrar">("ingresar");
  const [msg, setMsg] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url || !key) {
      setMsg({ tipo: "error", texto: "Autenticación no configurada en este entorno (modo demo)." });
      return;
    }
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (password.length < 8) {
      setMsg({ tipo: "error", texto: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    setCargando(true);
    const sb = createBrowserClient(url, key);
    const res =
      modo === "ingresar"
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    setCargando(false);
    if (res.error) {
      setMsg({ tipo: "error", texto: "No se pudo completar la operación. Verifica tus datos." });
      return;
    }
    if (modo === "registrar") {
      setMsg({ tipo: "ok", texto: "Cuenta creada. Revisa tu correo para confirmarla y luego ingresa." });
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  return (
    <>
      <h1>{modo === "ingresar" ? "Ingreso de hierberos" : "Registro de hierberos"}</h1>
      <form className="stack card" onSubmit={enviar}>
        <label>
          Correo
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" required minLength={8} autoComplete={modo === "ingresar" ? "current-password" : "new-password"} />
        </label>
        <button type="submit" disabled={cargando}>{modo === "ingresar" ? "Ingresar" : "Crear cuenta"}</button>
        <button type="button" className="sec" onClick={() => { setModo(modo === "ingresar" ? "registrar" : "ingresar"); setMsg(null); }}>
          {modo === "ingresar" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
        </button>
        {msg && <p className={msg.tipo === "ok" ? "ok-msg" : "error"}>{msg.texto}</p>}
      </form>
    </>
  );
}
