import { NextResponse } from "next/server";

// 任意の Basic 認証。BASIC_AUTH_USER / BASIC_AUTH_PASSWORD の両方が設定されているときだけ有効になる
// （マイページ・ログイン機能を実装するまでの簡易的な保護）
export function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !password) return NextResponse.next();

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [u, ...rest] = atob(encoded).split(":");
    if (u === user && rest.join(":") === password) return NextResponse.next();
  }

  return new NextResponse("認証が必要です", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="My Rule", charset="UTF-8"' },
  });
}

export const config = {
  // PWA のアイコン・manifest は認証なしで取得できるようにする
  matcher: ["/((?!_next/static|_next/image|icons/|manifest.json|icon.svg).*)"],
};
