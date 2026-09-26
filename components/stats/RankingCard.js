"use client";

import { useState } from "react";
import ItemIcon from "@/components/ui/ItemIcon";
import Segmented from "@/components/ui/Segmented";
import { GAIN_COLOR, LOSS_COLOR } from "./PointsChart";

const TABS = [
  { key: "taskRanking", label: "タスク", color: GAIN_COLOR, unit: "獲得" },
  { key: "rewardRanking", label: "ご褒美", color: LOSS_COLOR, unit: "消費" },
  { key: "penaltyRanking", label: "ペナルティ", color: LOSS_COLOR, unit: "減点" },
];

// 過去30日のポイント内訳（多い順）
export default function RankingCard({ stats }) {
  const [tab, setTab] = useState("taskRanking");
  const config = TABS.find((t) => t.key === tab);
  const rows = stats[tab].slice(0, 8);
  const max = Math.max(1, ...rows.map((r) => r.points));

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <h2 className="mb-3 text-sm font-bold text-gray-900">30日間のランキング</h2>
      <Segmented options={TABS} value={tab} onChange={setTab} />

      {rows.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-400">まだ記録がありません</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3">
              <span className="w-4 text-center text-xs font-bold tabular-nums text-gray-400">{i + 1}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xl">
                <ItemIcon emoji={r.emoji} imageId={r.image_id} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-gray-800">{r.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-gray-500">
                    {r.count}回 · {config.unit} {r.points.toLocaleString("ja-JP")}pt
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(r.points / max) * 100}%`, background: config.color }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
