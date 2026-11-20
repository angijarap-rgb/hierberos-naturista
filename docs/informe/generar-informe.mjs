// Genera docs/informe/Informe-PC2-Hierberos.html (autocontenido: SVG e imágenes incrustados).
// Luego se imprime a PDF con Chrome headless (ver README de docs/informe).
// Uso: node docs/informe/generar-informe.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { backlog, burndown, planHistorias, sprint, WIP, verificarWip } from "../diagramas/fuentes/simulacion.mjs";

const aqui = new URL("./", import.meta.url);
const docs = new URL("../", import.meta.url);
const L = JSON.parse(readFileSync(new URL("enlaces.json", aqui), "utf8"));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const svg = (n) => readFileSync(new URL(`diagramas/${n}.svg`, docs), "utf8").replace(/<\?xml[^>]*>/, "");
const img = (n, alt) => {
  const p = new URL(`evidencias/${n}`, docs);
  if (!existsSync(p)) return `<p class="pend">Captura pendiente: ${esc(n)}</p>`;
  const b64 = readFileSync(p).toString("base64");
  const mime = n.endsWith(".png") ? "image/png" : "image/jpeg";
  return `<figure><img src="data:${mime};base64,${b64}" alt="${esc(alt)}"/><figcaption>${esc(alt)} <span class="src">(captura real · ${esc(n)})</span></figcaption></figure>`;
};
const link = (u, t) => (u ? `<a href="${esc(u)}">${esc(t ?? u)}</a>` : `<span class="pend">pendiente</span>`);
const campo = (v, etiqueta) => (v ? esc(v) : `<span class="campo">[${etiqueta}]</span>`);
const jiraKey = (h) => "HMN-" + (+h.slice(1) + 9);
const epicKey = { E1: "HMN-5", E2: "HMN-6", E3: "HMN-7", E4: "HMN-8", E5: "HMN-9" };
const plan = planHistorias();
const bds = [1, 2, 3, 4].map(burndown);
const totalPlan = backlog.historias.filter((h) => h.sprint).reduce((a, h) => a + h.sp, 0);
const totalVel = bds.reduce((a, b) => a + b.velocidad, 0);
const evid = existsSync(new URL("evidencias/", docs)) ? readdirSync(new URL("evidencias/", docs)) : [];
const hay = (pref) => evid.some((f) => f.startsWith(pref));

// ── Matriz de rúbrica ──
const est = (ok, pend = "Pendiente") => (ok ? `<span class="ok">Hecho</span>` : `<span class="pend">${pend}</span>`);
const matriz = [
  ["P1", "Épicas definidas", 1.5, "5 épicas con descripción y objetivo de negocio (HMN-5…HMN-9)", "jira-03, jira-05", est(true)],
  ["P1", "Historias de usuario", 1.5, "19 historias «Como/quiero/para» vinculadas a épica con criterios Dado/Cuando/Entonces", "jira-01, jira-06", est(true)],
  ["P1", "Estimación y priorización", 1, "Story points Fibonacci (planning poker) + MoSCoW → prioridad Jira", "Tabla §1.3, jira-01", est(true)],
  ["P1", "Evidencia en Jira", 1, "Capturas reales + enlace al proyecto", "jira-01…06", est(true, "Falta compartir con el docente")],
  ["P2", "Planificación de sprints", 1.5, "4 sprints con fechas, goal, backlog y puntos", "Tabla §2.1, jira-10…16", est(true)],
  ["P2", "Burndown", 1.5, "4 burndown ideal vs real + datos fuente + velocidad", "burndown-sprint-1…4.svg, burndown.json", est(true)],
  ["P2", "Diagrama de Gantt", 1, "Épicas, historias, fechas, dependencias e hitos", "gantt-cuatro-sprints.svg", est(true)],
  ["P2", "Tablero Kanban", 1, "To Do / In Progress / In Review / Done, WIP 3 y 2, capturas por sprint", "jira-04, jira-10…16", est(true)],
  ["P3", "Arquitectura lógica", 2, "Capas, comunicación y puntos de validación", "arquitectura-logica.svg", est(true)],
  ["P3", "Stack en el ciclo DevSecOps", 1, "8 fases con herramienta, actividad y control", "Tabla §3.2", est(true)],
  ["P3", "Seguridad integrada", 1, "Controles por fase, ejecutados vs diseñados", "Tabla §3.3", est(true)],
  ["P3", "Vínculo con el caso", 1, "Justificación de cada tecnología", "§3.4", est(true)],
  ["P4", "Estrategia de branching", 1, "main + test, commits descriptivos, PR test→main", L.pr ? "PR enlazado" : "Commits locales listos", est(!!L.pr, "Pendiente push y PR")],
  ["P4", "Pipeline explicado", 1, "ci.yml, codeql.yml, verificar-despliegue.yml", L.run_ci ? "Ejecución enlazada" : "Configurado (sin ejecución aún)", est(!!L.run_ci, "Configurado")],
  ["P4", "Pruebas automatizadas", 1, "28 pruebas Vitest con reporte JUnit en Actions", L.run_ci ? "Run de Actions" : "Ejecutadas localmente: 28/28", est(!!L.run_ci, "Local OK · falta en Actions")],
  ["P4", "Seguridad implementada", 1, "CodeQL, npm audit, Dependency Review, Gitleaks, RLS", L.run_ci ? "Run de Actions" : "npm audit local: 0 vulnerabilidades", est(!!L.run_ci, "Configurado")],
  ["P4", "Link a la solución", 1, "URL pública en Vercel + verificación post-deploy", L.nube ? "URL verificada" : "—", est(!!L.nube)],
];

