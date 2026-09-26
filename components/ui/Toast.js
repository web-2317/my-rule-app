"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(() => {});

// 画面下部（ナビの上）に出す通知。action を渡すと「元に戻す」などのボタンが付く
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback(({ message, tone = "default", action, duration = 5000 }) => {
    clearTimeout(timer.current);
    const id = Date.now();
    setToast({ id, message, tone, action });
    timer.current = setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, duration);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
        >
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-md animate-toast-in items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white shadow-lg ${
              toast.tone === "error" ? "bg-rose-500" : "bg-gray-900/95"
            }`}
          >
            <span className="min-w-0 flex-1">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  hide();
                  toast.action.onClick();
                }}
                className="shrink-0 font-semibold text-emerald-300 hover:text-emerald-200"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
