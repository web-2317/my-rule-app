"use client";

import { useEffect } from "react";

export const DATA_CHANGED_EVENT = "rule-data-changed";

// 達成・ご褒美・取り消し・編集などでデータが変わったことを、表示中のページとヘッダーに通知する
export function notifyDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
  }
}

export function useDataChanged(handler) {
  useEffect(() => {
    window.addEventListener(DATA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
  }, [handler]);
}
