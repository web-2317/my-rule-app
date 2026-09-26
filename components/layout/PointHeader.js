"use client";

import { useEffect, useRef, useState } from "react";

function formatPoints(n) {
  return n.toLocaleString("ja-JP");
}

// 全ページ共通の上部バー。所持ポイントが変わると一瞬強調する
export default function PointHeader({ summary, scrolled }) {
  const { balance, today } = summary;
  const [flash, setFlash] = useState(null);
  const prev = useRef(balance);

  useEffect(() => {
    if (balance === prev.current) return;
    setFlash(balance > prev.current ? "up" : "down");
    prev.current = balance;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [balance]);

  return (
    <header
      className={`bg-page px-4 pt-[env(safe-area-inset-top)] transition-shadow sm:px-6 ${
        scrolled ? "shadow-[0_1px_0_rgba(15,23,42,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-sm">
            P
          </span>
          <div className="leading-tight">
            <p className="text-[10px] text-gray-400">所持ポイント</p>
            <p
              className={`origin-left text-2xl font-bold tabular-nums transition duration-300 ${
                flash === "up"
                  ? "scale-110 text-accent"
                  : flash === "down"
                    ? "scale-95 text-spend"
                    : "text-gray-900"
              }`}
            >
              {formatPoints(balance)}
              <span className="ml-0.5 text-sm font-semibold text-gray-400">pt</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold tabular-nums">
          <span className="text-[10px] font-normal text-gray-400">今日</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
            +{formatPoints(today.earned)}
          </span>
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-500">
            −{formatPoints(today.spent + today.penalty)}
          </span>
        </div>
      </div>
    </header>
  );
}