// ── Tablas de backlog ──
const filasEpicas = backlog.epicas
  .map((e) => {
    const hs = backlog.historias.filter((h) => h.epica === e.id);
    return `<tr><td><b>${e.id}</b><br><small>${epicKey[e.id]}</small></td><td><b>${esc(e.nombre)}</b><br>${esc(e.descripcion)}</td><td>${esc(e.objetivo)}</td><td>${hs.length} historias · ${hs.reduce((a, h) => a + h.sp, 0)} pts</td></tr>`;
  })
  .join("");
const filasHist = backlog.historias
  .map(
    (h) =>
      `<tr><td><b>${h.id}</b><br><small>${jiraKey(h.id)}</small></td><td>${h.epica}</td><td>${esc(h.texto)}<ul>${h.ca.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></td><td class="c">${h.sp}</td><td class="c">${h.moscow}</td><td class="c">${h.sprint ? "S" + h.sprint + (h.sprint_inicial ? " (inició S" + h.sprint_inicial + ")" : "") : "Backlog"}</td></tr>`,
  )
  .join("");

const filasSprints = backlog.sprints
  .map((s) => {
    const b = bds[s.n - 1];
    return `<tr><td><b>HMN Sprint ${s.n}</b></td><td>${s.inicio} → ${s.fin}<br><small>2 semanas · 10 días hábiles</small></td><td>${esc(s.objetivo)}</td><td>${b.historias.map((id) => `${id} (${backlog.historias.find((h) => h.id === id).sp})`).join(", ")}</td><td class="c">${b.comprometido}</td><td class="c"><b>${b.velocidad}</b></td><td>${b.noTerminadas.length ? b.noTerminadas.join(", ") + " pasa a S" + (s.n + 1) : "—"}</td></tr>`;
  })
  .join("");

const tablaBurn = bds
  .map(
    (b) =>
      `<tr><td><b>S${b.sprint}</b></td>${b.dias.map((d) => `<td class="c">${d.ideal}<br><b>${d.real}</b></td>`).join("")}</tr>`,
  )
  .join("");

