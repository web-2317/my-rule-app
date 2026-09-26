import { handle, readJson } from "@/lib/api";
import { archiveTask, updateTask } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export const PUT = handle(async (request, { params }) =>
  updateTask(params.id, await readJson(request))
);

export const DELETE = handle((_request, { params }) => archiveTask(params.id));
