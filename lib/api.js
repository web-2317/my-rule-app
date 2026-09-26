import { NextResponse } from "next/server";
import { AppError } from "./service";

// ルートハンドラ共通のエラーハンドリング（AppError は想定内のエラーとしてそのまま返す）
export function handle(fn) {
  return async (request, context) => {
    try {
      const result = await fn(request, context);
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (e) {
      if (e instanceof AppError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      console.error(e);
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }
  };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
