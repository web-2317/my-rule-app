"use client";

import { useCallback } from "react";
import { api } from "./client";
import { notifyDataChanged } from "./useDataChanged";
import { useToast } from "@/components/ui/Toast";

// 履歴 1 件の取り消し（トーストの「元に戻す」・履歴一覧から使う）
export function useUndo() {
  const toast = useToast();
  return useCallback(
    async (logId) => {
      try {
        await api(`/api/logs/${logId}`, { method: "DELETE" });
        notifyDataChanged();
        toast({ message: "取り消しました", duration: 2500 });
        return true;
      } catch (e) {
        toast({ message: e.message, tone: "error" });
        return false;
      }
    },
    [toast]
  );
}
