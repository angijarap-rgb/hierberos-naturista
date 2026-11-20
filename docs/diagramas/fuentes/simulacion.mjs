// Cálculo de la SIMULACIÓN de los 4 sprints a partir de docs/datos/backlog.json.
// Es la única lógica que usan el Gantt, los burndown, el Kanban y el informe, para que sean coherentes.
import { readFileSync } from "node:fs";

const raiz = new URL("../../../", import.meta.url);
export const backlog = JSON.parse(readFileSync(new URL("docs/datos/backlog.json", raiz), "utf8"));

const DUR = { 1: 1, 2: 2, 3: 3, 5: 4, 8: 5 }; // días hábiles de trabajo estimados según story points

/** Fecha (YYYY-MM-DD) del día hábil d (1..10) de un sprint que empieza en lunes. */
export function fechaDia(sprint, d) {
  const base = new Date(sprint.inicio + "T12:00:00Z");
  const offset = d - 1 + (d > 5 ? 2 : 0);
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
}

export const sprint = (n) => backlog.sprints.find((s) => s.n === n);
const historia = (id) => backlog.historias.find((h) => h.id === id);

/** Plan por historia: sprint(s), día de inicio, día de fin, fechas. */
export function planHistorias() {
  const plan = {};
  const planificadas = backlog.historias.filter((h) => h.sprint);
  // orden por sprint y día de fin para resolver dependencias dentro del sprint
  planificadas.sort((a, b) => a.sprint - b.sprint || a.dia_fin - b.dia_fin);
  for (const h of planificadas) {
    let ini = Math.max(1, h.dia_fin - DUR[h.sp] + 1);
    for (const dep of h.depende ?? []) {
      const p = plan[dep];
      if (p && p.sprintFin === h.sprint) ini = Math.max(ini, p.diaFin + 1);
    }
    let sprintIni = h.sprint;
    if (h.sprint_inicial) {
      // arrastre: comenzó en el sprint anterior (día 7) y terminó en el siguiente
      sprintIni = h.sprint_inicial;
      ini = 7;
    }
    plan[h.id] = {
      id: h.id,
      epica: h.epica,
      sp: h.sp,
      sprintIni,
      diaIni: ini,
      sprintFin: h.sprint,
      diaFin: h.dia_fin,
      inicio: fechaDia(sprint(sprintIni), ini),
      fin: fechaDia(sprint(h.sprint), h.dia_fin),
      depende: h.depende ?? [],
    };
  }
  return plan;
}

/** Historias comprometidas en el sprint planning de cada sprint (incluye la que se arrastró). */
export function comprometidas(n) {
  return backlog.historias.filter((h) => h.sprint === n || h.sprint_inicial === n);
}

/** Serie del burndown (story points restantes al cierre de cada día). */
export function burndown(n) {
  const hs = comprometidas(n);
  const total = hs.reduce((a, h) => a + h.sp, 0);
  const terminadas = hs.filter((h) => h.sprint === n);
  const dias = [];
  for (let d = 0; d <= 10; d++) {
    const hechos = terminadas.filter((h) => h.dia_fin <= d).reduce((a, h) => a + h.sp, 0);
    dias.push({
      dia: d,
      fecha: d === 0 ? sprint(n).inicio : fechaDia(sprint(n), d),
      ideal: +(total * (1 - d / 10)).toFixed(1),
      real: total - hechos,
    });
  }
  const velocidad = terminadas.reduce((a, h) => a + h.sp, 0);
  return { sprint: n, comprometido: total, velocidad, dias, historias: hs.map((h) => h.id), noTerminadas: hs.filter((h) => h.sprint !== n).map((h) => h.id) };
}

/** Estado Kanban de cada historia del sprint n al cierre del día d (simulado). */
export function estadoKanban(n, d) {
  const plan = planHistorias();
  return comprometidas(n).map((h) => {
    const p = plan[h.id];
    const enEsteSprint = p.sprintFin === n;
    const ini = p.sprintIni === n ? p.diaIni : p.sprintIni < n ? 1 : 0;
    const fin = enEsteSprint ? p.diaFin : 99;
    let estado = "To Do";
    if (d >= fin) estado = "Done";
    else if (d === fin - 1) estado = "In Review";
    else if (d >= ini && ini > 0) estado = "In Progress";
    return { id: h.id, estado };
  });
}

export const WIP = { "To Do": null, "In Progress": 3, "In Review": 2, Done: null };

/** Comprueba que ningún día supera los límites WIP. */
export function verificarWip() {
  const fallas = [];
  for (const s of backlog.sprints) {
    for (let d = 1; d <= 10; d++) {
      const est = estadoKanban(s.n, d);
      for (const col of ["In Progress", "In Review"]) {
        const c = est.filter((e) => e.estado === col).length;
        if (c > WIP[col]) fallas.push(`S${s.n} día ${d}: ${col}=${c}`);
      }
    }
  }
  return fallas;
}

export { historia };
