"use client";

import { createContext, useContext } from "react";

// 所持ポイント・今日の増減（AppChrome が保持し、ヘッダーやご褒美画面で参照する）
export const SummaryContext = createContext(null);

export function useSummary() {
  return useContext(SummaryContext);
}
