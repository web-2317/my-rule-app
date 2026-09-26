import { NextResponse } from "next/server";
import { getStore, getStoreKind } from "@/lib/store";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// 接続確認: /api/health
// { store: "neon" | "memory", database: 接続先DB名, ok: true } / エラー時は ok: false と理由
export async function GET() {
  const store = getStoreKind();
  try {
    const database = await getStore().ping();
    return NextResponse.json({ ok: true, store, database });
  } catch (e) {
    return NextResponse.json({ ok: false, store, error: e.message }, { status: 500 });
  }
}
