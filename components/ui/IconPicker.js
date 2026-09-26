"use client";

import { useRef, useState } from "react";
import ItemIcon from "./ItemIcon";
import Modal from "./Modal";
import { inputClass } from "./Field";
import { api } from "@/lib/client";
import { ICON_CATEGORIES } from "@/lib/constants";
import { fileToIconDataUrl } from "@/lib/imageIcon";

// フォームのアイコン欄。押すとポップアップが開き、絵文字または画像を選ぶ
// value: { emoji, image_id } / onChange: 同じ形で返す
export default function IconPicker({ value, onChange, defaultCategory = "basic", tone = "accent" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-2 pr-4 text-left transition hover:border-accent"
      >
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-3xl ${
            tone === "danger" ? "bg-rose-50" : tone === "reward" ? "bg-amber-50" : "bg-emerald-50"
          }`}
        >
          <ItemIcon emoji={value.emoji} imageId={value.image_id} />
        </span>
        <span className="flex-1 text-sm text-gray-500">
          {value.image_id ? "画像アイコン" : "絵文字アイコン"}
        </span>
        <span className="text-xs font-semibold text-accent">変更する</span>
      </button>

      {open && (
        <IconSheet
          value={value}
          defaultCategory={defaultCategory}
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function IconSheet({ value, defaultCategory, onSelect, onClose }) {
  const [category, setCategory] = useState(defaultCategory);
  const [custom, setCustom] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const emojis = ICON_CATEGORIES.find((c) => c.key === category).emojis;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = await fileToIconDataUrl(file);
      const { id } = await api("/api/icons", { method: "POST", body: { data } });
      // 絵文字は、画像が表示できない場所（トーストなど）の代わりとして残しておく
      onSelect({ emoji: value.emoji, image_id: id });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal title="アイコンを選ぶ" onClose={onClose}>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 transition hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {uploading ? "アップロード中…" : "🖼️ 画像をアップロード"}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <p className="mt-1.5 text-center text-[11px] text-gray-400">正方形に切り抜いて保存します</p>
      {error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {/* カテゴリ（横スクロール） */}
      <div className="-mx-5 mt-4 overflow-x-auto px-5 pb-1">
        <div className="flex w-max gap-1.5">
          {ICON_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                c.key === category ? "bg-accent text-white" : "bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-1.5">
        {emojis.map((e, i) => {
          const selected = !value.image_id && value.emoji === e;
          return (
            <button
              key={`${e}-${i}`}
              type="button"
              aria-label={e}
              onClick={() => onSelect({ emoji: e, image_id: null })}
              className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition ${
                selected ? "bg-emerald-50 ring-2 ring-accent" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {e}
            </button>
          );
        })}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          // ポータルでも React のイベントは親に伝わるため、外側のタスク／ご褒美フォームを送信させない
          e.stopPropagation();
          const emoji = custom.trim();
          if (emoji) onSelect({ emoji, image_id: null });
        }}
      >
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={16}
          placeholder="ほかの絵文字を入力"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!custom.trim()}
          className="shrink-0 rounded-xl bg-accent px-4 text-sm font-bold text-white disabled:opacity-40"
        >
          決定
        </button>
      </form>
    </Modal>
  );
}
