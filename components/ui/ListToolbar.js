// 一覧の上に置く小さな操作ボタン（並び替えなど）
export default function ListToolbar({ children }) {
  return <div className="mb-3 flex justify-end gap-2 px-1">{children}</div>;
}

export function ToolbarButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-white px-3 py-1.5 text-xs text-gray-500 shadow-sm ring-1 ring-black/5 transition hover:text-accent"
    >
      {children}
    </button>
  );
}
