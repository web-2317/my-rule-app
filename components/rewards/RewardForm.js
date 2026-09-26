"use client";

import { useState } from "react";
import EmojiPicker from "@/components/ui/EmojiPicker";
import Field, { NumberInput, inputClass } from "@/components/ui/Field";
import FormActions from "@/components/ui/FormActions";
import { api } from "@/lib/client";
import { REWARD_EMOJIS } from "@/lib/constants";

function initialForm(editing) {
  if (!editing) return { name: "", emoji: "🎁", cost: "50", daily_limit: "", memo: "" };
  return {
    name: editing.name,
    emoji: editing.emoji,
    cost: String(editing.cost),
    daily_limit: editing.daily_limit ? String(editing.daily_limit) : "",
    memo: editing.memo,
  };
}

export default function RewardForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(() => initialForm(editing));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...form, daily_limit: form.daily_limit || null };
      const saved = editing
        ? await api(`/api/rewards/${editing.id}`, { method: "PUT", body })
        : await api("/api/rewards", { method: "POST", body });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="名前">
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
          maxLength={50}
          placeholder="例：ゲーム1時間"
          className={inputClass}
          autoFocus={!editing}
          required
        />
      </Field>

      <Field label="消費ポイント">
        <NumberInput value={form.cost} onChange={set("cost")} unit="pt" min={1} step={1} required />
      </Field>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-gray-500">アイコン</span>
        <EmojiPicker value={form.emoji} onChange={set("emoji")} presets={REWARD_EMOJIS} />
      </div>

      <Field label="1日の上限回数（任意）" hint="空欄なら何回でも使えます">
        <NumberInput value={form.daily_limit} onChange={set("daily_limit")} unit="回" min={1} step={1} placeholder="なし" />
      </Field>

      <Field label="メモ（任意）">
        <input
          type="text"
          value={form.memo}
          onChange={(e) => set("memo")(e.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <FormActions
        error={error}
        saving={saving}
        submitLabel={editing ? "保存する" : "追加する"}
        onCancel={onCancel}
      />
    </form>
  );
}
