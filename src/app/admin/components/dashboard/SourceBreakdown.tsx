"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type SourceData = { name: string; revenue: number; orders: number; color: string };

export function SourceBreakdown({ data }: { data: SourceData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="border border-rule rounded-[2px] p-5">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-4">Omzet per bron</p>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#0E0C0A", opacity: 0.5 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#0E0C0A", opacity: 0.3 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${(v / 100).toFixed(0)}`}
              width={40}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #EDE9E2", borderRadius: 2, background: "#F7F4EF" }}
              formatter={(value) => [`\u20AC ${(Number(value) / 100).toFixed(2).replace(".", ",")}`, "Omzet"]}
            />
            <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[1px]" style={{ backgroundColor: d.color }} />
            <span className="text-[11px] text-ink/50">{d.name} ({d.orders})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
