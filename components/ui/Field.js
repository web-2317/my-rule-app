// フォームのラベル付き入力欄
export const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-900 placeholder:text-gray-300 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20";

export default function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

// 数値入力＋単位（pt / 回 など）
export function NumberInput({ value, onChange, unit, ...props }) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-10 tabular-nums`}
        {...props}
      />
      {unit && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
          {unit}
        </span>
      )}
    </div>
  );
}
