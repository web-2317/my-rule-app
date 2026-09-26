import { handle } from "@/lib/api";
import { getSummary } from "@/lib/service";
import { todayKey } from "@/lib/dates";
import { getStoreKind } from "@/lib/store";

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

// store は「DB 未接続」表示の判定に使う
export const GET = handle(async () => ({ ...(await getSummary(todayKey())), store: getStoreKind() }));
