"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

// 開いているモーダルの順番。Esc では一番上のものだけを閉じる（アイコン選択などで重ねて開くため）
const stack = [];

export default function Modal({ title, onClose, children }) {
  const id = useId();

  useEffect(() => {
    stack.push(id);
    const onKey = (e) => {
      if (e.key === "Escape" && stack[stack.length - 1] === id) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      stack.splice(stack.indexOf(id), 1);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [id, onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => {
        // 重ねたモーダルのクリックが、下のモーダルまで伝わって閉じないようにする
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