const fases = [
  ["Plan", "Jira Software (Scrum)", "Backlog, épicas, story points, sprints, Kanban con WIP", "Historias de seguridad en el backlog (H15 RLS, H17 SAST/secretos); criterios de aceptación con casos de abuso (afirmaciones clínicas, anónimos)", "Ejecutado · capturas jira-*"],
  ["Code", "Next.js 16 + TypeScript, VS Code, Git", "Código en ramas test/main con commits referenciando HMN-xx", "TypeScript estricto; Zod valida entradas; sin secretos en el repo (.gitignore de .env, .env.example sin valores); cliente Supabase solo con clave pública", "Ejecutado"],
  ["Build", "GitHub Actions + npm ci + next build", "Instalación reproducible desde package-lock.json y compilación", "Versiones fijadas (save-exact); lockfile obligatorio; permisos contents: read", L.run_ci ? "Ejecutado en Actions" : "Configurado · build local OK"],
  ["Test", "Vitest (28 pruebas) + reporte JUnit", "Reglas del MVP: solo publicados, búsqueda, filtros, validación de publicación", "Pruebas de reglas de seguridad de datos (rechazo de HTML, de afirmaciones clínicas, precios/stock inválidos)", L.run_ci ? "Ejecutado en Actions" : "Ejecutado local 28/28"],
  ["Release", "Pull Request test → main + checks requeridos", "Revisión y merge solo con checks en verde", "SAST CodeQL, npm audit (high), Dependency Review, Gitleaks bloquean el merge", L.pr ? "Ejecutado" : "Configurado"],
  ["Deploy", "Vercel (integración Git)", "main → Production; test/PR → Preview (modo demo)", "Variables de Supabase solo en Production; HTTPS; sin tokens de despliegue en GitHub", L.nube ? "Ejecutado" : "Pendiente de importar en Vercel"],
  ["Operate", "Vercel + Supabase (Auth, PostgreSQL)", "Servir la app y la base de datos gestionada", "RLS en 3 tablas, 8 políticas; cabeceras de seguridad; sesión con cookie httpOnly (@supabase/ssr)", "RLS ejecutado y verificado en Supabase"],
  ["Monitor", "Workflow verificar-despliegue + logs Vercel/Supabase", "Comprobar URL pública, SHA y ruta crítica tras cada deploy", "Detecta exposición de borradores en /api/productos; CodeQL semanal; alertas Dependabot (diseñado)", L.run_deploy ? "Ejecutado" : "Configurado"],
];
const filasFases = fases.map((f) => `<tr>${f.map((c, i) => `<td${i === 0 ? ' class="b"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("");

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe PC2 · Hierberos y medicina naturista</title>
<style>
@page { size: A4; margin: 16mm 14mm; }
body { font-family: "Segoe UI", Arial, sans-serif; color: #1f2a1f; font-size: 10.5pt; line-height: 1.45; }
h1 { font-size: 20pt; margin: 0 0 4px; } h2 { font-size: 15pt; border-bottom: 2px solid #2f6b3a; padding-bottom: 3px; margin-top: 26px; page-break-after: avoid; }
h3 { font-size: 12pt; margin: 16px 0 6px; page-break-after: avoid; color: #2f6b3a; }
table { border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 9pt; page-break-inside: auto; }
th, td { border: 1px solid #cdd5c8; padding: 4px 6px; vertical-align: top; } th { background: #e8efe4; text-align: left; }
tr { page-break-inside: avoid; } td.c { text-align: center; } td.b { font-weight: 700; }
ul { margin: 2px 0 2px 16px; padding: 0; } li { margin: 0; }
figure { margin: 8px 0 14px; page-break-inside: avoid; } figure img, figure svg { max-width: 100%; height: auto; border: 1px solid #ddd; }
figcaption { font-size: 8.5pt; color: #5d6b5d; } .src { color: #8a948a; }
.portada { border: 2px solid #2f6b3a; padding: 18px; border-radius: 8px; margin-bottom: 16px; }
.campo { background: #fff3d6; border: 1px dashed #e0b44a; padding: 0 6px; }
.ok { color: #2f6b3a; font-weight: 700; } .pend { color: #9a3b2f; font-weight: 700; }
.nota { background: #fff8ec; border-left: 4px solid #e0b44a; padding: 6px 10px; margin: 8px 0; }
.sim { background: #fff3d6; border: 1px solid #e0b44a; padding: 1px 6px; border-radius: 10px; font-size: 8.5pt; font-weight: 700; color: #7a5300; }
.salto { page-break-before: always; } code { background: #f1f3ef; padding: 0 3px; font-size: 9pt; }
</style></head><body>

<div class="portada">
<div style="font-size:10pt;color:#5d6b5d">Proyecto Final de Carrera III · Práctica Calificada 2 · Tipo K</div>
<h1>Caso «Medicina naturista y hierberos»</h1>
<div>Directorio y catálogo de hierberos y tiendas naturistas — Scrum, DevSecOps y despliegue en la nube</div>
<table style="margin-top:12px">
<tr><th style="width:28%">Estudiante (nombres y apellidos)</th><td>${campo(L.estudiante, "COMPLETAR NOMBRES Y APELLIDOS")}</td></tr>
<tr><th>Sección</th><td>${campo(L.seccion, "COMPLETAR SECCIÓN")}</td></tr>
<tr><th>Docente</th><td>${campo(L.docente, "COMPLETAR DOCENTE")}</td></tr>
<tr><th>Fecha</th><td>${esc(L.fecha)}</td></tr>
</table>
<h3>Enlaces exigidos</h3>
<table>
<tr><th>#</th><th>Recurso</th><th>Enlace</th><th>Acceso del docente</th></tr>
<tr><td>1</td><td>Repositorio GitHub</td><td>${link(L.github)}</td><td>${esc(L.github_estado)}</td></tr>
<tr><td>2</td><td>Proyecto Jira</td><td>${link(L.jira)}</td><td>${esc(L.jira_estado)}</td></tr>
<tr><td>3</td><td>Solución en la nube</td><td>${link(L.nube)}</td><td>${esc(L.nube_estado)}</td></tr>
</table>
</div>

<h2>0. Alcance, modalidad y organización</h2>
<p><b>Problema.</b> Muchas personas buscan hierbas y remedios tradicionales, pero no saben dónde están los hierberos ni las tiendas naturistas, qué venden, a qué precio, si hay stock, ni de dónde provienen los productos. Los hierberos trabajan en mercados y ferias y dependen del boca a boca.</p>
<p><b>Alcance del MVP demostrable.</b> Directorio de puestos por distrito; ficha del puesto; catálogo con búsqueda por hierba, precio, disponibilidad y procedencia; uso tradicional con aviso de que no es consejo médico; registro de hierberos con Supabase Auth y publicación de productos propios protegida por RLS; API <code>/api/productos</code>; pipeline CI/CD con controles de seguridad.</p>
<div class="nota"><b>Datos ficticios.</b> Todos los puestos, teléfonos, precios y existencias son inventados y están marcados «(ficticio)». La aplicación no atribuye beneficios clínicos: la validación rechaza textos como «cura» o «elimina el cáncer» y cada uso tradicional muestra un aviso.</div>
<p><b>Fuera de alcance (backlog):</b> mapa de puestos (H4, Could) y moderación de publicaciones reportadas (H19, Won't en esta versión).</p>
<h3>Declaración de trabajo y apoyo</h3>
<p>La evaluación permite el uso de asistentes de IA. El trabajo se hizo con las cuentas de la estudiante (GitHub <code>angijarap-rgb</code>, sitio Jira <code>angiejara.atlassian.net</code>, Supabase y Vercel), con su autorización. Distribución de actividades:</p>
<table><tr><th>Actividad</th><th>Realizó</th></tr>
<tr><td>Autorizar el uso de sus cuentas, definir el caso y validar el alcance</td><td>Estudiante</td></tr>
<tr><td>Crear el sitio y el proyecto Jira, cargar backlog, sprints, WIP y simular el tablero</td><td>Asistente IA (Claude) con la sesión de la estudiante</td></tr>
<tr><td>Código de la app, pruebas, migraciones, workflows, diagramas SVG e informe</td><td>Asistente IA (Claude), revisado por la estudiante</td></tr>
<tr><td>Crear el repositorio GitHub y hacer push; importar en Vercel; compartir accesos con el docente</td><td>Estudiante (pasos que requieren su confirmación)</td></tr>
<tr><td>Sustentación presencial</td><td>Estudiante</td></tr></table>

<h3>Matriz de seguimiento de la rúbrica</h3>
<table><tr><th>Pregunta</th><th>Criterio</th><th>Pts</th><th>Entregable</th><th>Evidencia</th><th>Estado</th></tr>
${matriz.map((m) => `<tr><td>${m[0]}</td><td>${m[1]}</td><td class="c">${m[2]}</td><td>${esc(m[3])}</td><td>${esc(m[4])}</td><td>${m[5]}</td></tr>`).join("")}
<tr><th colspan="2">Total</th><th class="c">20</th><th colspan="3"></th></tr></table>

<h3>Organización en los 120 minutos de la evaluación</h3>
<p>El tiempo real de la evaluación (120 min) es distinto de las fechas ficticias de los cuatro sprints (7 sep – 30 oct 2026), que solo existen dentro de la simulación.</p>
<table><tr><th>Minutos</th><th>Actividad</th><th>Pregunta</th></tr>
<tr><td>0–10</td><td>Lectura del caso, alcance del MVP y matriz de rúbrica</td><td>—</td></tr>
<tr><td>10–35</td><td>Jira: épicas, historias, criterios, story points, MoSCoW</td><td>P1</td></tr>
<tr><td>35–60</td><td>Sprints, simulación Kanban con WIP, burndown y Gantt</td><td>P2</td></tr>
<tr><td>60–75</td><td>Arquitectura lógica y tabla DevSecOps</td><td>P3</td></tr>
<tr><td>75–105</td><td>Repositorio, ramas, PR, pipeline, Supabase y despliegue en Vercel</td><td>P4</td></tr>
<tr><td>105–115</td><td>Informe, ZIP y revisión de accesos</td><td>Todas</td></tr>
<tr><td>115–120</td><td>Cruce final con la rúbrica y envío</td><td>Todas</td></tr></table>

<h2 class="salto">Pregunta 1 — Product Backlog y épicas en Jira (5 pts)</h2>
<h3>1.1 Épicas</h3>
<table><tr><th>Épica</th><th>Nombre y descripción</th><th>Objetivo de negocio</th><th>Alcance</th></tr>${filasEpicas}</table>
<h3>1.2 Historias de usuario con criterios de aceptación</h3>
<table><tr><th>ID</th><th>Épica</th><th>Historia y criterios (Dado/Cuando/Entonces)</th><th>SP</th><th>MoSCoW</th><th>Sprint</th></tr>${filasHist}</table>
<h3>1.3 Técnica de estimación y priorización</h3>
<p><b>Story points con Fibonacci (1, 2, 3, 5, 8) por planning poker.</b> Se tomó como referencia H8 «solo publicados» = <b>2 pts</b> (un filtro y su prueba). Ejemplos: H1 listado de puestos = <b>3</b> (página + consulta + estado vacío); H5 búsqueda = <b>5</b> (normalización de tildes, búsqueda por nombre común y científico y pruebas); H12 registro e ingreso = <b>5</b> (integración con Supabase Auth, proxy y redirecciones); H17 análisis de seguridad = <b>5</b> (tres herramientas en el pipeline). Ninguna historia supera 5 pts. Si una hubiera salido con 8, se habría partido en dos.</p>
<p><b>Priorización MoSCoW, reflejada en el campo Prioridad de Jira</b> (Must→High, Should→Medium, Could→Low, Won't→Lowest) y en la etiqueta <code>MoSCoW-*</code>:</p>
<ul><li><b>Must</b>: sin ellas el MVP no resuelve el problema, p. ej. H5 buscar por hierba y H15 que solo el dueño edite sus productos.</li>
<li><b>Should</b>: aportan valor pero hay alternativa temporal, p. ej. H7 filtros de precio (se puede comparar visualmente) y H14 actualizar stock.</li>
<li><b>Could</b>: H4 mapa. La dirección textual cubre la necesidad en el MVP.</li>
<li><b>Won't (esta versión)</b>: H19 moderación. Se mitiga con la validación de afirmaciones clínicas.</li></ul>
<p>Backlog total: ${backlog.historias.reduce((a, h) => a + h.sp, 0)} pts. Planificado en 4 sprints: ${totalPlan} pts.</p>
<h3>1.4 Evidencia en Jira</h3>
<p>Proyecto: ${link(L.jira)} (clave <code>HMN</code>, plantilla Scrum gestionada por el equipo).</p>
${img("jira-01-backlog-sprints-1-2.jpg", "Backlog en Jira con Sprint 1 y Sprint 2 planificados (épica, puntos y prioridad por historia)")}
${img("jira-02-backlog-sprint-4-y-backlog.jpg", "Sprint 4 y backlog restante (H4 Could, H19 Won't)")}
${img("jira-03-epicas-cronograma.jpg", "Épicas en la vista Cronograma de Jira")}
${img("jira-05-epica-E2-detalle.jpg", "Detalle de la épica E2: descripción, objetivo de negocio e historias hijas")}
${img("jira-06-historia-H5-criterios.jpg", "Historia H5 con criterios Dado/Cuando/Entonces, 5 SP, prioridad High y épica padre")}

<h2 class="salto">Pregunta 2 — Simulación de 4 sprints <span class="sim">SIMULADO</span></h2>
<div class="nota">El avance diario es <b>simulado</b>: no corresponde a trabajo real distribuido en esas fechas. Todos los artefactos salen de una sola fuente (<code>docs/datos/backlog.json</code>) mediante <code>docs/diagramas/fuentes/simulacion.mjs</code>, así que el plan de sprints, el Gantt, los burndown y el Kanban coinciden.</div>
<h3>2.1 Planificación de sprints</h3>
<table><tr><th>Sprint</th><th>Fechas y duración</th><th>Sprint Goal</th><th>Sprint backlog (SP)</th><th>Comprometido</th><th>Terminado</th><th>Arrastre</th></tr>${filasSprints}</table>
<p><b>Cálculo de velocidad:</b> velocidad = suma de los story points de las historias en <i>Done</i> al cierre del sprint. S1 = 3+3+2+2+3 = <b>13</b> (H6 no terminó y pasó a S2). S2 = 3+5+3+3 = <b>14</b>. S3 = 3+5+5+3 = <b>16</b>. S4 = 5+3+5+3 = <b>16</b>. Total ${totalVel} pts. Velocidad promedio = ${totalVel}/4 = <b>${(totalVel / 4).toFixed(2)} pts/sprint</b>.</p>
<h3>2.2 Burndown por sprint (story points)</h3>
<p>Eje X: día hábil (D0 = inicio del sprint, D1…D10 = cierre de cada día). Eje Y: story points restantes. Ideal = comprometido × (1 − d/10). Real = comprometido − puntos de historias en Done hasta ese día.</p>
${[1, 2, 3, 4].map((n) => `<figure>${svg(`burndown-sprint-${n}`)}<figcaption>burndown-sprint-${n}.svg (generado, simulado)</figcaption></figure>`).join("")}
<h3>Datos fuente (ideal / <b>real</b>)</h3>
<table><tr><th>Sprint</th>${[...Array(11).keys()].map((d) => `<th class="c">D${d}</th>`).join("")}</tr>${tablaBurn}</table>
<h3 class="salto">2.3 Diagrama de Gantt</h3>
<figure>${svg("gantt-cuatro-sprints")}<figcaption>gantt-cuatro-sprints.svg: épicas, historias, dependencias fin→inicio e hitos (Review S1–S3 y Release MVP el 30 oct)</figcaption></figure>
<p>Las fechas de inicio y fin de cada historia también se cargaron en Jira (<i>Fecha de inicio</i> y <i>Fecha de vencimiento</i>), y las dependencias como vínculos «bloquea» (por ejemplo H12 → H15 → H13 → H14 y H16 → H17 → H18).</p>
<h3>2.4 Tablero Kanban y límites WIP</h3>
<p>Columnas exactas: <b>To Do · In Progress · In Review · Done</b>. Límites WIP: <b>In Progress = ${WIP["In Progress"]}</b>, porque el equipo simulado tiene capacidad de desarrollo para tres historias a la vez y así se evita empezar más de lo que se termina. <b>In Review = ${WIP["In Review"]}</b>, porque la revisión es un cuello de botella y obliga a revisar antes de abrir trabajo nuevo. To Do y Done no tienen límite. La simulación se validó por código: ningún día supera los límites (${verificarWip().length === 0 ? "0 violaciones" : verificarWip().join("; ")}).</p>
${img("jira-04-wip-columnas.jpg", "Configuración de columnas en Jira con límites WIP")}
${img("jira-10-kanban-sprint1-dia7.jpg", "Sprint 1, día 7 (simulado): H2 en revisión, H6 en curso")}
${img("jira-11-kanban-sprint1-cierre.jpg", "Sprint 1 al cierre: H6 sin terminar (pasa a Sprint 2)")}
${img("jira-12-kanban-sprint2-dia5.jpg", "Sprint 2, día 5 (simulado)")}
${img("jira-13-kanban-sprint2-cierre.jpg", "Sprint 2 al cierre: 4 historias en Done")}
${img("jira-14-kanban-sprint3-dia7.jpg", "Sprint 3, día 7 (simulado)")}
${img("jira-15-kanban-sprint3-cierre.jpg", "Sprint 3 al cierre")}
${img("jira-16-kanban-sprint4-dia7.jpg", "Sprint 4, día 7 (simulado)")}
${hay("jira-17") ? img("jira-17-kanban-sprint4-cierre.jpg", "Sprint 4 al cierre, después del despliegue real") : ""}
<h3>2.5 Coherencia verificada</h3>
<ul><li>Historias por sprint (tabla 2.1) = sprints en Jira = filas del Gantt = historias de cada burndown.</li>
<li>Puntos terminados por sprint = último descenso del burndown = velocidad (13, 14, 16, 16).</li>
<li>Día de Done en el burndown = fecha de fin en el Gantt = columna Done en las capturas del tablero.</li></ul>

<h2 class="salto">Pregunta 3 — Arquitectura lógica y stack DevSecOps (5 pts)</h2>
<h3>3.1 Arquitectura lógica</h3>
<figure>${svg("arquitectura-logica")}<figcaption>arquitectura-logica.svg</figcaption></figure>
<p><b>Recorrido de una consulta del catálogo:</b> (1) el navegador pide <code>GET /?q=muña&amp;disponible=1</code> por HTTPS a Vercel; (2) el Server Component <code>src/app/page.tsx</code> lee y acota los parámetros con <code>leerFiltros</code>; (3) <code>obtenerCatalogo()</code> crea el cliente <code>@supabase/ssr</code> con la sesión de las cookies (o anónima) y consulta <code>productos</code> con join a <code>puestos</code> y <code>plantas</code> y el filtro <code>publicado = true</code>; (4) PostgREST ejecuta la consulta con el rol <code>anon</code> y PostgreSQL aplica la política RLS <code>productos_lectura_publicados</code>; (5) el resultado vuelve como JSON; (6) <code>filtrarCatalogo</code> normaliza tildes y aplica búsqueda, distrito, disponibilidad y precio; (7) el servidor genera el HTML y lo envía al navegador. La API <code>/api/productos</code> sigue el mismo camino y responde JSON.</p>
<h3>3.2 Stack por fase DevSecOps</h3>
<table><tr><th>Fase</th><th>Herramienta</th><th>Actividad</th><th>Control de seguridad</th><th>Evidencia / estado</th></tr>${filasFases}</table>
<h3>3.3 Seguridad desde las primeras fases (shift-left)</h3>
<p>La seguridad se definió primero en el backlog, como historias con criterios de abuso (H10, H15, H17). Luego en el código, con validación Zod y RLS en la migración desde el primer esquema, y finalmente en el pipeline, que bloquea el merge.</p>
<table><tr><th>Control</th><th>Estado</th></tr>
<tr><td>RLS + 8 políticas + CHECK constraints en Supabase</td><td class="ok">Configurado y verificado (consulta en SQL Editor)</td></tr>
<tr><td>Validación Zod (HTML, rangos, afirmaciones clínicas) + 28 pruebas</td><td class="ok">Ejecutado localmente (28/28)</td></tr>
<tr><td>npm audit sin vulnerabilidades high/critical (se actualizó Next 15→16, Zod 3→4 y Vitest 3→5 tras detectar CVE)</td><td class="ok">Ejecutado localmente (0 vulnerabilidades)</td></tr>
<tr><td>CodeQL, Dependency Review, Gitleaks en Actions</td><td>${L.run_ci ? '<span class="ok">Ejecutado en Actions</span>' : '<span class="pend">Configurado; pendiente de ejecución en GitHub</span>'}</td></tr>
<tr><td>CodeQL detectó en el PR #1 tres alertas reales <code>js/incomplete-html-attribute-sanitization</code> (escape de comillas en los generadores de documentación); se corrigieron en el commit <code>9747534</code> y el PR las marcó «Fixed» antes del merge</td><td class="ok">Ejecutado y corregido</td></tr>
<tr><td>Dependency Review falló la primera vez porque el repositorio no tenía activado el <i>Dependency graph</i>; se activó (junto con Dependabot alerts) y el job pasó al re-ejecutarlo</td><td class="ok">Ejecutado</td></tr>
<tr><td>Ruleset de main con checks obligatorios</td><td>${L.pr ? '<span class="ok">Configurado</span>' : '<span class="pend">Diseñado; se configura al crear el repo</span>'}</td></tr>
<tr><td>Verificación post-despliegue (SHA, home, /api/productos sin borradores)</td><td>${L.run_deploy ? '<span class="ok">Ejecutado</span>' : '<span class="pend">Configurado</span>'}</td></tr>
<tr><td>Dependabot alerts</td><td class="ok">Activado en el repositorio</td></tr><tr><td>Monitoreo de logs con alertas (Vercel/Supabase)</td><td>Diseñado (no configurado en el MVP)</td></tr></table>
<h3>3.4 Justificación del stack frente al caso</h3>
<ul>
<li><b>Next.js + TypeScript:</b> el catálogo se renderiza en el servidor, así que carga rápido en los celulares de gama media que usan los compradores. Frontend y API van en un solo proyecto y los tipos compartidos reducen errores en precios y stock.</li>
<li><b>Supabase (PostgreSQL + Auth):</b> los datos del catálogo son relacionales (puesto–producto–planta). Supabase trae autenticación lista para los hierberos y RLS impone que cada hierbero edite solo lo suyo sin escribir un backend aparte. El plan gratuito alcanza para el MVP.</li>
<li><b>GitHub + GitHub Actions:</b> el código y el pipeline viven en el mismo lugar, con SAST (CodeQL) y escaneo de secretos gratuitos en repositorios públicos.</li>
<li><b>Vercel:</b> despliegue nativo de Next.js, HTTPS y previews por rama sin servidores que administrar, adecuado para un equipo pequeño.</li>
<li><b>Jira:</b> backlog con épicas, story points, sprints y tablero con WIP, como pide la rúbrica.</li></ul>

<h2 class="salto">Pregunta 4 — GitHub, pipeline CI/CD y despliegue (5 pts)</h2>
<h3>4.1 Estrategia de ramas</h3>
<p><code>main</code> = producción, solo se actualiza por Pull Request. <code>test</code> = integración y pruebas; cada push ejecuta CI y genera un Preview en Vercel en modo demo. Los commits siguen Conventional Commits y llevan la clave Jira (por ejemplo <code>feat(catalogo): búsqueda por hierba… [HMN-14 HMN-15 HMN-16 HMN-17]</code>). El PR <code>test → main</code> lleva las claves HMN en el título para vincularlo con Jira.</p>
<p>Pull Request: ${link(L.pr)}</p>
<h3>4.2 Workflows y etapas</h3>
<table><tr><th>Workflow</th><th>Disparadores</th><th>Etapas y función</th><th>Qué bloquea</th></tr>
<tr><td><code>ci.yml</code></td><td>pull_request y push a main/test</td><td><b>Build y pruebas:</b> Node de <code>.nvmrc</code>, <code>npm ci</code> desde el lockfile, <code>tsc --noEmit</code>, Vitest con JUnit (resumen en la página del run y artefacto), <code>next build</code>. <b>Dependencias:</b> <code>npm audit --audit-level=high</code> + Dependency Review en PR. <b>Secretos:</b> Gitleaks sobre todo el historial con reporte SARIF redactado.</td><td>Prueba fallida, error de tipos o build, vulnerabilidad high/critical, secreto detectado</td></tr>
<tr><td><code>codeql.yml</code></td><td>PR, push y lunes 06:30</td><td>SAST CodeQL <code>security-extended</code> para JS/TS; alertas en la pestaña Security</td><td>Fallo del análisis; alertas visibles en el PR</td></tr>
<tr><td><code>verificar-despliegue.yml</code></td><td>evento <code>status</code>: commit status «Vercel» = success en <code>main</code> (+ <code>workflow_dispatch</code> de respaldo)</td><td>Sin credenciales de Vercel: espera a que <code>/api/salud</code> devuelva el SHA desplegado, comprueba <code>GET /</code> = 200 y que <code>/api/productos?q=muna</code> devuelve productos sin borradores, y publica el SHA y la URL en el resumen</td><td>Marca el despliegue como no verificado</td></tr></table>
<p><b>Despliegue:</b> un solo mecanismo, la integración Git de Vercel. Al hacer merge a main (con checks requeridos) Vercel publica Production. No hay tokens de Vercel en GitHub. <b>Hallazgo durante la ejecución:</b> el workflow se diseñó con el evento <code>deployment_status</code>, pero la integración de Vercel publica un <i>commit status</i> (contexto «Vercel») y no un GitHub Deployment, así que el evento nunca llegó. Se corrigió el disparador a <code>status</code> filtrado por <code>main</code> y se dejó <code>workflow_dispatch</code> como respaldo manual; la primera verificación se ejecutó con ese respaldo. <b>Permisos mínimos:</b> <code>contents: read</code> global y <code>security-events: write</code> solo en CodeQL. <b>Entornos:</b> los PR y la rama test se despliegan como Preview sin variables de Supabase (modo demo), y solo Production tiene <code>NEXT_PUBLIC_SUPABASE_URL</code> y la clave pública anon. <b>Migraciones:</b> versionadas en <code>supabase/migrations/</code>; se aplicaron manualmente en el proyecto Supabase <code>${esc(L.supabase_ref)}</code> y no se automatizan desde CI.</p>
<figure>${svg("pipeline-devsecops")}<figcaption>pipeline-devsecops.svg</figcaption></figure>
<h3>4.3 Evidencias de ejecución</h3>
<table><tr><th>Evidencia</th><th>Enlace / estado</th></tr>
<tr><td>Ejecución exitosa de CI</td><td>${link(L.run_ci)}</td></tr>
<tr><td>Despliegue verificado y SHA publicado</td><td>${link(L.run_deploy)} ${L.sha ? "· SHA <code>" + esc(L.sha) + "</code>" : ""}</td></tr>
<tr><td>URL pública</td><td>${link(L.nube)}</td></tr>
<tr><td>Pruebas locales (antes del push)</td><td class="ok">28/28 OK · build OK · npm audit 0 vulnerabilidades</td></tr></table>
${evid.filter((f) => f.startsWith("github-") || f.startsWith("vercel-") || f.startsWith("app-")).map((f) => img(f, f.replace(/[-_]/g, " ").replace(/\.\w+$/, ""))).join("")}
${img("supabase-01-migracion-rls-verificada.jpg", "Supabase: migración aplicada; 3 tablas con RLS y 8 políticas")}

<h2 class="salto">Guion de sustentación (compartiendo pantalla)</h2>
<table><tr><th>Bloque</th><th>Pantalla</th><th>Decisión a explicar</th><th>Evidencia</th><th>Preguntas probables y respuesta</th></tr>
<tr><td>Caso (1 min)</td><td>App: catálogo buscando «muña»</td><td>El MVP responde dónde, qué, cuánto, si hay stock y la procedencia</td><td>URL pública</td><td>¿Por qué datos ficticios? Para no publicar comercios reales sin consentimiento.<br>¿Da consejos médicos? No: la app bloquea afirmaciones de curación y muestra un aviso.</td></tr>
<tr><td>P1 (3 min)</td><td>Jira → Backlog y una épica</td><td>5 épicas por capacidad; Fibonacci con H8=2 como referencia; MoSCoW → prioridad</td><td>HMN-6, HMN-14</td><td>¿Por qué H5 vale 5? Normaliza tildes, busca en nombre común y científico y tiene pruebas.<br>¿Por qué H19 es Won't? La validación de afirmaciones clínicas mitiga el riesgo en el MVP.</td></tr>
<tr><td>P2 (3 min)</td><td>Jira → Tablero (Sprint 4) + burndown S1 + Gantt</td><td>WIP 3/2; H6 se arrastró a S2; velocidad = puntos en Done</td><td>burndown-sprint-1.svg, gantt</td><td>¿Cómo calculaste la velocidad? Sumando los SP en Done: 13, 14, 16, 16, promedio 14.75.<br>¿Por qué In Review = 2? Para obligar a terminar revisiones antes de empezar otra historia.</td></tr>
<tr><td>P3 (3 min)</td><td>arquitectura-logica.svg</td><td>Validación en 3 capas: proxy (sesión), Zod (datos), RLS (permisos)</td><td>SQL Editor de Supabase</td><td>¿Qué pasa si alguien manipula la petición? RLS rechaza escrituras ajenas aunque se salte la UI.<br>¿Por qué la clave anon es pública? Solo otorga los permisos que permite RLS.</td></tr>
<tr><td>P4 (4 min)</td><td>GitHub → PR con checks → Actions → Vercel → URL</td><td>main protegida; Vercel es el único mecanismo de deploy; verificación por SHA</td><td>Run de CI, run de verificación, URL</td><td>¿Qué bloquea un merge? Una prueba fallida, un error de build, una vulnerabilidad high, un secreto o CodeQL.<br>¿Cómo sabes qué versión está publicada? <code>/api/salud</code> devuelve el SHA y el workflow lo compara.</td></tr></table>

<h2>Cruce final con la rúbrica y pendientes</h2>
<table><tr><th>Ítem</th><th>Estado</th></tr>
<tr><td>≥ 4 épicas (5)</td><td class="ok">OK</td></tr><tr><td>4 sprints + 4 burndown</td><td class="ok">OK</td></tr>
<tr><td>Gantt con dependencias e hitos</td><td class="ok">OK</td></tr><tr><td>Kanban con WIP y evidencia por sprint</td><td class="ok">OK</td></tr>
<tr><td>Arquitectura lógica + 8 fases DevSecOps</td><td class="ok">OK</td></tr>
<tr><td>Pruebas y análisis ejecutados en Actions</td><td>${est(!!L.run_ci)}</td></tr>
<tr><td>ZIP del código</td><td class="ok">Generado (ver entrega)</td></tr>
<tr><td>Enlace GitHub compartido</td><td>${est(!!L.pr, esc(L.github_estado))}</td></tr>
<tr><td>Enlace Jira compartido con el docente</td><td><span class="pend">${esc(L.jira_estado)}</span></td></tr>
<tr><td>Enlace nube</td><td>${est(!!L.nube, esc(L.nube_estado))}</td></tr>
<tr><td>Nombres, sección y docente en portada</td><td>${L.seccion ? '<span class="ok">OK</span>' : '<span class="pend">Completar sección y docente</span>'}</td></tr></table>
<p style="font-size:8.5pt;color:#5d6b5d">Iconos de tecnologías: Simple Icons v15.22.0 (CC0-1.0), incrustados como vectores; las marcas pertenecen a sus titulares. Diagramas generados con <code>node docs/diagramas/fuentes/generar-diagramas.mjs</code>.</p>
</body></html>`;

writeFileSync(new URL("Informe-PC2-Hierberos.html", aqui), html);
console.log("✔ docs/informe/Informe-PC2-Hierberos.html", Math.round(html.length / 1024), "KB");
