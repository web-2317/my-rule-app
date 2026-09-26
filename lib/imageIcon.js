// 画像ファイルを正方形（中央を切り抜き）に縮小して data URL にする。
// アイコン表示は最大 64px 程度なので、Retina でもきれいに見える 128px で保存する
export async function fileToIconDataUrl(file, size = 128) {
  if (!file.type.startsWith("image/")) {
    throw new Error("画像ファイルを選んでください");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("この画像は読み込めませんでした"));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

    // WebP に対応していないブラウザ（古い Safari）は PNG が返るので JPEG にする
    const webp = canvas.toDataURL("image/webp", 0.85);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
