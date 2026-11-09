import { Droplets, Wind } from "lucide-react";

const ICONOS = { suelo: Droplets, gas: Wind };

export default function ReadoutPanel({ etiqueta, valor, unidad, zonas, max = 1023, tipo }) {
  const tieneValor = valor !== null && valor !== undefined;
  const Icono = ICONOS[tipo];

  const zonaActual = tieneValor
    ? zonas.find((z) => valor >= z.desde && valor <= z.hasta) ?? zonas[0]
    : null;

  // Posición (en %) de un valor dentro de la escala 0..max
  const pos = (v) => Math.min(100, Math.max(0, (v / max) * 100));

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

      {/* Barra dividida por zonas: cada tramo mide lo que mide su rango real */}
      <div className="relative mt-5 h-1.5 w-full bg-char-700">
        {zonas.map((z) => {
          const inicio = pos(z.desde);
          const fin = pos(Math.min(z.hasta + 1, max));
          const relleno = tieneValor
            ? Math.max(0, pos(Math.min(valor, z.hasta + 1)) - inicio)
            : 0;
          return (
            <div key={z.nombre}>
              {/* Tramo atenuado: muestra dónde está cada zona */}
              <div
                className="absolute inset-y-0"
                style={{
                  left: `${inicio}%`,
                  width: `${fin - inicio}%`,
                  backgroundColor: z.color,
                  opacity: 0.22,
                }}
              />
              {/* Parte llenada hasta el valor actual */}
              <div
                className="absolute inset-y-0 transition-all duration-500"
                style={{
                  left: `${inicio}%`,
                  width: `${Math.min(relleno, fin - inicio)}%`,
                  backgroundColor: z.color,
                }}
              />
            </div>
          );
        })}
        {/* Separadores en los límites entre zonas */}
        {zonas.slice(1).map((z) => (
          <div
            key={`lim-${z.nombre}`}
            className="absolute -top-0.5 h-2.5 w-px bg-parchment-400/70"
            style={{ left: `${pos(z.desde)}%` }}
          />
        ))}
      </div>

      {/* Etiquetas centradas bajo su propio tramo, con el límite de inicio */}
      <div className="relative mt-2 h-8 text-[11px] text-parchment-400">
        {zonas.map((z) => {
          const centro = (pos(z.desde) + pos(Math.min(z.hasta + 1, max))) / 2;
          return (
            <span
              key={z.nombre}
              className="absolute -translate-x-1/2 text-center leading-tight"
              style={{ left: `${centro}%`, color: zonaActual?.nombre === z.nombre ? z.color : undefined }}
            >
              {z.nombre}
              <br />
              <span className="tabular opacity-60">
                {z.desde === 0 ? `0–${z.hasta}` : z.hasta >= max ? `${z.desde}+` : `${z.desde}–${z.hasta}`}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
