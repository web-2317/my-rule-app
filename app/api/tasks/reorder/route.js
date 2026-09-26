import { handle, readJson } from "@/lib/api";
import { reorderTasks } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// PUT { ids: [3, 1, 2] }
export const PUT = handle(async (request) => {
  const { ids } = await readJson(request);
  return reorderTasks(ids);
});
