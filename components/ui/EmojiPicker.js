"use client";

import { inputClass } from "./Field";

// よく使うアイコンから選ぶか、任意の絵文字を入力する
export default function EmojiPicker({ value, onChange, presets }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
              value === e ? "bg-emerald-50 ring-2 ring-accent" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={16}
        placeholder="その他の絵文字を入力"
        className={`${inputClass} mt-2`}
      />
    </div>
  );
}
