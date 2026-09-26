import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { createIcon } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// POST { data: "data:image/webp;base64,..." } → { id }
export const POST = handle(async (request) => {
  const { data } = await readJson(request);
  return NextResponse.json(await createIcon(data), { status: 201 });
});
