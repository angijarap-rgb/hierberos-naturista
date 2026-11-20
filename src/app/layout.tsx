import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hierberos · Directorio naturista",
  description: "Encuentra hierberos y tiendas naturistas: productos, precios, disponibilidad y procedencia (MVP académico con datos ficticios).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="top">
          <nav>
            <Link href="/" className="logo">🌿 Hierberos</Link>
            <Link href="/">Catálogo</Link>
            <Link href="/puestos">Puestos</Link>
            <Link href="/panel">Soy hierbero</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          Proyecto académico (PFC III · PC2). Los puestos, precios y existencias mostrados son <strong>datos ficticios</strong>.
          La información de uso tradicional no constituye consejo médico.
        </footer>
      </body>
    </html>
  );
}
