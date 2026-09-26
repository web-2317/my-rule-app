"use client";

// DB 接続エラーなどでページが表示できないとき
export default function ErrorPage({ reset }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-8 pt-16 text-center sm:px-6">
      <p className="text-4xl">😵</p>
      <h1 className="mt-3 text-lg font-bold text-gray-900">データを読み込めませんでした</h1>
      <p className="mt-1 text-sm text-gray-500">通信状況を確認して、もう一度お試しください。</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-accent-hover"
      >
        再読み込み
      </button>
    </main>
  );
}
