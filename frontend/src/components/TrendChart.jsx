import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function TrendChart({ titulo, datos, dataKey, color, umbral, umbralEtiqueta }) {
  const gradientId = `grad-${dataKey}`;

  const puntos = datos.map((d) => ({
    hora: new Date(d.creado_en).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    valor: d[dataKey],
  }));

  return (
    <div className="panel-corners border border-char-600 bg-char-800 p-5 text-parchment-400">
      <div className="mb-3 flex items-baseline justify-between text-sm">
        <span>{titulo}</span>
        {umbral !== undefined && (
          <span className="tabular text-[11px] text-parchment-400/80">
            {umbralEtiqueta}: {umbral}
          </span>
        )}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={puntos} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2A251C" vertical={false} />
            <XAxis dataKey="hora" stroke="#A79C82" fontSize={11} tickLine={false} />
            <YAxis stroke="#A79C82" fontSize={11} tickLine={false} domain={[0, 1023]} />
            <Tooltip
              contentStyle={{ background: "#1F1B15", border: "1px solid #35301F", fontSize: 12 }}
              labelStyle={{ color: "#EFE8D8" }}
              itemStyle={{ color }}
            />
            {umbral !== undefined && (
              <ReferenceLine y={umbral} stroke="#A79C82" strokeDasharray="4 4" strokeOpacity={0.6} />
            )}
            <Area
              type="monotone"
              dataKey="valor"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
