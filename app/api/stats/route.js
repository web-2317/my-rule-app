import { handle } from "@/lib/api";
import { getStats } from "@/lib/service";
import { todayKey } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export const GET = handle(() => getStats(todayKey()));
