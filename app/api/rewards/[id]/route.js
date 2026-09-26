import { handle, readJson } from "@/lib/api";
import { archiveReward, updateReward } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export const PUT = handle(async (request, { params }) =>
  updateReward(params.id, await readJson(request))
);

export const DELETE = handle((_request, { params }) => archiveReward(params.id));
