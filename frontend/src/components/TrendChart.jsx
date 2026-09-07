import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function TrendChart({ titulo, datos, dataKey, color, umbral, umbralEtiqueta }) {
  const puntos = datos.map((d) => ({
    hora: new Date(d.creado_en).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    valor: d[dataKey],
  }));

  return (
    <div className="border border-char-600 bg-char-800 p-5">
      <div className="mb-3 text-sm text-parchment-400">{titulo}</div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={puntos} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#2A251C" vertical={false} />
            <XAxis dataKey="hora" stroke="#A79C82" fontSize={11} tickLine={false} />
            <YAxis stroke="#A79C82" fontSize={11} tickLine={false} domain={[0, 1023]} />
            <Tooltip
              contentStyle={{ background: "#1F1B15", border: "1px solid #35301F", fontSize: 12 }}
              labelStyle={{ color: "#EFE8D8" }}
            />
            {umbral !== undefined && (
              <Line
                type="monotone"
                dataKey={() => umbral}
                stroke="#A79C82"
                strokeDasharray="4 4"
                dot={false}
                name={umbralEtiqueta}
                isAnimationActive={false}
              />
            )}
            <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
