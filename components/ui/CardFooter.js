// カード下部の「編集 / 削除」
export default function CardFooter({ onEdit, onDelete }) {
  return (
    <div className="mt-4 flex justify-end gap-4 border-t border-gray-50 pt-2.5">
      <button
        type="button"
        onClick={onEdit}
        className="text-xs text-gray-400 transition hover:text-accent"
      >
        編集
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-xs text-gray-400 transition hover:text-rose-500"
      >
        削除
      </button>
    </div>
  );
}
