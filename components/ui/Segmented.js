"use client";

// iOS 風のセグメント切り替え
export default function Segmented({ options, value, onChange, tone = "accent" }) {
  return (
    <div className="flex rounded-xl bg-gray-100 p-1">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              active
                ? `bg-white shadow-sm ${tone === "danger" ? "text-rose-500" : "text-accent"}`
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
