"use client";

import { useState } from "react";
import CardFooter from "@/components/ui/CardFooter";
import ItemIcon from "@/components/ui/ItemIcon";
import Stepper from "@/components/ui/Stepper";
import { MAX_COUNT_PER_ACTION, describeProgression, pointsForRange } from "@/lib/points";

export default function TaskCard({ task, onComplete, onEdit, onDelete }) {
  const [count, setCount] = useState(1);
  const [pending, setPending] = useState(false);
  const [floats, setFloats] = useState([]);

  const penalty = task.is_penalty;
  const sign = penalty ? "−" : "+";
  const maxCount = task.remaining ?? MAX_COUNT_PER_ACTION;
  const reachedLimit = task.remaining === 0;
  // 上限が減った（他の操作で達成済みになった）場合でも、残り回数を超えないようにする
  const effectiveCount = Math.max(1, Math.min(count, maxCount));
  const preview = pointsForRange(task, task.today_count + 1, effectiveCount).total;
  const progression = describeProgression(task);

  async function handleClick() {
    setPending(true);
    const log = await onComplete(task, effectiveCount);
    setPending(false);
    if (!log) return;
    setCount(1);
    // カード上に「+45」を浮かび上がらせる
    const id = log.id;
    setFloats((f) => [...f, { id, text: `${sign}${Math.abs(log.points)}` }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1000);
  }

  return (
    <article className="relative rounded-3xl bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl ${
            penalty ? "bg-rose-50" : "bg-emerald-50"
          }`}
        >
          <ItemIcon emoji={task.emoji} imageId={task.image_id} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-base font-bold leading-snug text-gray-900">{task.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400">
            <span className="tabular-nums">
              今日 {task.today_count}
              {task.daily_limit ? ` / ${task.daily_limit}` : ""}回
            </span>
            {progression && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{progression}</span>
            )}
            {task.streak >= 2 && (
              <span className="font-medium text-orange-500">🔥 {task.streak}日連続</span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-lg font-bold tabular-nums leading-tight ${
              penalty ? "text-spend" : "text-accent"
            }`}
          >
            {sign}
            {task.next_points}
            <span className="ml-0.5 text-xs font-semibold">pt</span>
          </p>
          <p className="text-[10px] text-gray-400">次の1回</p>
        </div>
      </div>

      {task.memo && <p className="mt-2 truncate pl-[3.75rem] text-xs text-gray-400">{task.memo}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <Stepper
          value={effectiveCount}
          max={Math.max(1, maxCount)}
          onChange={setCount}
          disabled={reachedLimit || pending}
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={reachedLimit || pending}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold tabular-nums transition disabled:cursor-not-allowed ${
            reachedLimit
              ? "bg-gray-100 text-gray-400"
              : penalty
                ? "bg-rose-50 text-rose-500 ring-1 ring-rose-200 hover:bg-rose-100"
                : "bg-accent text-white shadow-sm hover:bg-accent-hover"
          } ${pending ? "opacity-60" : ""}`}
        >
          {reachedLimit
            ? "今日は上限まで達成 ✓"
            : `${penalty ? "やってしまった" : "達成"}  ${sign}${preview}pt`}
        </button>
      </div>

      <CardFooter onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />

      {floats.map((f) => (
        <span
          key={f.id}
          aria-hidden
          className={`pointer-events-none absolute right-6 top-3 animate-float-up text-xl font-extrabold ${
            penalty ? "text-spend" : "text-accent"
          }`}
        >
          {f.text}
        </span>
      ))}
    </article>
  );
}
