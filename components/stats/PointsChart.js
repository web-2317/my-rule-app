"use client";

import { useEffect, useRef, useState } from "react";
import { formatDateShort } from "@/lib/dates";

// 色覚特性に配慮して検証済みの組み合わせ（獲得 = エメラルド / 消費・減点 = ローズ）
export const GAIN_COLOR = "#10B981";
export const LOSS_COLOR = "#E11D48";

const HEIGHT = 190;
const PAD = { top: 12, right: 4, bottom: 24, left: 34 };
const GRID = "#EEF0F2";
const AXIS = "#D5D9DE";

// 軸の目盛りをきりのいい数（1, 2, 5 × 10^n）にする
function niceStep(max) {
  const raw = max / 2;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / pow;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * pow;
}

// 上向き（または下向き）の棒。データ側の端だけ角を丸め、基準線側は四角のまま
function barPath(x, y0, width, height, up) {
  if (height <= 0) return "";
  const r = Math.min(4, height, width / 2);
  if (up) {
    const top = y0 - height;
    return `M${x},${y0} V${top + r} Q${x},${top} ${x + r},${top} H${x + width - r} Q${x + width},${top} ${x + width},${top + r} V${y0} Z`;
  }
  const bottom = y0 + height;
  return `M${x},${y0} V${bottom - r} Q${x},${bottom} ${x + r},${bottom} H${x + width - r} Q${x + width},${bottom} ${x + width},${bottom - r} V${y0} Z`;
}

function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

// 14日間の獲得（上）と消費＋減点（下）。1本の軸で増減の向きを表す
export default function PointsChart({ daily, selected, onSelect }) {
  const [ref, width] = useWidth();

  const up = daily.map((d) => d.earned);
  const down = daily.map((d) => d.spent + d.penalty);
  const step = niceStep(Math.max(10, ...up, ...down));
  const maxUp = Math.max(step, Math.ceil(Math.max(...up) / step) * step);
  const maxDown = Math.max(...down) > 0 ? Math.ceil(Math.max(...down) / step) * step : 0;

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const scale = innerH / (maxUp + maxDown);
  const zeroY = PAD.top + maxUp * scale;
  const band = innerW / daily.length;
  const barW = Math.min(18, band * 0.62);

  const ticks = [];
  for (let v = -maxDown; v <= maxUp; v += step) ticks.push(v);

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="14日間の獲得ポイントと消費ポイントの推移"
          className="block touch-pan-y select-none"
          onPointerLeave={() => onSelect(daily.length - 1)}
        >
          {ticks.map((v) => {
            const y = zeroY - v * scale;
            return (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y}
                  y2={y}
                  stroke={v === 0 ? AXIS : GRID}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-gray-400 text-[10px] tabular-nums"
                >
                  {v > 0 ? `+${v}` : v < 0 ? `−${-v}` : 0}
                </text>
              </g>
            );
          })}

          {daily.map((d, i) => {
            const cx = PAD.left + band * i + band / 2;
            const x = cx - barW / 2;
            const active = i === selected;
            const isToday = i === daily.length - 1;
            const day = Number(d.date.slice(8, 10));
            const showMonth = i === 0 || day === 1;
            return (
              <g key={d.date}>
                {active && (
                  <rect
                    x={PAD.left + band * i + 1}
                    y={PAD.top - 6}
                    width={band - 2}
                    height={innerH + 12}
                    rx={6}
                    className="fill-gray-100"
                  />
                )}
                <path d={barPath(x, zeroY - 1, barW, up[i] * scale - 1, true)} fill={GAIN_COLOR} />
                <path d={barPath(x, zeroY + 1, barW, down[i] * scale - 1, false)} fill={LOSS_COLOR} />
                <text
                  x={cx}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className={`text-[10px] tabular-nums ${
                    active ? "fill-gray-900 font-semibold" : "fill-gray-400"
                  }`}
                >
                  {isToday ? "今日" : showMonth ? `${Number(d.date.slice(5, 7))}/${day}` : day}
                </text>
                {/* 当たり判定は棒より広く、日ごとの帯全体にする */}
                <rect
                  x={PAD.left + band * i}
                  y={0}
                  width={band}
                  height={HEIGHT}
                  fill="transparent"
                  onPointerEnter={() => onSelect(i)}
                  onPointerDown={() => onSelect(i)}
                >
                  <title>
                    {formatDateShort(d.date)} 獲得 +{up[i]} / 消費・減点 −{down[i]}
                  </title>
                </rect>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
