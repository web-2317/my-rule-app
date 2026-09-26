import { handle, readJson } from "@/lib/api";
import { redeemReward } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export const POST = handle(async (request, { params }) => {
  const { count } = await readJson(request);
  return redeemReward(params.id, count);
});
