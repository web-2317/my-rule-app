import { createMemoryStore } from "./memory";
import { createNeonStore } from "./neon";

let store;

// DATABASE_URL があれば Neon、なければ開発用のメモリストアを使う。
// 本番（next build / Vercel）で DATABASE_URL がないと、データが保存されないまま動いてしまうのでエラーにする。
// 動作確認などで本番ビルドをメモリで動かしたいときだけ ALLOW_MEMORY_STORE=1 を付ける
export function getStore() {
  if (!store) {
    const url = process.env.DATABASE_URL;
    if (url) {
      store = createNeonStore(url);
    } else if (process.env.NODE_ENV === "production" && process.env.ALLOW_MEMORY_STORE !== "1") {
      throw new Error(
        "DATABASE_URL が設定されていません（Vercel では Environment Variables に設定して再デプロイしてください）"
      );
    } else {
      store = createMemoryStore();
    }
  }
  return store;
}

export function getStoreKind() {
  return process.env.DATABASE_URL ? "neon" : "memory";
}
