"use client";

import { useCallback, useEffect, useState } from "react";
import AddSheet from "./AddSheet";
import BottomNav from "./BottomNav";
import PointHeader from "./PointHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { api } from "@/lib/client";
import { SummaryContext } from "@/lib/useSummary";
import { notifyDataChanged, useDataChanged } from "@/lib/useDataChanged";

export default function AppChrome({ initialSummary, storeKind, children }) {
  const [summary, setSummary] = useState(initialSummary);
  const [showAdd, setShowAdd] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await api("/api/summary"));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useDataChanged(loadSummary);

  // アプリを開きっぱなしで日付をまたいだときなどに備え、画面に戻ってきたら再取得する
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") notifyDataChanged();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <SummaryContext.Provider value={summary}>
      <ToastProvider>
        {storeKind === "memory" && (
          <div className="bg-amber-100 px-4 py-1.5 text-center text-[11px] text-amber-800">
            DB 未接続：サンプルデータで動作中（サーバーを再起動すると消えます）
          </div>
        )}
        <PointHeader summary={summary} />
        <div className="pb-28">{children}</div>
        <BottomNav onAddClick={() => setShowAdd(true)} />
        {showAdd && <AddSheet onClose={() => setShowAdd(false)} />}
      </ToastProvider>
    </SummaryContext.Provider>
  );
}
