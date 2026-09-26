"use client";

import { useCallback, useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ListToolbar, { ToolbarButton } from "@/components/ui/ListToolbar";
import Modal from "@/components/ui/Modal";
import PageTitle from "@/components/ui/PageTitle";
import ReorderList from "@/components/ui/ReorderList";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/client";
import { notifyDataChanged, useDataChanged } from "@/lib/useDataChanged";
import { useUndo } from "@/lib/useUndo";

export default function TaskListPage({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const undo = useUndo();

  // ページ遷移で戻ってきたときはサーバーから渡された最新データで置き換える
  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const load = useCallback(async () => {
    try {
      setTasks(await api("/api/tasks"));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useDataChanged(load);

  // 成功時は記録（log）を返し、失敗時は null を返す
  const handleComplete = async (task, count) => {
    try {
      const { log } = await api(`/api/tasks/${task.id}/complete`, {
        method: "POST",
        body: { count },
      });
      notifyDataChanged();

      const amount = Math.abs(log.points);
      const times = count > 1 ? ` ×${count}` : "";
      let message = task.is_penalty
        ? `${task.emoji} ${task.name}${times}  −${amount}pt`
        : `${task.emoji} ${task.name}${times}  +${amount}pt`;
      if (log.requested > amount) {
        message += `（残高不足のため ${amount}pt で止めました）`;
      }
      toast({ message, action: { label: "元に戻す", onClick: () => undo(log.id) } });
      return log;
    } catch (e) {
      toast({ message: e.message, tone: "error" });
      return null;
    }
  };

  const handleDelete = async () => {
    setPending(true);
    try {
      await api(`/api/tasks/${deleting.id}`, { method: "DELETE" });
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
      await api("/api/tasks/reorder", { method: "PUT", body: { ids } });
      setReordering(false);
      notifyDataChanged();
    } catch (e) {
      toast({ message: e.message, tone: "error" });
    }
  };

  const normalTasks = tasks.filter((t) => !t.is_penalty);
  const penaltyTasks = tasks.filter((t) => t.is_penalty);
  const renderCard = (t) => (
    <TaskCard
      key={t.id}
      task={t}
      onComplete={handleComplete}
      onEdit={setEditing}
      onDelete={setDeleting}
    />
  );

  return (
    <main className="mx-auto max-w-3xl px-4 pb-8 pt-4 sm:px-6">
      <PageTitle title="タスク" subtitle="達成してポイントを貯めよう" />

      {tasks.length === 0 ? (
        <EmptyState title="タスクはまだありません" hint="下の ＋ から追加できます" />
      ) : reordering ? (
        // 通常タスクが上、ペナルティが下という表示順は保ったまま、それぞれの中で並べ替える
        <ReorderList
          items={[...normalTasks, ...penaltyTasks]}
          onSave={handleReorder}
          onCancel={() => setReordering(false)}
        />
      ) : (
        <>
          {tasks.length > 1 && (
            <ListToolbar>
              <ToolbarButton onClick={() => setReordering(true)}>↕ 並び替え</ToolbarButton>
            </ListToolbar>
          )}
          <div className="space-y-8">
            {normalTasks.length > 0 && (
              <section className="space-y-4">{normalTasks.map(renderCard)}</section>
            )}

            {penaltyTasks.length > 0 && (
              <section>
                <div className="mb-3 flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-bold text-gray-700">ペナルティ</h2>
                  <p className="text-[11px] text-gray-400">やってしまったら正直に記録</p>
                </div>
                <div className="space-y-4">{penaltyTasks.map(renderCard)}</div>
              </section>
            )}
          </div>
        </>
      )}

      {deleting && (
        <ConfirmDialog
          title="タスクを削除"
          confirmLabel="削除する"
          tone="danger"
          pending={pending}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        >
          「{deleting.emoji} {deleting.name}」を削除しますか？
          <p className="mt-1 text-xs text-gray-400">これまでの履歴・統計は残ります。</p>
        </ConfirmDialog>
      )}

      {editing && (
        <Modal title="タスクを編集" onClose={() => setEditing(null)}>
          <TaskForm
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
