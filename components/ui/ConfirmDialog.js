"use client";

import Modal from "./Modal";

// 確認用のボトムシート（ご褒美の実行・削除など）
export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  tone = "accent",
  pending = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="text-sm text-gray-600">{children}</div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`flex-1 rounded-full py-3 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 ${
            tone === "danger" ? "bg-rose-500 hover:bg-rose-600" : "bg-accent hover:bg-accent-hover"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
