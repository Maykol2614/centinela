import { AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";

export default function AlarmBanner({ alarmaActiva, cargando }) {
  if (cargando) {
    return (
      <div className="panel-corners flex items-center gap-3 border border-char-600 bg-char-800 px-6 py-8 text-parchment-400">
        <Loader2 size={20} className="animate-spin" strokeWidth={1.75} />
        <span>Esperando la primera lectura del sensor...</span>
      </div>
    );
  }

  if (alarmaActiva) {
    return (
      <div className="panel-corners relative overflow-hidden border border-ember-500 bg-ember-600/20 px-6 py-8 text-ember-500">
        <div className="absolute inset-0 animate-pulse bg-ember-500/10" />
        <div className="relative flex items-start gap-4">
          <AlertTriangle size={28} strokeWidth={1.75} className="mt-1 shrink-0 text-ember-400" />
          <div className="flex flex-col gap-1">
            <span className="font-display text-3xl font-semibold text-ember-400 sm:text-4xl">
              Riesgo de incendio detectado
            </span>
            <span className="text-sm text-parchment-200">
              Suelo seco y nivel de gas elevado al mismo tiempo. Verifica la zona monitoreada.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-corners flex items-start gap-4 border border-char-600 bg-char-800 px-6 py-8 text-moss-400">
      <ShieldCheck size={28} strokeWidth={1.75} className="mt-1 shrink-0 text-moss-400" />
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
