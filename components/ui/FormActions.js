// フォーム下部のボタン＋エラー表示
export default function FormActions({ error, saving, submitLabel, onCancel }) {
  return (
    <div className="pt-2">
      {error && <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-accent py-3 text-sm font-bold text-white shadow-sm transition hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "保存中…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
