// 「今日」は日本時間で判定する（サーバーが UTC で動いていても日付がずれないように）
export const TIME_ZONE = "Asia/Tokyo";

// 1日の区切りは深夜4時。0:00〜3:59 の記録は前日扱いにする（夜更かし中の記録を「その日」に含めるため）
export const DAY_START_HOUR = 4;

const keyFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });

// Date → "YYYY-MM-DD"（JST）
export function dateKeyOf(date) {
  return keyFormatter.format(date);
}

// アプリ上の「今日」（DAY_START_HOUR 時に切り替わる）
export function todayKey() {
  return dateKeyOf(new Date(Date.now() - DAY_START_HOUR * 60 * 60 * 1000));
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
