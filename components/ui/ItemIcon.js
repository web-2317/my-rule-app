// タスク・ご褒美・履歴のアイコン。画像があれば画像、なければ絵文字を表示する
export default function ItemIcon({ emoji, imageId, className = "" }) {
  if (imageId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/icons/${imageId}`}
        alt=""
        className={`h-full w-full rounded-[inherit] object-cover ${className}`}
        loading="lazy"
        draggable={false}
      />
    );
  }
  return <span className={className}>{emoji}</span>;
}

// トーストなど文字だけで表示する場所用（画像アイコンのときは省く）
export function iconText(item) {
  return item.image_id ? "" : `${item.emoji} `;
}
