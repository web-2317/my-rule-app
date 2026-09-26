import { handle } from "@/lib/api";
import { getHistory } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// GET /api/logs?before=<id>&limit=30 （新しい順・カーソルページング）
export const GET = handle((request) => {
  const { searchParams } = new URL(request.url);
  return getHistory({
    before: searchParams.get("before"),
    limit: searchParams.get("limit"),
  });
});
