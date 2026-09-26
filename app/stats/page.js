import StatsPageClient from "@/components/stats/StatsPageClient";
import { getHistory, getStats } from "@/lib/service";
import { todayKey } from "@/lib/dates";

export default async function StatsPage() {
  const [stats, history] = await Promise.all([getStats(todayKey()), getHistory()]);
  return <StatsPageClient initialStats={stats} initialHistory={history} />;
}
