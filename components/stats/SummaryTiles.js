"use client";

import { useState } from "react";
import Segmented from "@/components/ui/Segmented";

const PERIODS = [
  { key: "today", label: "今日" },
  { key: "week", label: "7日間" },
  { key: "month", label: "30日間" },
];

function Tile({ label, value, dot }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-3 py-3">
      <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
        {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">{value}</p>
    </div>
  );
}

const fmt = (n) => n.toLocaleString("ja-JP");
const signed = (n) => (n > 0 ? `+${fmt(n)}` : n < 0 ? `−${fmt(-n)}` : "0");
const minus = (n) => signed(-n);

// 期間ごとの獲得・消費・減点・差し引き
export default function SummaryTiles({ stats, gainColor, lossColor }) {
  const [period, setPeriod] = useState("today");
  const s = stats[period];
  const net = s.earned - s.spent - s.penalty;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <Segmented options={PERIODS} value={period} onChange={setPeriod} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Tile label="獲得" value={signed(s.earned)} dot={gainColor} />
        <Tile label="ご褒美で消費" value={minus(s.spent)} dot={lossColor} />
        <Tile label="ペナルティ" value={minus(s.penalty)} dot={lossColor} />
        <Tile label="差し引き" value={signed(net)} />
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">
        過去30日のうち <span className="font-bold tabular-nums text-gray-900">{stats.activeDays}</span>{" "}
        日タスクを達成
      </p>
    </section>
  );
}
