import { useEffect, useState, useCallback, useRef } from "react";
import {
  Flame, Radio, Droplets, CloudDrizzle, Wind, BellRing, Volume2, VolumeX, History,
  LineChart as IconoTendencias, BarChart3,
} from "lucide-react";
import AlarmBanner from "./components/AlarmBanner.jsx";
import ReadoutPanel from "./components/ReadoutPanel.jsx";
import TrendChart from "./components/TrendChart.jsx";
import StatCard from "./components/StatCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const INTERVALO_ACTUALIZACION = 10000; // 10s

const ZONAS_SUELO = [
  { nombre: "Húmedo", desde: 0, hasta: 549, color: "#5B8DEF" },
  { nombre: "Normal", desde: 550, hasta: 749, color: "#8B92A0" },
  { nombre: "Seco", desde: 750, hasta: 1023, color: "#C9A45C" },
];

const ZONAS_GAS = [
  { nombre: "Normal", desde: 0, hasta: 359, color: "#5B8DEF" },
  { nombre: "Alerta", desde: 360, hasta: 454, color: "#C9A45C" },
  { nombre: "Peligro", desde: 455, hasta: 700, color: "#E5726B" },
];

const PESTANAS = [
  { id: "tendencias", etiqueta: "Tendencias", icono: IconoTendencias },
  { id: "resumen", etiqueta: "Resumen histórico", icono: BarChart3 },
  { id: "alarmas", etiqueta: "Historial de alarmas", icono: History },
];

