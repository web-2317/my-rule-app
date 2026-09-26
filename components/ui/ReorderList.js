"use client";

import { useState } from "react";

// 並び替えモード。↑↓ で順番を入れ替え、「完了」で保存する
export default function ReorderList({ items, onSave, onCancel }) {
  const [order, setOrder] = useState(items);
  const [saving, setSaving] = useState(false);

  const move = (index, delta) => {
    const next = [...order];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setOrder(next);
  };

  const arrow =
    "flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 disabled:hover:bg-transparent";

  return (
    <div>
      <ul className="space-y-2">
        {order.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-card"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">
              {item.name}
            </span>
            <button type="button" aria-label="上へ" className={arrow} disabled={i === 0} onClick={() => move(i, -1)}>
              ↑
            </button>
            <button
              type="button"
              aria-label="下へ"
              className={arrow}
              disabled={i === order.length - 1}
              onClick={() => move(i, 1)}
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-gray-600 shadow-card"
        >
          キャンセル
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(order.map((x) => x.id));
            setSaving(false);
          }}
          className="flex-1 rounded-full bg-accent py-3 text-sm font-bold text-white shadow-sm hover:bg-accent-hover disabled:opacity-60"
        >
          完了
        </button>
      </div>
    </div>
  );
}
