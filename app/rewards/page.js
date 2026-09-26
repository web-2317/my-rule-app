import RewardListPage from "@/components/rewards/RewardListPage";
import { getRewardList } from "@/lib/service";
import { todayKey } from "@/lib/dates";

export default async function RewardsPage() {
  const rewards = await getRewardList(todayKey());
  return <RewardListPage initialRewards={rewards} />;
}