export default function App() {
  const [lecturas, setLecturas] = useState([]);
  const [actual, setActual] = useState(null);
  const [stats, setStats] = useState(null);
  const [alarmas, setAlarmas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pestana, setPestana] = useState("tendencias");

  function onTeclaPestana(e, indice) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const paso = e.key === "ArrowRight" ? 1 : -1;
    const sig = PESTANAS[(indice + paso + PESTANAS.length) % PESTANAS.length];
    setPestana(sig.id);
    document.getElementById(`tab-${sig.id}`)?.focus();
  }

  const cargarDatos = useCallback(async () => {
    try {
      const [resLecturas, resActual, resStats, resAlarmas] = await Promise.all([
        fetch(`${API_URL}/lecturas?limit=100`),
        fetch(`${API_URL}/lecturas/actual`),
        fetch(`${API_URL}/estadisticas`),
        fetch(`${API_URL}/lecturas/alarmas?limit=20`),
      ]);

      if (!resLecturas.ok || !resActual.ok || !resStats.ok || !resAlarmas.ok) {
        throw new Error("La API respondió con un error.");
      }

      setLecturas(await resLecturas.json());
      setActual(await resActual.json());
      setStats(await resStats.json());
      setAlarmas(await resAlarmas.json());
      setError(null);
    } catch (e) {
      setError("No se pudo conectar con la API. Verifica VITE_API_URL y que el backend esté corriendo.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
    const id = setInterval(cargarDatos, INTERVALO_ACTUALIZACION);
    return () => clearInterval(id);
  }, [cargarDatos]);

  // Reloj en vivo para el texto "hace Xs" (independiente del polling a la API)
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function tiempoRelativo(fechaIso) {
    const segundos = Math.max(0, Math.floor((ahora - new Date(fechaIso).getTime()) / 1000));
    if (segundos < 60) return `hace ${segundos}s`;
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos}min`;
    const horas = Math.floor(minutos / 60);
    return `hace ${horas}h`;
  }

  // Sonido de alarma: suena solo en el instante en que pasa de normal -> activa
  const [silenciado, setSilenciado] = useState(false);
  const alarmaAnteriorRef = useRef(false);

  function reproducirBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25].forEach((retraso) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + retraso);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + retraso + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + retraso + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + retraso);
        osc.stop(ctx.currentTime + retraso + 0.22);
      });
    } catch (e) {
      // Si el navegador bloquea el audio (requiere interacción previa), lo ignoramos.
    }
  }

  useEffect(() => {
    const activa = !!actual?.alarma_activa;
    if (activa && !alarmaAnteriorRef.current && !silenciado) {
      reproducirBeep();
    }
    alarmaAnteriorRef.current = activa;
  }, [actual?.alarma_activa, silenciado]);

  // Favicon y título de la pestaña dinámicos según el estado de alarma
  useEffect(() => {
    const alarmaActiva = actual?.alarma_activa;
    document.title = alarmaActiva ? "⚠ ALARMA - Centinela" : "Centinela";

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    const emoji = alarmaActiva ? "⚠️" : "🔥";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [actual?.alarma_activa]);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-char-600 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-char-600 bg-char-800 text-ember-500">
            <Flame size={20} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-parchment-100 sm:text-2xl">
              Centinela
            </h1>
            <p className="text-xs text-parchment-400">
              Alerta temprana de incendios subterráneos · zona silvopastoril
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
          <div className="flex items-center gap-3">
            {(() => {
              const segundosDesdeUltima = actual
                ? Math.floor((ahora - new Date(actual.creado_en).getTime()) / 1000)
                : null;
              const enLinea = segundosDesdeUltima !== null && segundosDesdeUltima < 120;
              return (
                <div
                  className={`flex items-center gap-1.5 text-xs ${enLinea ? "text-moss-400" : "text-ember-500"}`}
                >
                  <Radio size={12} className={enLinea ? "live-dot" : ""} />
                  <span className="tracking-wide">{enLinea ? "En línea" : "Sin conexión"}</span>
                </div>
              );
            })()}
            <button
              onClick={() => setSilenciado((v) => !v)}
              className="text-parchment-400 hover:text-parchment-100"
              title={silenciado ? "Activar sonido de alarma" : "Silenciar sonido de alarma"}
            >
              {silenciado ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
          <span className="tabular text-xs text-parchment-400">
            {actual ? `Última lectura: ${tiempoRelativo(actual.creado_en)}` : "Sin datos aún"}
          </span>
        </div>
      </header>

      {error && (
        <div className="panel-corners mb-6 border border-ember-500 bg-ember-600/10 px-4 py-3 text-sm text-ember-400">
          {error}
        </div>
      )}

      <section className="mb-6">
        <AlarmBanner alarmaActiva={actual?.alarma_activa} cargando={cargando} />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Lecturas en vivo">
        <ReadoutPanel
          etiqueta="Humedad del suelo"
          valor={actual?.humedad_suelo}
          unidad="/ 1023"
          zonas={ZONAS_SUELO}
          tipo="suelo"
        />
        <ReadoutPanel
          etiqueta="Nivel de gas / humo (MQ-2)"
          valor={actual?.nivel_gas}
          unidad="/ 700"
          zonas={ZONAS_GAS}
          tipo="gas"
          max={700}
        />
      </section>

      <div
        role="tablist"
        aria-label="Secciones del panel"
        className="mb-5 flex gap-1 overflow-x-auto border-b border-char-600"
      >
        {PESTANAS.map((t, i) => {
          const activa = pestana === t.id;
          const Icono = t.icono;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={activa}
              aria-controls={`panel-${t.id}`}
              tabIndex={activa ? 0 : -1}
              onClick={() => setPestana(t.id)}
              onKeyDown={(e) => onTeclaPestana(e, i)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm outline-none transition-colors focus-visible:text-parchment-100 ${
                activa
                  ? "border-moss-400 text-parchment-100"
                  : "border-transparent text-parchment-400 hover:text-parchment-200"
              }`}
            >
              <Icono size={14} strokeWidth={1.75} />
              {t.etiqueta}
              {t.id === "alarmas" && stats?.total_alarmas > 0 && (
                <span className="tabular border border-ember-500/60 px-1.5 text-[11px] text-ember-400">
                  {stats.total_alarmas}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {pestana === "tendencias" && (
        <section
          role="tabpanel"
          id="panel-tendencias"
          aria-labelledby="tab-tendencias"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <TrendChart
            titulo="Humedad del suelo — últimas lecturas"
            datos={lecturas}
            dataKey="humedad_suelo"
            color="#5B8DEF"
            umbral={750}
            umbralEtiqueta="Umbral seco"
          />
          <TrendChart
            titulo="Nivel de gas / humo — últimas lecturas"
            datos={lecturas}
            dataKey="nivel_gas"
            color="#E5726B"
            umbral={455}
            umbralEtiqueta="Umbral de alerta"
            max={700}
          />
        </section>
      )}

      {pestana === "resumen" && (
        <section
          role="tabpanel"
          id="panel-resumen"
          aria-labelledby="tab-resumen"
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <StatCard
            icono={Droplets}
            etiqueta="Día más húmedo"
            valor={stats?.dia_mas_humedo?.fecha}
            detalle={stats?.dia_mas_humedo?.valor ? `promedio ${stats.dia_mas_humedo.valor}` : null}
          />
          <StatCard
            icono={CloudDrizzle}
            etiqueta="Día más seco"
            valor={stats?.dia_mas_seco?.fecha}
            detalle={stats?.dia_mas_seco?.valor ? `promedio ${stats.dia_mas_seco.valor}` : null}
          />
          <StatCard icono={Wind} etiqueta="Promedio de gas" valor={stats?.promedio_gas} />
          <StatCard icono={BellRing} etiqueta="Alarmas activadas" valor={stats?.total_alarmas} />
        </section>
      )}

      {pestana === "alarmas" && (
        <section
          role="tabpanel"
          id="panel-alarmas"
          aria-labelledby="tab-alarmas"
          className="panel-corners border border-char-600 bg-char-800 p-5"
        >
          {alarmas.length === 0 ? (
            <p className="text-sm text-parchment-400">Sin alarmas registradas todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="tabular w-full text-left text-xs">
                <thead>
                  <tr className="text-parchment-400">
                    <th className="pb-2 pr-4 font-normal">Fecha y hora</th>
                    <th className="pb-2 pr-4 font-normal">Humedad del suelo</th>
                    <th className="pb-2 font-normal">Nivel de gas</th>
                  </tr>
                </thead>
                <tbody>
                  {alarmas.map((a) => (
                    <tr key={a.id} className="border-t border-char-700 text-parchment-100">
                      <td className="py-1.5 pr-4">
                        {new Date(a.creado_en).toLocaleString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-1.5 pr-4 text-dust-400">{a.humedad_suelo}</td>
                      <td className="py-1.5 text-ember-400">{a.nivel_gas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <footer className="mt-10 flex flex-col gap-1 border-t border-char-600 pt-4 text-[11px] text-parchment-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Centinela · sistema de monitoreo silvopastoril</span>
        <span className="tabular">
          Actualiza cada {INTERVALO_ACTUALIZACION / 1000}s · fuente: {API_URL}
        </span>
      </footer>
    </div>
  );
}
