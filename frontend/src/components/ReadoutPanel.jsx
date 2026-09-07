import { Droplets, Wind } from "lucide-react";

const ICONOS = { suelo: Droplets, gas: Wind };

export default function ReadoutPanel({ etiqueta, valor, unidad, zonas, max = 1023, tipo }) {
  const tieneValor = valor !== null && valor !== undefined;
  const porcentaje = tieneValor ? Math.min(100, Math.max(0, (valor / max) * 100)) : 0;
  const Icono = ICONOS[tipo];

  const zonaActual = tieneValor
    ? zonas.find((z) => valor >= z.desde && valor <= z.hasta) ?? zonas[0]
    : null;

  return (
    <div className="panel-corners border border-char-600 bg-char-800 p-5">
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-sm text-parchment-400">
          {Icono && <Icono size={15} strokeWidth={1.75} />}
          {etiqueta}
        </span>
        {zonaActual && (
          <span
            className="border px-1.5 py-0.5 text-[11px] tracking-wide"
            style={{ color: zonaActual.color, borderColor: `${zonaActual.color}55` }}
          >
            {zonaActual.nombre}
          </span>
        )}
      </div>

      <div className="tabular mt-3 font-display text-4xl font-semibold text-parchment-100">
        {tieneValor ? valor : "—"}
        <span className="ml-1 text-base text-parchment-400">{unidad}</span>
      </div>

      <div className="relative mt-5 h-1.5 w-full bg-char-700">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{
            width: `${porcentaje}%`,
            backgroundColor: zonaActual ? zonaActual.color : "#35301F",
          }}
        />
        {/* Marcas de graduación, estilo medidor de instrumento */}
        {[25, 50, 75].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 h-1.5 w-px bg-char-900/60"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-parchment-400">
        {zonas.map((z) => (
          <span key={z.nombre}>{z.nombre}</span>
        ))}
      </div>
    </div>
  );
}
