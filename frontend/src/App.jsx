import { useEffect, useState, useCallback } from "react";
import { Flame, Radio, Droplets, CloudDrizzle, Wind, BellRing } from "lucide-react";
import AlarmBanner from "./components/AlarmBanner.jsx";
import ReadoutPanel from "./components/ReadoutPanel.jsx";
import TrendChart from "./components/TrendChart.jsx";
import StatCard from "./components/StatCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const INTERVALO_ACTUALIZACION = 10000; // 10s

const ZONAS_SUELO = [
  { nombre: "Seco", desde: 0, hasta: 399, color: "#C9A45C" },
  { nombre: "Normal", desde: 400, hasta: 700, color: "#8B92A0" },
  { nombre: "Húmedo", desde: 701, hasta: 1023, color: "#5B8DEF" },
];

const ZONAS_GAS = [
  { nombre: "Normal", desde: 0, hasta: 299, color: "#5B8DEF" },
  { nombre: "Alerta", desde: 300, hasta: 600, color: "#C9A45C" },
  { nombre: "Peligro", desde: 601, hasta: 1023, color: "#E5726B" },
];

export default function App() {
  const [lecturas, setLecturas] = useState([]);
  const [actual, setActual] = useState(null);
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    try {
      const [resLecturas, resActual, resStats] = await Promise.all([
        fetch(`${API_URL}/lecturas?limit=100`),
        fetch(`${API_URL}/lecturas/actual`),
        fetch(`${API_URL}/estadisticas`),
      ]);

      if (!resLecturas.ok || !resActual.ok || !resStats.ok) {
        throw new Error("La API respondió con un error.");
      }

      setLecturas(await resLecturas.json());
      setActual(await resActual.json());
      setStats(await resStats.json());
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
          <div className="flex items-center gap-1.5 text-xs text-moss-400">
            <Radio size={12} className="live-dot" />
            <span className="tracking-wide">Monitoreo en vivo</span>
          </div>
          <span className="tabular text-xs text-parchment-400">
            {actual
              ? `Última lectura: ${new Date(actual.creado_en).toLocaleTimeString("es-PE")}`
              : "Sin datos aún"}
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

      <p className="mb-3 text-xs text-parchment-400">— Lecturas en vivo</p>
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          unidad="/ 1023"
          zonas={ZONAS_GAS}
          tipo="gas"
        />
      </section>

      <p className="mb-3 text-xs text-parchment-400">— Tendencias · últimos registros</p>
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TrendChart
          titulo="Humedad del suelo — últimas lecturas"
          datos={lecturas}
          dataKey="humedad_suelo"
          color="#5B8DEF"
          umbral={400}
          umbralEtiqueta="Umbral seco"
        />
        <TrendChart
          titulo="Nivel de gas / humo — últimas lecturas"
          datos={lecturas}
          dataKey="nivel_gas"
          color="#E5726B"
          umbral={300}
          umbralEtiqueta="Umbral de alerta"
        />
      </section>

      <p className="mb-3 text-xs text-parchment-400">— Resumen histórico</p>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      <footer className="mt-10 flex flex-col gap-1 border-t border-char-600 pt-4 text-[11px] text-parchment-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Centinela · sistema de monitoreo silvopastoril</span>
        <span className="tabular">
          Actualiza cada {INTERVALO_ACTUALIZACION / 1000}s · fuente: {API_URL}
        </span>
      </footer>
    </div>
  );
}
