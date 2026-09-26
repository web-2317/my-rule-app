"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AddSheet from "./AddSheet";
import BottomNav from "./BottomNav";
import PointHeader from "./PointHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { SummaryContext } from "@/lib/useSummary";
import { notifyDataChanged } from "@/lib/useDataChanged";
import { prefetch, useResource } from "@/lib/useResource";

// 各タブで使うデータ。起動時にまとめて先読みし、タブ切り替えで待たないようにする
const PREFETCH_KEYS = ["/api/tasks", "/api/rewards", "/api/stats", "/api/logs"];

export default function AppChrome({ children }) {
  const { data: summary } = useResource("/api/summary");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    prefetch(PREFETCH_KEYS);
  }, []);

  // ヘッダーの高さを CSS 変数に反映し、スクロール位置の調整（scroll-padding-top）に使う
  const topRef = useRef(null);
  useEffect(() => {
    const el = topRef.current;
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // スクロールしたらヘッダー下に境界線を出す
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ページを切り替えたら常に先頭から表示する（Next.js の自動スクロールだと
  // 固定ヘッダーの下に内容の先頭が潜り込むことがあるため、ナビは scroll={false} にしている）
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
        <div ref={topRef} className="sticky top-0 z-30">
          {summary?.store === "memory" && (
            <div className="bg-amber-100 px-4 py-1.5 text-center text-[11px] text-amber-800">
              DB 未接続：サンプルデータで動作中（サーバーを再起動すると消えます）
            </div>
          )}
          <PointHeader summary={summary} scrolled={scrolled} />
        </div>
        <div className="pb-28">{children}</div>
        <BottomNav onAddClick={() => setShowAdd(true)} />
        {showAdd && <AddSheet onClose={() => setShowAdd(false)} />}
      </ToastProvider>
    </SummaryContext.Provider>
  );
}
