import { handle } from "@/lib/api";
import { undoLog } from "@/lib/service";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// 取り消し
export const DELETE = handle((_request, { params }) => undoLog(params.id));
