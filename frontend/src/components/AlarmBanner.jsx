export default function AlarmBanner({ alarmaActiva, cargando }) {
  if (cargando) {
    return (
      <div className="border border-char-600 bg-char-800 px-6 py-8 text-parchment-400">
        Esperando la primera lectura del sensor...
      </div>
    );
  }

  if (alarmaActiva) {
    return (
      <div className="relative overflow-hidden border border-ember-500 bg-ember-600/20 px-6 py-8">
        <div className="absolute inset-0 animate-pulse bg-ember-500/10" />
        <div className="relative flex flex-col gap-1">
          <span className="font-display text-3xl font-semibold text-ember-400 sm:text-4xl">
            Riesgo de incendio detectado
          </span>
          <span className="text-sm text-parchment-200">
            Suelo seco y nivel de gas elevado al mismo tiempo. Verifica la zona monitoreada.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-char-600 bg-char-800 px-6 py-8">
      <div className="flex flex-col gap-1">
        <span className="font-display text-3xl font-semibold text-moss-400 sm:text-4xl">
          Condiciones normales
        </span>
        <span className="text-sm text-parchment-400">
          El suelo y el aire de la zona están dentro de los rangos seguros.
        </span>
      </div>
    </div>
  );
}
