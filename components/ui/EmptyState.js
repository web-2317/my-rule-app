export default function EmptyState({ title, hint }) {
  return (
    <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-card">
      <p className="text-sm text-gray-500">{title}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
