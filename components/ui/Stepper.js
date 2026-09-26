"use client";

// 回数などの数値を − / ＋ で増減する入力
export default function Stepper({ value, min = 1, max = 99, onChange, disabled, label = "回" }) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-gray-500 transition hover:bg-white hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex items-center rounded-full bg-gray-100 p-0.5">
      <button
        type="button"
        aria-label="減らす"
        className={btn}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="min-w-[2.75rem] text-center text-sm font-semibold tabular-nums text-gray-800">
        {value}
        <span className="ml-0.5 text-[10px] font-normal text-gray-400">{label}</span>
      </span>
      <button
        type="button"
        aria-label="増やす"
        className={btn}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        ＋
      </button>
    </div>
  );
}
