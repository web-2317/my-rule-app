"use client";

import { useState } from "react";
import PointsChart, { GAIN_COLOR, LOSS_COLOR } from "./PointsChart";
import { formatDateShort } from "@/lib/dates";

function LegendItem({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

// 14日間の推移。選んだ日の内訳をグラフ上部に表示し、表でも見られるようにする
export default function ChartCard({ daily }) {
  const [selected, setSelected] = useState(daily.length - 1);
  const [asTable, setAsTable] = useState(false);
  const d = daily[Math.min(selected, daily.length - 1)];

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">14日間の推移</h2>
          <div className="mt-1.5 flex gap-3 text-[11px] text-gray-500">
            <LegendItem color={GAIN_COLOR} label="獲得" />
            <LegendItem color={LOSS_COLOR} label="消費・減点" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-500 transition hover:text-accent"
        >
          {asTable ? "グラフで見る" : "表で見る"}
        </button>
      </div>

      {asTable ? (
        <div className="mt-4 max-h-80 overflow-auto">
          <table className="w-full text-right text-xs tabular-nums">
            <thead className="sticky top-0 bg-white text-[11px] text-gray-400">
              <tr>
                <th className="py-1.5 text-left font-normal">日付</th>
                <th className="py-1.5 font-normal">獲得</th>
                <th className="py-1.5 font-normal">消費</th>
                <th className="py-1.5 font-normal">減点</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[...daily].reverse().map((row) => (
                <tr key={row.date} className="border-t border-gray-50">
                  <td className="py-1.5 text-left text-gray-500">{formatDateShort(row.date)}</td>
                  <td className="py-1.5">+{row.earned}</td>
                  <td className="py-1.5">−{row.spent}</td>
                  <td className="py-1.5">−{row.penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-baseline justify-between rounded-2xl bg-gray-50 px-3 py-2 text-xs tabular-nums">
            <span className="font-semibold text-gray-700">{formatDateShort(d.date)}</span>
            <span className="flex gap-3 text-gray-600">
              <span>獲得 {d.earned ? `+${d.earned}` : 0}</span>
              <span>消費 {d.spent ? `−${d.spent}` : 0}</span>
              <span>減点 {d.penalty ? `−${d.penalty}` : 0}</span>
            </span>
          </div>
          <div className="mt-2">
            <PointsChart daily={daily} selected={selected} onSelect={setSelected} />
          </div>
        </>
      )}
    </section>
  );
}
