import { rowToLog, rowToReward, rowToTask } from "./rows";
import { addDays, todayKey } from "../dates";
import { pointsForRange } from "../points";

// DATABASE_URL 未設定時の開発用ストア。
// 開発サーバーのホットリロードでモジュールが再評価されてもデータが消えないよう globalThis に保持する
// 過去13日分のサンプル履歴（グラフや連続日数の見た目確認用。決まった値になるよう疑似乱数を固定）
function sampleLogs(tasks, rewards) {
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const logs = [];
  const today = todayKey();
  let balance = 0;
  for (let back = 13; back >= 1; back--) {
    const date = addDays(today, -back);
    const push = (log) => {
      balance += log.points;
      logs.push({ ...log, id: logs.length + 1, local_date: date, created_at: `${date}T${String(10 + logs.length % 12).padStart(2, "0")}:00:00+09:00` });
    };
    for (const t of tasks) {
      if (t.is_penalty ? rand() > 0.2 : rand() < 0.25) continue;
      const count = t.daily_limit ? 1 : 1 + Math.floor(rand() * 3);
      const { total } = pointsForRange(t, 1, count);
      const points = t.is_penalty ? -Math.min(total, balance) : total;
      push({ kind: t.is_penalty ? "penalty" : "task", task_id: t.id, reward_id: null, name: t.name, emoji: t.emoji, count, seq_from: 1, points });
    }
    for (const r of rewards) {
      if (rand() < 0.6 || balance < r.cost) continue;
      push({ kind: "reward", task_id: null, reward_id: r.id, name: r.name, emoji: r.emoji, count: 1, seq_from: 1, points: -r.cost });
    }
  }
  return logs;
}

function initialState() {
  const state = {
    tasks: [
      { id: 1, name: "30分勉強する", emoji: "📚", points: 10, is_penalty: false, progression: "arithmetic", step: 5, daily_limit: null, memo: "続けるほどポイントが増える", sort_order: 0, archived: false },
      { id: 2, name: "筋トレ", emoji: "💪", points: 20, is_penalty: false, progression: "none", step: 0, daily_limit: 1, memo: "", sort_order: 1, archived: false },
      { id: 3, name: "早起き（6時前）", emoji: "🌅", points: 15, is_penalty: false, progression: "none", step: 0, daily_limit: 1, memo: "", sort_order: 2, archived: false },
      { id: 4, name: "夜更かし", emoji: "🌙", points: 20, is_penalty: true, progression: "geometric", step: 2, daily_limit: null, memo: "", sort_order: 3, archived: false },
    ],
    rewards: [
      { id: 1, name: "YouTube 30分", emoji: "📺", cost: 30, daily_limit: null, memo: "", sort_order: 0, archived: false },
      { id: 2, name: "コンビニスイーツ", emoji: "🍰", cost: 80, daily_limit: 1, memo: "", sort_order: 1, archived: false },
      { id: 3, name: "ゲーム1時間", emoji: "🎮", cost: 60, daily_limit: null, memo: "", sort_order: 2, archived: false },
    ],
    logs: [],
    images: [],
    nextTaskId: 5,
    nextRewardId: 4,
    nextLogId: 1,
  };
  state.logs = sampleLogs(state.tasks, state.rewards);
  state.nextLogId = state.logs.length + 1;
  return state;
}

const state = (globalThis.__myRuleMemoryState ??= initialState());

const bySort = (a, b) => a.sort_order - b.sort_order || a.id - b.id;
const balanceOf = () => state.logs.reduce((sum, l) => sum + l.points, 0);

function maxSort(list) {
  return list.reduce((m, x) => Math.max(m, x.sort_order), -1) + 1;
}

function reorder(list, ids) {
  ids.forEach((id, index) => {
    const item = list.find((x) => x.id === id);
    if (item) item.sort_order = index;
  });
}

function pushLog(log) {
  const row = { ...log, id: state.nextLogId++, created_at: new Date().toISOString() };
  state.logs.push(row);
  return rowToLog(row);
}

