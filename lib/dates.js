// 「今日」は日本時間で判定する（サーバーが UTC で動いていても日付がずれないように）
export const TIME_ZONE = "Asia/Tokyo";

const keyFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });

// Date → "YYYY-MM-DD"（JST）
export function dateKeyOf(date) {
  return keyFormatter.format(date);
}

export function todayKey() {
  return dateKeyOf(new Date());
}

// "YYYY-MM-DD" に日数を足す
export function addDays(key, n) {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function formatDateShort(key) {
  const d = new Date(key + "T00:00:00Z");
  return d.toLocaleDateString("ja-JP", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}
