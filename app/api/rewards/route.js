import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/api";
import { createReward, getRewardList } from "@/lib/service";
import { todayKey } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export const GET = handle(() => getRewardList(todayKey()));

export const POST = handle(async (request) => {
  const reward = await createReward(await readJson(request));
  return NextResponse.json(reward, { status: 201 });
});
