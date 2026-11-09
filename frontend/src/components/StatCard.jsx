export default function StatCard({ etiqueta, valor, detalle, icono: Icono }) {
  return (
    <div className="panel-corners border border-char-600 bg-char-800 p-4 sm:p-5">
      <div className="flex items-center gap-1.5 text-[11px] text-parchment-400 sm:text-xs">
        {Icono && <Icono size={13} strokeWidth={1.75} />}
        <span>{etiqueta}</span>
      </div>
      <div className="tabular mt-2 font-display text-xl font-semibold text-parchment-100 sm:text-2xl">
        {valor ?? "—"}
      </div>
      {detalle && <div className="tabular mt-1 text-[11px] text-parchment-400">{detalle}</div>}
    </div>
  );
}
