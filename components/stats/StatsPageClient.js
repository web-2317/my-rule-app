"use client";

import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import HistoryList from "./HistoryList";
import RankingCard from "./RankingCard";
import SummaryTiles from "./SummaryTiles";
import { GAIN_COLOR, LOSS_COLOR } from "./PointsChart";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { iconText } from "@/components/ui/ItemIcon";
import PageSkeleton, { LoadError } from "@/components/ui/PageSkeleton";
import PageTitle from "@/components/ui/PageTitle";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/client";
import { useResource } from "@/lib/useResource";
import { useUndo } from "@/lib/useUndo";

export default function StatsPageClient() {
  const { data: stats, error, reload } = useResource("/api/stats");
  const { data: firstPage } = useResource("/api/logs");
  // 「もっと見る」で追加読み込みした分（1ページ目が更新されたらリセット）
  const [olderPages, setOlderPages] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [undoing, setUndoing] = useState(null);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const undo = useUndo();

  useEffect(() => setOlderPages([]), [firstPage]);

  const pages = firstPage ? [firstPage, ...olderPages] : [];
  const historyLogs = pages.flatMap((p) => p.logs);
  const nextCursor = pages.length ? pages[pages.length - 1].nextCursor : null;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await api(`/api/logs?before=${nextCursor}`);
      setOlderPages((prev) => [...prev, next]);
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
    <main className="mx-auto max-w-3xl space-y-4 px-4 pb-8 pt-6 sm:px-6">
      <PageTitle title="データ" subtitle="積み重ねを振り返ろう" />

      {!stats || !firstPage ? (
        error ? <LoadError onRetry={reload} /> : <PageSkeleton count={3} height="h-56" />
      ) : (
        <>
          <SummaryTiles stats={stats} gainColor={GAIN_COLOR} lossColor={LOSS_COLOR} />
          <ChartCard daily={stats.daily} />
          <RankingCard stats={stats} />
          <HistoryList
            logs={historyLogs}
            hasMore={Boolean(nextCursor)}
        loadingMore={loadingMore}
            onLoadMore={loadMore}
            onUndo={setUndoing}
          />
        </>
      )}

      {undoing && (
        <ConfirmDialog
          title="記録を取り消す"
          confirmLabel="取り消す"
          tone="danger"
          pending={pending}
          onConfirm={handleUndo}
          onCancel={() => setUndoing(null)}
        >
          「{iconText(undoing)}{undoing.name}
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
