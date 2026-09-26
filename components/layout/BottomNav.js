"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Heroicons (outline) のパス
const ICON_PATHS = {
  tasks: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  rewards:
    "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  stats:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  person:
    "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
};

function NavIcon({ name, className }) {
  return (
    <svg
      className={`h-5 w-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-6 w-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function NavLink({ href, icon, label }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link href={href} className="flex flex-1 flex-col items-center gap-0.5 py-1.5">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          active ? "bg-emerald-50" : ""
        }`}
      >
        <NavIcon name={icon} className={active ? "text-accent" : "text-gray-500"} />
      </span>
      <span className={`text-[10px] ${active ? "font-medium text-accent" : "text-gray-500"}`}>
        {label}
      </span>
    </Link>
  );
}

export default function BottomNav({ onAddClick }) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-md items-center justify-around rounded-full bg-white px-2 py-2 shadow-lg ring-1 ring-black/5">
        <NavLink href="/" icon="tasks" label="タスク" />
        <NavLink href="/rewards" icon="rewards" label="ご褒美" />
        <button
          type="button"
          onClick={onAddClick}
          aria-label="追加"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md transition hover:bg-accent-hover"
        >
          <PlusIcon />
        </button>
        <NavLink href="/stats" icon="stats" label="データ" />
        {/* マイページは未実装（将来のアカウント・設定用の置き場） */}
        <button
          type="button"
          className="flex flex-1 cursor-default flex-col items-center gap-0.5 py-1.5"
          tabIndex={-1}
        >
          <span className="flex h-8 w-8 items-center justify-center">
            <NavIcon name="person" className="text-gray-300" />
          </span>
          <span className="text-[10px] text-gray-300">マイページ</span>
        </button>
      </div>
    </nav>
  );
}
