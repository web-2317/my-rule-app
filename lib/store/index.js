import { createMemoryStore } from "./memory";
import { createNeonStore } from "./neon";

let store;

// DATABASE_URL があれば Neon、なければ開発用のメモリストアを使う
export function getStore() {
  if (!store) {
    const url = process.env.DATABASE_URL;
    store = url ? createNeonStore(url) : createMemoryStore();
  }
  return store;
}
