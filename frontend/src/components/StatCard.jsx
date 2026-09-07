export default function StatCard({ etiqueta, valor, detalle }) {
  return (
    <div className="border border-char-600 bg-char-800 p-5">
      <div className="text-sm text-parchment-400">{etiqueta}</div>
      <div className="mt-2 font-display text-2xl font-semibold text-parchment-100">
        {valor ?? "—"}
      </div>
      {detalle && <div className="mt-1 text-xs text-parchment-400">{detalle}</div>}
    </div>
  );
}