export function createMemoryStore() {
  return {
    kind: "memory",

    async ping() {
      return null;
    },

    // ---- icon_images ----
    async insertImage(data) {
      state.images.push({ id: state.images.length + 1, data });
      return state.images.length;
    },
    async getImage(id) {
      return state.images.find((img) => img.id === id)?.data ?? null;
    },

    // ---- tasks ----
    async listTasks() {
      return state.tasks.filter((t) => !t.archived).sort(bySort).map(rowToTask);
    },
    async getTask(id) {
      const t = state.tasks.find((t) => t.id === id);
      return t ? rowToTask(t) : null;
    },
    async insertTask(data) {
      const t = { ...data, id: state.nextTaskId++, sort_order: maxSort(state.tasks), archived: false };
      state.tasks.push(t);
      return rowToTask(t);
    },
    async updateTask(id, data) {
      const t = state.tasks.find((t) => t.id === id && !t.archived);
      if (!t) return null;
      Object.assign(t, data);
      return rowToTask(t);
    },
    async archiveTask(id) {
      const t = state.tasks.find((t) => t.id === id && !t.archived);
      if (!t) return false;
      t.archived = true;
      return true;
    },
    async reorderTasks(ids) {
      reorder(state.tasks, ids);
    },

    // ---- rewards ----
    async listRewards() {
      return state.rewards.filter((r) => !r.archived).sort(bySort).map(rowToReward);
    },
    async getReward(id) {
      const r = state.rewards.find((r) => r.id === id);
      return r ? rowToReward(r) : null;
    },
    async insertReward(data) {
      const r = { ...data, id: state.nextRewardId++, sort_order: maxSort(state.rewards), archived: false };
      state.rewards.push(r);
      return rowToReward(r);
    },
    async updateReward(id, data) {
      const r = state.rewards.find((r) => r.id === id && !r.archived);
      if (!r) return null;
      Object.assign(r, data);
      return rowToReward(r);
    },
    async archiveReward(id) {
      const r = state.rewards.find((r) => r.id === id && !r.archived);
      if (!r) return false;
      r.archived = true;
      return true;
    },
    async reorderRewards(ids) {
      reorder(state.rewards, ids);
    },

    // ---- point_logs ----
    async getBalance() {
      return balanceOf();
    },
    async getLog(id) {
      const l = state.logs.find((l) => l.id === id);
      return l ? rowToLog(l) : null;
    },
    async listLogsBetween(from, to) {
      return state.logs
        .filter((l) => l.local_date >= from && l.local_date <= to)
        .map(rowToLog);
    },
    async listLogsPage({ beforeId, limit }) {
      return state.logs
        .filter((l) => !beforeId || l.id < beforeId)
        .sort((a, b) => b.id - a.id)
        .slice(0, limit)
        .map(rowToLog);
    },
    async countForDate({ taskId, rewardId }, date) {
      return state.logs
        .filter(
          (l) =>
            l.local_date === date &&
            (taskId ? l.task_id === taskId : l.reward_id === rewardId)
        )
        .reduce((sum, l) => sum + l.count, 0);
    },
    async latestTaskLogId(taskId, date) {
      const ids = state.logs
        .filter((l) => l.task_id === taskId && l.local_date === date)
        .map((l) => l.id);
      return ids.length ? Math.max(...ids) : null;
    },
    async taskActiveDates(since) {
      const seen = new Map();
      for (const l of state.logs) {
        if (l.task_id && l.local_date >= since) {
          seen.set(`${l.task_id}:${l.local_date}`, { task_id: l.task_id, local_date: l.local_date });
        }
      }
      return [...seen.values()];
    },
    async insertLog(log) {
      return pushLog(log);
    },
    async insertLogIfAffordable(log) {
      if (balanceOf() + log.points < 0) return null;
      return pushLog(log);
    },
    async deleteLogIfAffordable(id) {
      const idx = state.logs.findIndex((l) => l.id === id);
      if (idx === -1 || balanceOf() - state.logs[idx].points < 0) return false;
      state.logs.splice(idx, 1);
      return true;
    },
  };
}
