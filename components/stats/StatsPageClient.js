"use client";

import { useCallback, useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import HistoryList from "./HistoryList";
import RankingCard from "./RankingCard";
import SummaryTiles from "./SummaryTiles";
import { GAIN_COLOR, LOSS_COLOR } from "./PointsChart";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageTitle from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/client";
import { useDataChanged } from "@/lib/useDataChanged";
import { useUndo } from "@/lib/useUndo";

export default function StatsPageClient({ initialStats, initialHistory }) {
  const [stats, setStats] = useState(initialStats);
  const [history, setHistory] = useState(initialHistory);
  const [loadingMore, setLoadingMore] = useState(false);
  const [undoing, setUndoing] = useState(null);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const undo = useUndo();

  useEffect(() => setStats(initialStats), [initialStats]);
  useEffect(() => setHistory(initialHistory), [initialHistory]);

  const load = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([api("/api/stats"), api("/api/logs")]);
      setStats(s);
      setHistory(h);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useDataChanged(load);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await api(`/api/logs?before=${history.nextCursor}`);
      setHistory((h) => ({ logs: [...h.logs, ...next.logs], nextCursor: next.nextCursor }));
    } catch (e) {
      toast({ message: e.message, tone: "error" });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUndo = async () => {
    setPending(true);
    const ok = await undo(undoing.id);
    setPending(false);
    if (ok) setUndoing(null);
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 pb-8 pt-4 sm:px-6">
      <PageTitle title="データ" subtitle="積み重ねを振り返ろう" />

      <SummaryTiles stats={stats} gainColor={GAIN_COLOR} lossColor={LOSS_COLOR} />
      <ChartCard daily={stats.daily} />
      <RankingCard stats={stats} />
      <HistoryList
        logs={history.logs}
        hasMore={Boolean(history.nextCursor)}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        onUndo={setUndoing}
      />

      {undoing && (
        <ConfirmDialog
          title="記録を取り消す"
          confirmLabel="取り消す"
          tone="danger"
          pending={pending}
          onConfirm={handleUndo}
          onCancel={() => setUndoing(null)}
        >
          「{undoing.emoji} {undoing.name}
          {undoing.count > 1 ? ` ×${undoing.count}` : ""}」（
          {undoing.points >= 0 ? `+${undoing.points}` : `−${-undoing.points}`}pt）を取り消しますか？
          <p className="mt-1 text-xs text-gray-400">
            所持ポイントは {undoing.points >= 0 ? "減り" : "戻り"}ます。
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}
