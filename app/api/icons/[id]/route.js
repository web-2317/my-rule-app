import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { getIcon } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// 画像は作成後に変更しない（差し替えは新しい id になる）ので、ブラウザに長期間キャッシュさせる
export const GET = handle(async (_request, { params }) => {
  const icon = await getIcon(params.id);
  if (!icon) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  return new Response(icon.bytes, {
    headers: {
      "Content-Type": icon.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
});
