"use client";

import { useState } from "react";
import Stepper from "@/components/ui/Stepper";
import CardFooter from "@/components/ui/CardFooter";
import ItemIcon from "@/components/ui/ItemIcon";
import { MAX_COUNT_PER_ACTION } from "@/lib/points";

export default function RewardCard({ reward, balance, onRedeem, onEdit, onDelete }) {
  const [count, setCount] = useState(1);

  // 残高で使える回数と、1日の残り回数の小さい方がステッパーの上限
  const affordable = Math.floor(balance / reward.cost);
  const maxCount = Math.min(
    reward.remaining ?? MAX_COUNT_PER_ACTION,
    MAX_COUNT_PER_ACTION,
    Math.max(1, affordable)
  );
  const reachedLimit = reward.remaining === 0;
  const effectiveCount = Math.max(1, Math.min(count, maxCount));
  const total = reward.cost * effectiveCount;
  const shortage = total - balance;
  const canRedeem = !reachedLimit && shortage <= 0;
  // 1回分に届いていないときは、あとどれくらいかをバーで見せる
  const progress = Math.min(100, Math.round((balance / reward.cost) * 100));

  return (
    <article className="rounded-3xl bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-50 text-2xl">
          <ItemIcon emoji={reward.emoji} imageId={reward.image_id} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-base font-bold leading-snug text-gray-900">{reward.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400">
            <span className="tabular-nums">
              今日 {reward.today_count}
              {reward.daily_limit ? ` / ${reward.daily_limit}` : ""}回
            </span>
            {affordable > 0 && !reachedLimit && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                あと{affordable}回使える
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-bold tabular-nums leading-tight text-gray-900">
            {reward.cost.toLocaleString("ja-JP")}
            <span className="ml-0.5 text-xs font-semibold text-gray-400">pt</span>
          </p>
          <p className="text-[10px] text-gray-400">1回</p>
        </div>
      </div>

      {reward.memo && <p className="mt-2 truncate pl-[3.75rem] text-xs text-gray-400">{reward.memo}</p>}

      {affordable === 0 && !reachedLimit && (
        <div className="mt-3 pl-[3.75rem]">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-right text-[10px] tabular-nums text-gray-400">
            {balance} / {reward.cost}pt
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Stepper
          value={effectiveCount}
          max={Math.max(1, maxCount)}
          onChange={setCount}
          disabled={reachedLimit}
        />
        <button
          type="button"
          onClick={() => onRedeem(reward, effectiveCount)}
          disabled={!canRedeem}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold tabular-nums transition disabled:cursor-not-allowed ${
            canRedeem
              ? "bg-gray-900 text-white shadow-sm hover:bg-gray-800"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {reachedLimit
            ? "今日はもう使えません"
            : shortage > 0
              ? `あと ${shortage}pt`
              : `使う  −${total}pt`}
        </button>
      </div>

      <CardFooter onEdit={() => onEdit(reward)} onDelete={() => onDelete(reward)} />
    </article>
  );
}
