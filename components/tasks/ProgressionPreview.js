import { pointsForRange } from "@/lib/points";

const PREVIEW_COUNT = 5;

// フォーム入力中の設定で、1〜5回目に何ポイントになるかを表示する
export default function ProgressionPreview({ form }) {
  const task = {
    points: Number(form.points) || 0,
    progression: form.progression,
    step: Number(form.step) || 0,
  };
  const limit = Number(form.daily_limit) || PREVIEW_COUNT;
  const { total, breakdown } = pointsForRange(task, 1, Math.min(PREVIEW_COUNT, limit));
  const sign = form.is_penalty ? "−" : "+";

  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="mb-2 text-[11px] font-semibold text-gray-500">プレビュー</p>
      <div className="grid grid-cols-5 gap-1.5 text-center">
        {breakdown.map((b) => (
          <div key={b.n} className="rounded-lg bg-white py-1.5">
            <p className="text-[10px] text-gray-400">{b.n}回目</p>
            <p
              className={`text-sm font-bold tabular-nums ${
                form.is_penalty ? "text-spend" : "text-accent"
              }`}
            >
              {sign}
              {b.points}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-right text-[11px] tabular-nums text-gray-500">
        {breakdown.length}回で合計 {sign}
        {total}pt
      </p>
    </div>
  );
}
