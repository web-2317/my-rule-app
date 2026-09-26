"use client";

import { useCallback, useEffect, useState } from "react";
import RewardCard from "./RewardCard";
import RewardForm from "./RewardForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ItemIcon, { iconText } from "@/components/ui/ItemIcon";
import ListToolbar, { ToolbarButton } from "@/components/ui/ListToolbar";
import Modal from "@/components/ui/Modal";
import PageTitle from "@/components/ui/PageTitle";
import ReorderList from "@/components/ui/ReorderList";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/client";
import { notifyDataChanged, useDataChanged } from "@/lib/useDataChanged";
import { useSummary } from "@/lib/useSummary";
import { useUndo } from "@/lib/useUndo";

export default function RewardListPage({ initialRewards }) {
  const [rewards, setRewards] = useState(initialRewards);
  const [confirming, setConfirming] = useState(null); // { reward, count }
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [pending, setPending] = useState(false);
  const { balance } = useSummary();
  const toast = useToast();
  const undo = useUndo();

  useEffect(() => setRewards(initialRewards), [initialRewards]);

  const load = useCallback(async () => {
    try {
      setRewards(await api("/api/rewards"));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useDataChanged(load);

  const handleRedeem = async () => {
    const { reward, count } = confirming;
    setPending(true);
    try {
      const { log } = await api(`/api/rewards/${reward.id}/redeem`, {
        method: "POST",
        body: { count },
      });
      setConfirming(null);
      notifyDataChanged();
      const times = count > 1 ? ` ×${count}` : "";
      toast({
        message: `${iconText(reward)}${reward.name}${times}  −${-log.points}pt　楽しんで！`,
        action: { label: "元に戻す", onClick: () => undo(log.id) },
      });
    } catch (e) {
      toast({ message: e.message, tone: "error" });
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    setPending(true);
    try {
      await api(`/api/rewards/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      notifyDataChanged();
      toast({ message: "削除しました", duration: 2500 });
    } catch (e) {
      toast({ message: e.message, tone: "error" });
    } finally {
      setPending(false);
    }
  };

  const handleReorder = async (ids) => {
    try {
      await api("/api/rewards/reorder", { method: "PUT", body: { ids } });
      setReordering(false);
      notifyDataChanged();
    } catch (e) {
      toast({ message: e.message, tone: "error" });
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6">
      <PageTitle title="ご褒美" subtitle="貯めたポイントで自分にご褒美を" />

      {rewards.length === 0 ? (
        <EmptyState title="ご褒美はまだありません" hint="下の ＋ から追加できます" />
      ) : reordering ? (
        <ReorderList items={rewards} onSave={handleReorder} onCancel={() => setReordering(false)} />
      ) : (
        <>
          {rewards.length > 1 && (
            <ListToolbar>
              <ToolbarButton onClick={() => setReordering(true)}>↕ 並び替え</ToolbarButton>
            </ListToolbar>
          )}
          <div className="space-y-4">
            {rewards.map((r) => (
              <RewardCard
                key={r.id}
                reward={r}
                balance={balance}
                onRedeem={(reward, count) => setConfirming({ reward, count })}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        </>
      )}

      {confirming && (
        <ConfirmDialog
          title="ご褒美を使う"
          confirmLabel="使う"
          pending={pending}
          onConfirm={handleRedeem}
          onCancel={() => setConfirming(null)}
        >
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-amber-50 text-4xl">
              <ItemIcon emoji={confirming.reward.emoji} imageId={confirming.reward.image_id} />
            </div>
            <p className="mt-2 font-bold text-gray-900">
              {confirming.reward.name}
              {confirming.count > 1 && ` ×${confirming.count}`}
            </p>
            <p className="mt-3 text-2xl font-bold tabular-nums text-spend">
              −{confirming.reward.cost * confirming.count}pt
            </p>
            <p className="mt-1 text-xs tabular-nums text-gray-400">
              {balance}pt → {balance - confirming.reward.cost * confirming.count}pt
            </p>
          </div>
        </ConfirmDialog>
      )}

      {deleting && (
        <ConfirmDialog
          title="ご褒美を削除"
          confirmLabel="削除する"
          tone="danger"
          pending={pending}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        >
          「{iconText(deleting)}{deleting.name}」を削除しますか？
          <p className="mt-1 text-xs text-gray-400">これまでの履歴・統計は残ります。</p>
        </ConfirmDialog>
      )}

      {editing && (
        <Modal title="ご褒美を編集" onClose={() => setEditing(null)}>
          <RewardForm
            editing={editing}
            onSaved={() => {
              setEditing(null);
              notifyDataChanged();
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </main>
  );
}
