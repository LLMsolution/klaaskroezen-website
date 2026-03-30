"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type DataPoint = { date: string; amount: number };

export function RevenueChart({ data, label }: { data: DataPoint[]; label: string }) {
  if (data.length === 0) return null;

  return (
    <div className="border border-rule rounded-[2px] p-5">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-4">{label}</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B5622A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#B5622A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#0E0C0A", opacity: 0.3 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(d: string) => {
                const parts = d.split("-");
                return `${parts[2]}/${parts[1]}`;
              }}
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
              labelFormatter={(d) => String(d)}
            />
            <Area type="monotone" dataKey="amount" stroke="#B5622A" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
