// Genera los SVG de docs/diagramas a partir de docs/datos/backlog.json (simulación) y de iconos.json.
// Uso: node docs/diagramas/fuentes/generar-diagramas.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { backlog, burndown, planHistorias, sprint, WIP } from "./simulacion.mjs";

const dir = new URL("../", import.meta.url);
const ICON = JSON.parse(readFileSync(new URL("iconos.json", import.meta.url), "utf8"));
const FONT = "Segoe UI, Arial, Helvetica, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const guardar = (nombre, svg) => {
  writeFileSync(new URL(nombre, dir), svg);
  console.log("✔", nombre);
};

/** Icono oficial (Simple Icons, viewBox 24x24) incrustado como vector. */
function icono(k, x, y, size = 28, color) {
  const i = ICON[k];
  const s = size / 24;
  return `<g transform="translate(${x},${y}) scale(${s})" aria-label="${esc(i.titulo)}"><title>${esc(i.titulo)}</title><path d="${i.path}" fill="#${color ?? i.hex}"/></g>`;
}

const fmt = (iso) => {
  const [, m, d] = iso.split("-");
  const meses = ["", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${+d} ${meses[+m]}`;
};

// ───────────────────────── Burndown ─────────────────────────
function svgBurndown(n) {
  const b = burndown(n);
  const s = sprint(n);
  const W = 960, H = 560, L = 80, R = 300, T = 96, B = 110;
  const pw = W - L - R, ph = H - T - B;
  const maxY = Math.ceil(b.comprometido / 2) * 2;
  const x = (d) => L + (d / 10) * pw;
  const y = (v) => T + ph - (v / maxY) * ph;
  let g = "";
  for (let v = 0; v <= maxY; v += 2) {
    g += `<line x1="${L}" y1="${y(v)}" x2="${L + pw}" y2="${y(v)}" stroke="#e3e6df"/>`;
    g += `<text x="${L - 10}" y="${y(v) + 5}" text-anchor="end" font-size="14" fill="#4a554a">${v}</text>`;
  }
  for (const d of b.dias) {
    g += `<line x1="${x(d.dia)}" y1="${T + ph}" x2="${x(d.dia)}" y2="${T + ph + 6}" stroke="#4a554a"/>`;
    g += `<text x="${x(d.dia)}" y="${T + ph + 24}" text-anchor="middle" font-size="13" fill="#1f2a1f">D${d.dia}</text>`;
    g += `<text x="${x(d.dia)}" y="${T + ph + 42}" text-anchor="middle" font-size="12" fill="#5d6b5d">${d.dia === 0 ? "inicio" : fmt(d.fecha)}</text>`;
  }
  const ideal = b.dias.map((d) => `${x(d.dia)},${y(d.ideal)}`).join(" ");
  // línea real en escalera: el trabajo baja cuando la historia pasa a Done
  let real = `M${x(0)},${y(b.dias[0].real)}`;
  for (let i = 1; i < b.dias.length; i++) real += ` H${x(b.dias[i].dia)} V${y(b.dias[i].real)}`;
  const puntos = b.dias
    .map((d) => `<circle cx="${x(d.dia)}" cy="${y(d.real)}" r="4" fill="#2f6b3a"/><text x="${x(d.dia) + 6}" y="${y(d.real) - 8}" font-size="12" fill="#2f6b3a" font-weight="600">${d.real}</text>`)
    .join("");
  const filas = b.historias
    .map((id) => backlog.historias.find((h) => h.id === id))
    .map((h, i) => {
      const hecho = h.sprint === n;
      return `<text x="${W - R + 30}" y="${T + 128 + i * 22}" font-size="13" fill="${hecho ? "#1f2a1f" : "#9a3b2f"}">${h.id} · ${h.sp} pts · ${hecho ? `Done D${h.dia_fin}` : "No terminada → S" + h.sprint}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" role="img" aria-labelledby="t${n}">
<title id="t${n}">Burndown Sprint ${n} (simulado)</title>
<rect width="${W}" height="${H}" fill="#ffffff"/>
<text x="${L}" y="38" font-size="22" font-weight="700" fill="#1f2a1f">Burndown · HMN Sprint ${n}</text>
<text x="${L}" y="62" font-size="14" fill="#5d6b5d">${fmt(s.inicio)} – ${fmt(s.fin)} 2026 · Objetivo: ${esc(s.objetivo)}</text>
<rect x="${W - 210}" y="20" width="180" height="28" rx="14" fill="#fff3d6" stroke="#e0b44a"/>
<text x="${W - 120}" y="39" text-anchor="middle" font-size="13" font-weight="700" fill="#7a5300">SIMULACIÓN ACADÉMICA</text>
<line x1="${L}" y1="${T}" x2="${L}" y2="${T + ph}" stroke="#4a554a"/>
<line x1="${L}" y1="${T + ph}" x2="${L + pw}" y2="${T + ph}" stroke="#4a554a"/>
${g}
<text transform="translate(26,${T + ph / 2}) rotate(-90)" text-anchor="middle" font-size="14" fill="#1f2a1f">Story points restantes</text>
<text x="${L + pw / 2}" y="${H - 22}" text-anchor="middle" font-size="14" fill="#1f2a1f">Día hábil del sprint (fecha de cierre del día)</text>
<polyline points="${ideal}" fill="none" stroke="#8a94a6" stroke-width="2.5" stroke-dasharray="8 6"/>
<path d="${real}" fill="none" stroke="#2f6b3a" stroke-width="3"/>
${puntos}
<g transform="translate(${W - R + 30},${T})">
  <line x1="0" y1="8" x2="34" y2="8" stroke="#8a94a6" stroke-width="2.5" stroke-dasharray="8 6"/><text x="44" y="13" font-size="14">Ideal</text>
  <line x1="0" y1="34" x2="34" y2="34" stroke="#2f6b3a" stroke-width="3"/><text x="44" y="39" font-size="14">Real (simulado)</text>
  <text x="0" y="74" font-size="14" font-weight="700">Comprometido: ${b.comprometido} pts</text>
  <text x="0" y="96" font-size="14" font-weight="700" fill="#2f6b3a">Velocidad: ${b.velocidad} pts</text>
</g>
${filas}
</svg>
`;
}

// ───────────────────────── Gantt ─────────────────────────
function svgGantt() {
  const plan = planHistorias();
  const inicio = new Date(backlog.sprints[0].inicio + "T12:00:00Z");
  const finProy = new Date(backlog.sprints[3].fin + "T12:00:00Z");
  const dias = Math.round((finProy - inicio) / 86400000) + 1;
  const L = 470, DW = 17, RH = 26, T = 130;
  const W = L + dias * DW + 100;
  const dx = (iso) => L + Math.round((new Date(iso + "T12:00:00Z") - inicio) / 86400000) * DW;
  const filas = [];
  for (const e of backlog.epicas) {
    const hs = backlog.historias.filter((h) => h.epica === e.id && plan[h.id]).sort((a, b) => plan[a.id].inicio.localeCompare(plan[b.id].inicio));
    if (!hs.length) continue;
    const ini = hs.map((h) => plan[h.id].inicio).sort()[0];
    const fin = hs.map((h) => plan[h.id].fin).sort().at(-1);
    filas.push({ tipo: "epica", id: e.id, texto: `${e.id} · ${e.nombre}`, ini, fin });
    for (const h of hs) filas.push({ tipo: "hist", id: h.id, texto: `${h.id} (${h.sp} pts) ${h.texto.replace(/^Como [^,]+, quiero /, "").split(",")[0]}`, ini: plan[h.id].inicio, fin: plan[h.id].fin, sp: h.sp });
  }
  const H = T + filas.length * RH + 150;
  const colEp = ["#6b4fbb", "#2d6cdf", "#b5651d", "#2f6b3a", "#a33a6b"];
  const color = (eid) => colEp[+eid.slice(1) - 1];
  const yOf = {};
  let svg = "";
  // cabecera de sprints
  for (const s of backlog.sprints) {
    const x1 = dx(s.inicio), x2 = dx(s.fin) + DW;
    svg += `<rect x="${x1}" y="${T - 74}" width="${x2 - x1}" height="26" fill="${s.n % 2 ? "#e8efe4" : "#dce7d6"}" stroke="#b9c7b2"/>`;
    svg += `<text x="${(x1 + x2) / 2}" y="${T - 56}" text-anchor="middle" font-size="13" font-weight="700">HMN Sprint ${s.n} · ${fmt(s.inicio)}–${fmt(s.fin)}</text>`;
  }
  // escala diaria y fines de semana
  for (let i = 0; i < dias; i++) {
    const d = new Date(inicio.getTime() + i * 86400000);
    const x = L + i * DW;
    const fin = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    if (fin) svg += `<rect x="${x}" y="${T - 46}" width="${DW}" height="${filas.length * RH + 46}" fill="#f2f2ef"/>`;
    if (d.getUTCDay() === 1 || i === 0) svg += `<text x="${x + 2}" y="${T - 30}" font-size="11" fill="#4a554a">${fmt(d.toISOString().slice(0, 10))}</text>`;
    svg += `<text x="${x + DW / 2}" y="${T - 10}" text-anchor="middle" font-size="9" fill="#7a857a">${"DLMMJVS"[d.getUTCDay()]}</text>`;
  }
  filas.forEach((f, i) => {
    const y = T + i * RH;
    yOf[f.id] = y + RH / 2;
    if (i % 2 === 0) svg += `<rect x="0" y="${y}" width="${W}" height="${RH}" fill="#000" fill-opacity="0.025"/>`;
    const txt = f.texto.length > 62 ? f.texto.slice(0, 60) + "…" : f.texto;
    svg += `<text x="${f.tipo === "epica" ? 12 : 30}" y="${y + 17}" font-size="${f.tipo === "epica" ? 13 : 12}" font-weight="${f.tipo === "epica" ? 700 : 400}" fill="#1f2a1f">${esc(txt)}</text>`;
    const x1 = dx(f.ini), x2 = dx(f.fin) + DW;
    const eid = f.tipo === "epica" ? f.id : backlog.historias.find((h) => h.id === f.id).epica;
    if (f.tipo === "epica") {
      svg += `<rect x="${x1}" y="${y + 8}" width="${x2 - x1}" height="10" fill="${color(eid)}" opacity="0.85"/>`;
      svg += `<path d="M${x1},${y + 8} l0,14 l7,-4 Z M${x2},${y + 8} l0,14 l-7,-4 Z" fill="${color(eid)}"/>`;
    } else {
      svg += `<rect x="${x1 + 1}" y="${y + 5}" width="${x2 - x1 - 2}" height="16" rx="4" fill="${color(eid)}" opacity="0.55" stroke="${color(eid)}"/>`;
      svg += `<text x="${x2 + 4}" y="${y + 17}" font-size="10" fill="#4a554a">${fmt(f.ini)}→${fmt(f.fin)}</text>`;
    }
  });
  // dependencias (fin → inicio)
  let deps = "";
  for (const p of Object.values(plan)) {
    for (const d of p.depende) {
      const a = plan[d];
      if (!a) continue;
      const xa = dx(a.fin) + DW - 1, ya = yOf[d], xb = dx(p.inicio) + 1, yb = yOf[p.id];
      const mid = Math.max(xa + 6, Math.min(xb - 6, xa + 10));
      deps += `<path d="M${xa},${ya} H${mid} V${yb} H${xb - 2}" fill="none" stroke="#c0392b" stroke-width="1.3" marker-end="url(#flecha)" opacity="0.8"/>`;
    }
  }
  // hitos
  const hitos = backlog.sprints.map((s) => ({ fecha: s.fin, texto: s.n === 4 ? "Release MVP" : `Review S${s.n}` }));
  let hs = "";
  const yh = T + filas.length * RH + 30;
  for (const h of hitos) {
    const x = dx(h.fecha) + DW / 2;
    hs += `<line x1="${x}" y1="${T - 46}" x2="${x}" y2="${yh - 10}" stroke="#7a5300" stroke-dasharray="3 3" opacity="0.6"/>`;
    hs += `<path d="M${x},${yh - 10} l9,9 l-9,9 l-9,-9 Z" fill="${h.texto.startsWith("Release") ? "#c0392b" : "#e0a12b"}"/>`;
    hs += `<text x="${x}" y="${yh + 26}" text-anchor="middle" font-size="12" font-weight="700">${h.texto}</text><text x="${x}" y="${yh + 41}" text-anchor="middle" font-size="11" fill="#5d6b5d">${fmt(h.fecha)}</text>`;
  }
  const noPlan = backlog.historias.filter((h) => !h.sprint).map((h) => `${h.id} (${h.moscow})`).join(", ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" role="img">
<title>Gantt de los 4 sprints (simulado)</title>
<defs><marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#c0392b"/></marker></defs>
<rect width="${W}" height="${H}" fill="#fff"/>
<text x="12" y="30" font-size="22" font-weight="700">Diagrama de Gantt · Hierberos y Medicina Naturista (HMN)</text>
<text x="12" y="52" font-size="13" fill="#5d6b5d">Épicas e historias por fecha de inicio y fin · flechas rojas = dependencias (fin→inicio) · rombos = hitos</text>
<rect x="${W - 230}" y="14" width="200" height="28" rx="14" fill="#fff3d6" stroke="#e0b44a"/><text x="${W - 130}" y="33" text-anchor="middle" font-size="13" font-weight="700" fill="#7a5300">SIMULACIÓN ACADÉMICA</text>
${svg}
${deps}
${hs}
<text x="12" y="${H - 16}" font-size="12" fill="#5d6b5d">No planificadas en los 4 sprints (quedan en backlog): ${esc(noPlan)}. Fines de semana sombreados. Fechas ficticias 2026.</text>
</svg>
`;
}

// ───────────────────────── Arquitectura lógica ─────────────────────────
function caja(x, y, w, h, titulo, lineas, ic, fill = "#ffffff", stroke = "#9fb39a") {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  if (ic) s += icono(ic, x + 12, y + 12, 26);
  s += `<text x="${x + (ic ? 46 : 14)}" y="${y + 31}" font-size="15" font-weight="700" fill="#1f2a1f">${esc(titulo)}</text>`;
  lineas.forEach((l, i) => (s += `<text x="${x + 14}" y="${y + 56 + i * 18}" font-size="12.5" fill="#33402f">${esc(l)}</text>`));
  return s;
}
function flecha(x1, y1, x2, y2, etiqueta, dx = 0, dy = -6, color = "#3b4a3b") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.8" marker-end="url(#fa)"/>` +
    (etiqueta ? `<text x="${(x1 + x2) / 2 + dx}" y="${(y1 + y2) / 2 + dy}" text-anchor="middle" font-size="11.5" fill="${color}" font-weight="600">${esc(etiqueta)}</text>` : "");
}

function svgArquitectura() {
  const W = 1300, H = 860;
  let s = "";
  // zonas
  s += `<rect x="20" y="80" width="250" height="560" rx="12" fill="#f4f6f1" stroke="#cfd8ca" stroke-dasharray="6 4"/><text x="34" y="104" font-size="13" font-weight="700" fill="#5d6b5d">CLIENTE</text>`;
  s += `<rect x="300" y="80" width="560" height="560" rx="12" fill="#f3f6fb" stroke="#c9d3e6" stroke-dasharray="6 4"/>`;
  s += icono("vercel", 314, 90, 18, "000000");
  s += `<text x="340" y="104" font-size="13" font-weight="700" fill="#4a5a78">VERCEL · Next.js 16 (Frontend + Backend/API)</text>`;
  s += `<rect x="890" y="80" width="390" height="560" rx="12" fill="#eefaf3" stroke="#bfe3cd" stroke-dasharray="6 4"/>`;
  s += icono("supabase", 904, 90, 18);
  s += `<text x="930" y="104" font-size="13" font-weight="700" fill="#2f6b4a">SUPABASE (servicio gestionado)</text>`;

  s += caja(40, 130, 210, 150, "Navegador", ["Comprador (anónimo)", "Hierbero (con sesión)", "HTML/CSS + React", "HTTPS"], null);
  s += caja(40, 320, 210, 120, "Validación cliente", ["required, min, max", "Formularios del panel", "(UX; no es control", "de seguridad)"], "react");

  s += caja(320, 130, 250, 165, "Páginas (Server Components)", ["/  catálogo + filtros", "/puestos, /puestos/[id]", "/login (Client Component)", "/panel (requiere sesión)"], "nextjs");
  s += caja(590, 130, 250, 165, "API / Route Handlers", ["GET /api/productos", "GET /api/salud (SHA)", "GET /auth/callback", "Respuestas JSON"], "nextjs");
  s += caja(320, 330, 250, 150, "Proxy (middleware)", ["Refresca cookie de sesión", "Protege /panel/*", "→ sin usuario: /login", "Valida JWT con getUser()"], "nextjs", "#fff8ec", "#e3c48f");
  s += caja(590, 330, 250, 150, "Server Actions + Zod", ["crearPuesto / crearProducto", "actualizarProducto", "Valida tipos, rangos,", "HTML y afirmaciones clínicas"], "typescript", "#fff8ec", "#e3c48f");
  s += caja(320, 510, 520, 110, "Capa de datos (src/lib/data.ts)", ["Cliente @supabase/ssr con la sesión del usuario (clave pública anon)", "Filtro publicado = true + reglas de negocio (catalog.ts)", "Modo demo con datos ficticios si no hay variables de entorno"], null);

  s += caja(910, 130, 350, 130, "Supabase Auth", ["Registro / ingreso email + contraseña", "Confirmación por correo", "Emite JWT (cookie httpOnly vía SSR)"], "supabase");
  s += caja(910, 290, 350, 140, "PostgREST (API REST)", ["Recibe consultas con JWT o anon", "Aplica rol: anon / authenticated", "Traduce a SQL"], "supabase");
  s += caja(910, 460, 350, 160, "PostgreSQL + RLS", ["plantas · puestos · productos", "anon: SELECT publicados", "dueño: INSERT/UPDATE propios", "CHECK: precio > 0, stock ≥ 0", "plantas: escritura solo service_role"], "postgresql", "#ffffff", "#7fb59a");

  // flechas
  s += flecha(250, 185, 318, 185, "HTTPS GET", 0, -8);
  s += `<path d="M145,130 V118 H715 V126" fill="none" stroke="#3b4a3b" stroke-width="1.8" marker-end="url(#fa)"/><text x="650" y="112" font-size="11.5" font-weight="600" fill="#3b4a3b">fetch JSON (/api/productos)</text>`;
  s += flecha(250, 380, 318, 380, "POST form", 0, -8);
  s += flecha(445, 295, 445, 328, "");
  s += flecha(570, 405, 588, 405, "");
  s += flecha(445, 480, 445, 508, "");
  s += flecha(715, 480, 715, 508, "");
  s += flecha(715, 295, 715, 328, "");
  s += flecha(840, 565, 908, 360, "HTTPS + JWT", -8, 30);
  s += flecha(840, 200, 908, 200, "signIn / signUp", 0, -8);
  s += flecha(1085, 430, 1085, 458, "SQL + rol");
  s += flecha(1085, 260, 1085, 288, "JWT");

  // leyenda de validaciones
  const yL = 670;
  s += `<rect x="20" y="${yL}" width="1260" height="170" rx="12" fill="#ffffff" stroke="#d5dccf"/>`;
  s += `<text x="40" y="${yL + 28}" font-size="15" font-weight="700">Dónde se valida cada cosa</text>`;
  const l = [
    ["Sesión", "Proxy (cookie → supabase.auth.getUser) y de nuevo en cada Server Action; Supabase Auth firma el JWT."],
    ["Permisos", "Políticas RLS en PostgreSQL: owner_id = auth.uid(); anon solo lee productos publicados. La app no usa service_role."],
    ["Datos", "Zod en Server Actions (tipos, rangos, sin HTML, sin afirmaciones de curación) + CHECK constraints en la base de datos."],
    ["Transporte", "HTTPS en Vercel y Supabase; cabeceras de seguridad (nosniff, X-Frame-Options DENY, Referrer-Policy) en next.config.ts."],
    ["Recorrido de una consulta", "Navegador → GET /?q=muna (Vercel) → Server Component → data.ts → PostgREST (anon) → RLS publicado=true → SQL → JSON → HTML."],
  ];
  l.forEach(([a, b], i) => {
    s += `<text x="40" y="${yL + 56 + i * 22}" font-size="13" font-weight="700" fill="#2f6b3a">${a}:</text>`;
    s += `<text x="${a.length > 12 ? 230 : 130}" y="${yL + 56 + i * 22}" font-size="13" fill="#1f2a1f">${esc(b)}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" role="img">
<title>Arquitectura lógica · Hierberos</title>
<defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#3b4a3b"/></marker></defs>
<rect width="${W}" height="${H}" fill="#fff"/>
<text x="20" y="38" font-size="24" font-weight="700">Arquitectura lógica · Directorio de hierberos (MVP implementado)</text>
<text x="20" y="62" font-size="13" fill="#5d6b5d">Componentes desplegados en Vercel (aplicación) y Supabase (autenticación y base de datos). Iconos: Simple Icons (CC0).</text>
${s}
</svg>
`;
}

// ───────────────────────── Pipeline DevSecOps ─────────────────────────
function svgPipeline() {
  const W = 1400, H = 640;
  let s = "";
  const etapa = (x, y, w, h, titulo, lineas, ic, fill, stroke) => caja(x, y, w, h, titulo, lineas, ic, fill, stroke);
  // carriles
  s += `<text x="24" y="112" font-size="13" font-weight="700" fill="#5d6b5d">1 · Desarrollo</text>`;
  s += etapa(24, 124, 200, 150, "Rama test", ["Commits con clave Jira", "(HMN-xx)", "Push → CI en test", "Preview Vercel (demo)"], "github", "#fff", "#c9c9c9");
  s += etapa(24, 300, 200, 130, "Pull Request", ["test → main", "Checks obligatorios", "(ruleset de main)", "Revisión"], "github", "#fff", "#c9c9c9");
  s += `<text x="270" y="112" font-size="13" font-weight="700" fill="#5d6b5d">2 · Checks en GitHub Actions (sin secretos de producción)</text>`;
  s += etapa(270, 124, 230, 150, "Build y pruebas", ["npm ci (lockfile)", "tsc --noEmit", "Vitest (28 pruebas, JUnit)", "next build"], "githubactions", "#f2f7ff", "#9dbcf0");
  s += etapa(520, 124, 230, 150, "SAST · CodeQL", ["javascript-typescript", "security-extended", "Alertas en Security tab"], "github", "#f2f7ff", "#9dbcf0");
  s += etapa(270, 300, 230, 150, "Dependencias", ["npm audit --audit-level=high", "Dependency Review (PR)", "Falla con high/critical"], "npm", "#f2f7ff", "#9dbcf0");
  s += etapa(520, 300, 230, 150, "Secretos · Gitleaks", ["Historial completo (git)", "Reporte SARIF redactado", "Falla si hay secretos"], "githubactions", "#f2f7ff", "#9dbcf0");
  s += `<rect x="262" y="96" width="496" height="368" rx="12" fill="none" stroke="#2088ff" stroke-dasharray="6 4"/>`;
  s += `<text x="800" y="112" font-size="13" font-weight="700" fill="#5d6b5d">3 · Publicación</text>`;
  s += etapa(800, 124, 240, 150, "Merge a main", ["Solo si todos los checks", "están en verde", "Commit = SHA a publicar"], "github", "#fff", "#c9c9c9");
  s += etapa(800, 300, 240, 150, "Deploy · Vercel", ["Integración Git (único", "mecanismo de despliegue)", "Production ← main", "Env Supabase solo en Prod"], "vercel", "#f6f6f6", "#999");
  s += `<text x="1080" y="112" font-size="13" font-weight="700" fill="#5d6b5d">4 · Operación y monitoreo</text>`;
  s += etapa(1080, 124, 290, 150, "Verificar despliegue", ["Evento deployment_status", "Espera SHA en /api/salud", "GET / = 200", "GET /api/productos sin borradores"], "githubactions", "#effaf3", "#8fd1a8");
  s += etapa(1080, 300, 290, 150, "Producción", ["URL pública en Vercel", "Supabase: Auth + Postgres", "RLS activo", "Logs Vercel / Supabase"], "supabase", "#effaf3", "#8fd1a8");

  s += flecha(124, 274, 124, 298, "");
  s += flecha(224, 365, 268, 365, "dispara", 0, -8);
  s += flecha(224, 200, 268, 200, "push", 0, -8);
  s += flecha(758, 280, 798, 200, "todos ✔", -2, -4, "#2f6b3a");
  s += flecha(920, 274, 920, 298, "webhook");
  s += flecha(1040, 375, 1078, 375, "");
  s += flecha(1040, 330, 1078, 220, "deployment_status", -4, 22);
  s += flecha(1225, 274, 1225, 298, "");
  s += `<path d="M640,464 V520 H124 V432" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#fa)"/>`;
  s += `<text x="140" y="540" font-size="12" font-weight="600" fill="#c0392b">✘ check en rojo → bloquea el merge; se corrige en test y se vuelve a ejecutar</text>`;

  s += `<rect x="24" y="548" width="1346" height="74" rx="10" fill="#fff" stroke="#d5dccf"/>`;
  s += `<text x="40" y="572" font-size="13" font-weight="700">Permisos mínimos:</text><text x="180" y="572" font-size="13">contents: read en todos los workflows; security-events: write solo en CodeQL. Ningún workflow tiene tokens de Vercel ni de Supabase.</text>`;
  s += `<text x="40" y="596" font-size="13" font-weight="700">Entornos:</text><text x="180" y="596" font-size="13">PR/test → Vercel Preview en modo demo (datos ficticios en código) · main → Vercel Production con Supabase (variables solo en Production).</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" role="img">
<title>Pipeline DevSecOps · PR, checks y despliegue</title>
<defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#3b4a3b"/></marker></defs>
<rect width="${W}" height="${H}" fill="#fff"/>
<text x="24" y="40" font-size="24" font-weight="700">Pipeline DevSecOps · del Pull Request a producción</text>
<text x="24" y="64" font-size="13" fill="#5d6b5d">Workflows: .github/workflows/ci.yml · codeql.yml · verificar-despliegue.yml — Iconos: Simple Icons (CC0)</text>
${s}
</svg>
`;
}

for (const n of [1, 2, 3, 4]) guardar(`burndown-sprint-${n}.svg`, svgBurndown(n));
guardar("gantt-cuatro-sprints.svg", svgGantt());
guardar("arquitectura-logica.svg", svgArquitectura());
guardar("pipeline-devsecops.svg", svgPipeline());

// datos fuente de los burndown para el informe
const datos = [1, 2, 3, 4].map(burndown);
writeFileSync(new URL("../datos/burndown.json", dir), JSON.stringify({ nota: "SIMULACIÓN", wip: WIP, sprints: datos }, null, 2));
writeFileSync(new URL("../datos/plan-historias.json", dir), JSON.stringify(planHistorias(), null, 2));
console.log("✔ datos/burndown.json, datos/plan-historias.json");
