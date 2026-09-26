// データを初めて読み込むまでの仮表示（カード型）
export default function PageSkeleton({ count = 3, height = "h-36" }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${height} animate-pulse rounded-3xl bg-white shadow-card`} />
      ))}
    </div>
  );
}

// 読み込みに失敗し、表示できるデータもないとき
export function LoadError({ onRetry }) {
  return (
    <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-card">
      <p className="text-sm text-gray-500">データを読み込めませんでした</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-bold text-white hover:bg-accent-hover"
      >
        再読み込み
      </button>
    </div>
  );
}
