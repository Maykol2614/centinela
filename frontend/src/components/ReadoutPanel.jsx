export default function ReadoutPanel({ etiqueta, valor, unidad, zonas, max = 1023 }) {
  const tieneValor = valor !== null && valor !== undefined;
  const porcentaje = tieneValor ? Math.min(100, Math.max(0, (valor / max) * 100)) : 0;

  const zonaActual = tieneValor
    ? zonas.find((z) => valor >= z.desde && valor <= z.hasta) ?? zonas[0]
    : null;

  return (
    <div className="border border-char-600 bg-char-800 p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-parchment-400">{etiqueta}</span>
        {zonaActual && (
          <span className="text-xs" style={{ color: zonaActual.color }}>
            {zonaActual.nombre}
          </span>
        )}
      </div>

      <div className="mt-2 font-display text-4xl font-semibold text-parchment-100">
        {tieneValor ? valor : "—"}
        <span className="ml-1 text-base text-parchment-400">{unidad}</span>
      </div>

      <div className="mt-4 h-2 w-full bg-char-700">
        <div
          className="h-2 transition-all duration-500"
          style={{
            width: `${porcentaje}%`,
            backgroundColor: zonaActual ? zonaActual.color : "#35301F",
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-parchment-400">
        {zonas.map((z) => (
          <span key={z.nombre}>{z.nombre}</span>
        ))}
      </div>
    </div>
  );
}
