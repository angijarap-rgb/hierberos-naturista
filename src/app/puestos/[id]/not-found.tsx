import Link from "next/link";

export default function PuestoNoEncontrado() {
  return (
    <>
      <h1>Puesto no encontrado</h1>
      <p>
        El puesto solicitado no existe. <Link href="/puestos">Volver al directorio</Link>
      </p>
    </>
  );
}
