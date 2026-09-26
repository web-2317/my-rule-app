"use client";

import { formatDateShort, formatTime } from "@/lib/dates";

const KIND_LABEL = { task: "タスク", penalty: "ペナルティ", reward: "ご褒美" };

function groupByDate(logs) {
  const groups = [];
  for (const log of logs) {
    const last = groups[groups.length - 1];
    if (last?.date === log.local_date) last.logs.push(log);
    else groups.push({ date: log.local_date, logs: [log] });
  }
  return groups;
}

// ポイントの増減履歴（新しい順）。各行から取り消しできる
export default function HistoryList({ logs, hasMore, loadingMore, onLoadMore, onUndo }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <h2 className="mb-1 text-sm font-bold text-gray-900">履歴</h2>

      {logs.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-400">まだ記録がありません</p>
      ) : (
        <div className="space-y-4">
          {groupByDate(logs).map((g) => (
            <div key={g.date}>
              <p className="sticky top-[4.5rem] bg-white py-1.5 text-[11px] font-semibold text-gray-400">
                {formatDateShort(g.date)}
              </p>
              <ul className="divide-y divide-gray-50">
                {g.logs.map((log) => (
                  <li key={log.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-xl">{log.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-gray-800">
                        {log.name}
                        {log.count > 1 && <span className="text-gray-400"> ×{log.count}</span>}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatTime(log.created_at)} · {KIND_LABEL[log.kind]}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-bold tabular-nums ${
                        log.points > 0 ? "text-emerald-600" : log.points < 0 ? "text-rose-600" : "text-gray-400"
                      }`}
                    >
                      {log.points > 0 ? `+${log.points}` : log.points < 0 ? `−${-log.points}` : "±0"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUndo(log)}
                      className="shrink-0 rounded-full px-2 py-1 text-[11px] text-gray-400 transition hover:bg-gray-100 hover:text-rose-500"
                    >
                      取り消す
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mt-3 w-full rounded-full bg-gray-50 py-2.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 disabled:opacity-60"
        >
          {loadingMore ? "読み込み中…" : "もっと見る"}
        </button>
      )}
    </section>
  );
}
