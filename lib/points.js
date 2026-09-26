// ポイント計算（純粋関数）。サーバーでの確定計算とフォームのプレビューで共用する

export const PROGRESSIONS = [
  { key: "none", label: "固定", description: "何回目でも同じポイント" },
  { key: "arithmetic", label: "等差", description: "1回ごとに一定数を足す" },
  { key: "geometric", label: "等比", description: "1回ごとに一定倍率を掛ける" },
];

// 1回あたりのポイント上限（等比で値が爆発するのを防ぐ）
export const MAX_POINTS_PER_ACTION = 9999;
export const MAX_COUNT_PER_ACTION = 99;

// その日 n 回目（1始まり）の達成で得られるポイント
export function pointsForNth(task, n) {
  const base = Number(task.points) || 0;
  const step = Number(task.step) || 0;
  let value;
  switch (task.progression) {
    case "arithmetic":
      value = base + (n - 1) * step;
      break;
    case "geometric":
      value = base * Math.pow(step, n - 1);
      break;
    default:
      value = base;
  }
  return Math.min(MAX_POINTS_PER_ACTION, Math.max(0, Math.round(value)));
}

// from 回目から count 回分をまとめて達成したときの内訳と合計
export function pointsForRange(task, from, count) {
  const breakdown = [];
  for (let i = 0; i < count; i++) {
    const n = from + i;
    breakdown.push({ n, points: pointsForNth(task, n) });
  }
  const total = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { total, breakdown };
}

// 設定の説明文（カードやフォームで表示）例: "10pt → +5ずつ"
export function describeProgression(task) {
  const step = Number(task.step) || 0;
  if (task.progression === "arithmetic") {
    return `${step >= 0 ? "+" : ""}${step}pt ずつ`;
  }
  if (task.progression === "geometric") {
    return `×${step} ずつ`;
  }
  return null;
}
