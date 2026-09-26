"use client";

import { useState } from "react";
import EmojiPicker from "@/components/ui/EmojiPicker";
import Field, { NumberInput, inputClass } from "@/components/ui/Field";
import FormActions from "@/components/ui/FormActions";
import Segmented from "@/components/ui/Segmented";
import ProgressionPreview from "./ProgressionPreview";
import { api } from "@/lib/client";
import { PENALTY_EMOJIS, TASK_EMOJIS } from "@/lib/constants";
import { PROGRESSIONS } from "@/lib/points";

// 加算方式を切り替えたときの初期値
const DEFAULT_STEP = { none: "", arithmetic: "5", geometric: "1.5" };

function initialForm(editing) {
  if (!editing) {
    return {
      name: "",
      emoji: "✅",
      points: "10",
      is_penalty: false,
      progression: "none",
      step: "",
      daily_limit: "",
      memo: "",
    };
  }
  return {
    name: editing.name,
    emoji: editing.emoji,
    points: String(editing.points),
    is_penalty: editing.is_penalty,
    progression: editing.progression,
    step: editing.progression === "none" ? "" : String(editing.step),
    daily_limit: editing.daily_limit ? String(editing.daily_limit) : "",
    memo: editing.memo,
  };
}

export default function TaskForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(() => initialForm(editing));
  const [showDetail, setShowDetail] = useState(
    Boolean(editing && (editing.progression !== "none" || editing.daily_limit))
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const penalty = form.is_penalty;

  const changeKind = (kind) => {
    const toPenalty = kind === "penalty";
    setForm((f) => ({
      ...f,
      is_penalty: toPenalty,
      // プリセットのアイコンのままなら、種類に合わせたアイコンに差し替える
      emoji:
        f.emoji === (toPenalty ? TASK_EMOJIS[0] : PENALTY_EMOJIS[0])
          ? toPenalty
            ? PENALTY_EMOJIS[0]
            : TASK_EMOJIS[0]
          : f.emoji,
    }));
  };

  const changeProgression = (progression) => {
    setForm((f) => ({ ...f, progression, step: DEFAULT_STEP[progression] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        ...form,
        step: form.progression === "none" ? 0 : form.step,
        daily_limit: form.daily_limit || null,
      };
      const saved = editing
        ? await api(`/api/tasks/${editing.id}`, { method: "PUT", body })
        : await api("/api/tasks", { method: "POST", body });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Segmented
        options={[
          { key: "normal", label: "通常タスク" },
          { key: "penalty", label: "ペナルティ" },
        ]}
        value={penalty ? "penalty" : "normal"}
        onChange={changeKind}
        tone={penalty ? "danger" : "accent"}
      />
      {penalty && (
        <p className="-mt-2 text-[11px] text-gray-400">
          やってしまったときに記録すると、ポイントが減ります（残高は 0pt 未満になりません）。
        </p>
      )}

      <Field label="名前">
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
          maxLength={50}
          placeholder={penalty ? "例：夜更かし" : "例：30分勉強する"}
          className={inputClass}
          autoFocus={!editing}
          required
        />
      </Field>

      <Field label={penalty ? "減点ポイント（1回目）" : "獲得ポイント（1回目）"}>
        <NumberInput value={form.points} onChange={set("points")} unit="pt" min={0} step={1} required />
      </Field>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-gray-500">アイコン</span>
        <EmojiPicker
          value={form.emoji}
          onChange={set("emoji")}
          presets={penalty ? PENALTY_EMOJIS : TASK_EMOJIS}
        />
      </div>

      <Field label="メモ（任意）">
        <input
          type="text"
          value={form.memo}
          onChange={(e) => set("memo")(e.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <div className="rounded-2xl border border-gray-100">
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700"
        >
          詳細設定
          <span className="text-xs font-normal text-gray-400">
            {showDetail ? "閉じる ▲" : "回数による増減・1日の上限 ▼"}
          </span>
        </button>

        {showDetail && (
          <div className="space-y-5 border-t border-gray-100 px-4 pb-4 pt-4">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-gray-500">
                1日の中で回数を重ねたときのポイント
              </span>
              <Segmented options={PROGRESSIONS} value={form.progression} onChange={changeProgression} />
              <p className="mt-1.5 text-[11px] text-gray-400">
                {PROGRESSIONS.find((p) => p.key === form.progression).description}
              </p>
            </div>

            {form.progression === "arithmetic" && (
              <Field label="1回ごとに足す数" hint="マイナスにすると、やるほど減っていきます">
                <NumberInput value={form.step} onChange={set("step")} unit="pt" step={1} required />
              </Field>
            )}
            {form.progression === "geometric" && (
              <Field label="1回ごとに掛ける倍率" hint="1 未満にすると、やるほど減っていきます（0.01〜10）">
                <NumberInput value={form.step} onChange={set("step")} unit="倍" step={0.01} min={0.01} max={10} required />
              </Field>
            )}

            <ProgressionPreview form={form} />

            <Field label="1日の上限回数（任意）" hint="空欄なら何回でも記録できます">
              <NumberInput value={form.daily_limit} onChange={set("daily_limit")} unit="回" min={1} step={1} placeholder="なし" />
            </Field>
          </div>
        )}
      </div>

      <FormActions
        error={error}
        saving={saving}
        submitLabel={editing ? "保存する" : "追加する"}
        onCancel={onCancel}
      />
    </form>
  );
}
