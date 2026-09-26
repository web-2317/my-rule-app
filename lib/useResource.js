"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./client";
import { DATA_CHANGED_EVENT } from "./useDataChanged";

// API の結果をブラウザ側で保持するキャッシュ（キー = API のパス）。
// タブを切り替えたときは保持しているデータを即座に表示し、裏で最新に更新する。
// データが変わったとき（達成・取り消し・編集など）は、表示中でないタブの分もまとめて更新しておく
const cache = new Map();
const subscribers = new Map();
const latestRequest = new Map();
let requestSeq = 0;

function emit(key) {
  subscribers.get(key)?.forEach((fn) => fn(cache.get(key)));
}

// 最新のリクエストの結果だけを反映する（書き込み直後の再取得が、古いリクエストの結果で上書きされないように）
export function refresh(key) {
  const seq = ++requestSeq;
  latestRequest.set(key, seq);
  return api(key).then((data) => {
    if (latestRequest.get(key) === seq) {
      cache.set(key, data);
      emit(key);
    }
    return data;
  });
}

function refreshAll() {
  const keys = new Set([...cache.keys(), ...subscribers.keys()]);
  keys.forEach((key) => refresh(key).catch((e) => console.error(e)));
}

// アプリ起動時に、まだ開いていないタブのデータを先読みする
export function prefetch(keys) {
  keys.forEach((key) => {
    if (!cache.has(key)) refresh(key).catch((e) => console.error(e));
  });
}

if (typeof window !== "undefined") {
  window.addEventListener(DATA_CHANGED_EVENT, refreshAll);
}

export function useResource(key) {
  const [data, setData] = useState(() => cache.get(key));
  const [error, setError] = useState(null);

  useEffect(() => {
    let set = subscribers.get(key);
    if (!set) subscribers.set(key, (set = new Set()));
    set.add(setData);
    if (cache.has(key)) setData(cache.get(key));
    // 保持しているデータがあっても、表示のたびに裏で最新にする
    refresh(key).then(
      () => setError(null),
      (e) => setError(e)
    );
    return () => set.delete(setData);
  }, [key]);

  const reload = useCallback(() => refresh(key), [key]);
  return { data, error, reload };
}
