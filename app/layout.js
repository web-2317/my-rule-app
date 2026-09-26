import { Inter } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/layout/AppChrome";
import { getSummary } from "@/lib/service";
import { todayKey } from "@/lib/dates";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "My Rule",
  description: "タスクでポイントを貯めて、ご褒美に使う。自分ルールで規律を保つアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "My Rule",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#10B981",
};

// 表示内容が「今日」と DB に依存するため、全ページをリクエストごとに生成する
// （読み取り結果は lib/service.js 側で日付ごとにキャッシュしている）
export const dynamic = "force-dynamic";
// API と同じく、Neon の DB リージョン（Singapore）の近くでページを生成する
export const preferredRegion = "sin1";

export default async function RootLayout({ children }) {
  const summary = await getSummary(todayKey());
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen bg-page`}>
        <AppChrome initialSummary={summary}>{children}</AppChrome>
      </body>
    </html>
  );
}
