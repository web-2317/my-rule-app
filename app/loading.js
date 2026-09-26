// ページ切り替え中のスケルトン（サーバーでのデータ取得を待つ間に表示）
export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6" aria-busy="true">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200/70" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-3xl bg-white shadow-card" />
        ))}
      </div>
    </main>
  );
}
