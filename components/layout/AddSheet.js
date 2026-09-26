"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { iconText } from "@/components/ui/ItemIcon";
import Segmented from "@/components/ui/Segmented";
import TaskForm from "@/components/tasks/TaskForm";
import RewardForm from "@/components/rewards/RewardForm";
import { useToast } from "@/components/ui/Toast";
import { notifyDataChanged } from "@/lib/useDataChanged";

// ＋ボタンから開く追加シート。ご褒美ページではご褒美を初期選択にする
export default function AddSheet({ onClose }) {
  const pathname = usePathname();
  const [kind, setKind] = useState(pathname === "/rewards" ? "reward" : "task");
  const toast = useToast();

  const handleSaved = (item) => {
    onClose();
    notifyDataChanged();
    toast({ message: `${iconText(item)}${item.name} を追加しました`, duration: 2500 });
  };

  return (
    <Modal title="追加" onClose={onClose}>
      <div className="mb-5">
        <Segmented
          options={[
            { key: "task", label: "タスク" },
            { key: "reward", label: "ご褒美" },
          ]}
          value={kind}
          onChange={setKind}
        />
      </div>
      {kind === "task" ? (
        <TaskForm key="task" onSaved={handleSaved} onCancel={onClose} />
      ) : (
        <RewardForm key="reward" onSaved={handleSaved} onCancel={onClose} />
      )}
    </Modal>
  );
}
