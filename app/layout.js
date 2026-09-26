import { Inter } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/layout/AppChrome";

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

// ページは静的な画面だけを返し、データはクライアントが API から取得する（lib/useResource.js）。
// 静的なページは Next.js が事前に読み込むので、タブの切り替えでサーバーを待たない

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen bg-page`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
