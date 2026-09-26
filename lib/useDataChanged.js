"use client";

import { useEffect } from "react";

const EVENT_NAME = "rule-data-changed";

// 達成・ご褒美・取り消し・編集などでデータが変わったことを、表示中のページとヘッダーに通知する
export function notifyDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export function useDataChanged(handler) {
  useEffect(() => {
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [handler]);
}
