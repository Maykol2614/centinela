import { useEffect, useState, useCallback } from "react";
import AlarmBanner from "./components/AlarmBanner.jsx";
import ReadoutPanel from "./components/ReadoutPanel.jsx";
import TrendChart from "./components/TrendChart.jsx";
import StatCard from "./components/StatCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const INTERVALO_ACTUALIZACION = 10000; // 10s

const ZONAS_SUELO = [
  { nombre: "Seco", desde: 0, hasta: 399, color: "#C99A3A" },
  { nombre: "Normal", desde: 400, hasta: 700, color: "#A79C82" },
  { nombre: "Húmedo", desde: 701, hasta: 1023, color: "#5C8358" },
];

const ZONAS_GAS = [
  { nombre: "Normal", desde: 0, hasta: 299, color: "#5C8358" },
  { nombre: "Alerta", desde: 300, hasta: 600, color: "#C99A3A" },
  { nombre: "Peligro", desde: 601, hasta: 1023, color: "#D9491F" },
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
      <header className="mb-6 flex items-center justify-between border-b border-char-600 pb-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-parchment-100 sm:text-2xl">
            Centinela
          </h1>
          <p className="text-xs text-parchment-400">
            Alerta temprana de incendios subterráneos · zona silvopastoril
          </p>
        </div>
        <span className="text-xs text-parchment-400">
          {actual ? `Última lectura: ${new Date(actual.creado_en).toLocaleTimeString("es-PE")}` : ""}
        </span>
      </header>

      {error && (
        <div className="mb-6 border border-ember-500 bg-ember-600/10 px-4 py-3 text-sm text-ember-400">
          {error}
        </div>
      )}

      <section className="mb-6">
        <AlarmBanner alarmaActiva={actual?.alarma_activa} cargando={cargando} />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReadoutPanel
          etiqueta="Humedad del suelo"
          valor={actual?.humedad_suelo}
          unidad="/ 1023"
          zonas={ZONAS_SUELO}
        />
        <ReadoutPanel
          etiqueta="Nivel de gas / humo (MQ-2)"
          valor={actual?.nivel_gas}
          unidad="/ 1023"
          zonas={ZONAS_GAS}
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TrendChart
          titulo="Humedad del suelo — últimas lecturas"
          datos={lecturas}
          dataKey="humedad_suelo"
          color="#5C8358"
          umbral={400}
          umbralEtiqueta="Umbral seco"
        />
        <TrendChart
          titulo="Nivel de gas / humo — últimas lecturas"
          datos={lecturas}
          dataKey="nivel_gas"
          color="#D9491F"
          umbral={300}
          umbralEtiqueta="Umbral de alerta"
        />
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          etiqueta="Día más húmedo"
          valor={stats?.dia_mas_humedo?.fecha}
          detalle={stats?.dia_mas_humedo?.valor ? `promedio ${stats.dia_mas_humedo.valor}` : null}
        />
        <StatCard
          etiqueta="Día más seco"
          valor={stats?.dia_mas_seco?.fecha}
          detalle={stats?.dia_mas_seco?.valor ? `promedio ${stats.dia_mas_seco.valor}` : null}
        />
        <StatCard etiqueta="Promedio de gas" valor={stats?.promedio_gas} />
        <StatCard etiqueta="Alarmas activadas" valor={stats?.total_alarmas} />
      </section>

      <footer className="mt-8 text-center text-xs text-parchment-400">
        Actualiza cada {INTERVALO_ACTUALIZACION / 1000}s · datos servidos desde {API_URL}
      </footer>
    </div>
  );
}
