import { unstable_cache, revalidateTag } from "next/cache";
import { getStore } from "./store";
import { addDays, todayKey } from "./dates";
import { MAX_COUNT_PER_ACTION, pointsForNth, pointsForRange } from "./points";

// タスク・ご褒美・履歴は互いに影響し合う（達成で残高も統計も変わる）ため、キャッシュタグは1つにまとめる
const DATA_TAG = "rule-data";

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function invalidate() {
  revalidateTag(DATA_TAG);
}

// 引数（today など）もキャッシュキーに含まれるので、日付が変われば自動的に別キャッシュになる。
// キャッシュは .next/cache に残るため、Neon / メモリを切り替えても混ざらないよう保存先もキーに含める
const STORE_KIND = process.env.DATABASE_URL ? "neon" : "memory";

function cached(fn, key) {
  return unstable_cache(fn, [key, STORE_KIND], { tags: [DATA_TAG] });
}

// ---- 入力チェック ----

function toId(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw new AppError("見つかりません", 404);
  return n;
}

function intInRange(value, min, max, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new AppError(`${label}は ${min}〜${max} の整数で入力してください`);
  }
  return n;
}

function optionalLimit(value) {
  if (value === null || value === undefined || value === "") return null;
  return intInRange(value, 1, 999, "1日の上限回数");
}

function commonFields(data, defaultEmoji) {
  const name = String(data.name ?? "").trim();
  if (!name) throw new AppError("名前は必須です");
  if (name.length > 50) throw new AppError("名前は50文字以内で入力してください");
  const memo = String(data.memo ?? "").trim();
  if (memo.length > 200) throw new AppError("メモは200文字以内で入力してください");
  const emoji = String(data.emoji ?? "").trim() || defaultEmoji;
  if (emoji.length > 16) throw new AppError("アイコンが長すぎます");
  return { name, memo, emoji, daily_limit: optionalLimit(data.daily_limit) };
}

function validateTask(data) {
  const progression = data.progression ?? "none";
  let step = 0;
  if (progression === "arithmetic") {
    step = intInRange(data.step, -9999, 9999, "加算値");
  } else if (progression === "geometric") {
    step = Number(data.step);
    if (!(step > 0 && step <= 10) || Math.round(step * 100) !== step * 100) {
      throw new AppError("倍率は 0.01〜10 の範囲（小数第2位まで）で入力してください");
    }
  } else if (progression !== "none") {
    throw new AppError("加算方式が不正です");
  }
  return {
    ...commonFields(data, "✅"),
    points: intInRange(data.points, 0, 9999, "ポイント"),
    is_penalty: Boolean(data.is_penalty),
    progression,
    step,
  };
}

function validateReward(data) {
  return {
    ...commonFields(data, "🎁"),
    cost: intInRange(data.cost, 1, 999999, "消費ポイント"),
  };
}

function validateCount(count) {
  return intInRange(count ?? 1, 1, MAX_COUNT_PER_ACTION, "回数");
}

// ---- 読み取り ----

function sumPoints(logs, predicate) {
  return logs.filter(predicate).reduce((sum, l) => sum + l.points, 0);
}

function summarizeLogs(logs) {
  return {
    earned: sumPoints(logs, (l) => l.kind === "task"),
    spent: -sumPoints(logs, (l) => l.kind === "reward"),
    penalty: -sumPoints(logs, (l) => l.kind === "penalty"),
  };
}

function countBy(logs, key) {
  const map = new Map();
  for (const l of logs) {
    if (l[key]) map.set(l[key], (map.get(l[key]) || 0) + l.count);
  }
  return map;
}

// 今日または昨日から遡って、連続で達成している日数
function streakOf(dates, today) {
  let day = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export const getSummary = cached(async (today) => {
  const store = getStore();
  const [balance, logs] = await Promise.all([
    store.getBalance(),
    store.listLogsBetween(today, today),
  ]);
  return { balance, today: summarizeLogs(logs) };
}, "summary");

export const getTaskList = cached(async (today) => {
  const store = getStore();
  const [tasks, todayLogs, activeDates] = await Promise.all([
    store.listTasks(),
    store.listLogsBetween(today, today),
    store.taskActiveDates(addDays(today, -366)),
  ]);
  const counts = countBy(todayLogs, "task_id");
  const datesByTask = new Map();
  for (const { task_id, local_date } of activeDates) {
    if (!datesByTask.has(task_id)) datesByTask.set(task_id, new Set());
    datesByTask.get(task_id).add(local_date);
  }
  return tasks.map((t) => {
    const todayCount = counts.get(t.id) || 0;
    return {
      ...t,
      today_count: todayCount,
      next_points: pointsForNth(t, todayCount + 1),
      remaining: t.daily_limit ? Math.max(0, t.daily_limit - todayCount) : null,
      streak: t.is_penalty ? 0 : streakOf(datesByTask.get(t.id) || new Set(), today),
    };
  });
}, "tasks");

export const getRewardList = cached(async (today) => {
  const store = getStore();
  const [rewards, todayLogs] = await Promise.all([
    store.listRewards(),
    store.listLogsBetween(today, today),
  ]);
  const counts = countBy(todayLogs, "reward_id");
  return rewards.map((r) => {
    const todayCount = counts.get(r.id) || 0;
    return {
      ...r,
      today_count: todayCount,
      remaining: r.daily_limit ? Math.max(0, r.daily_limit - todayCount) : null,
    };
  });
}, "rewards");

function rankingOf(logs, key) {
  const map = new Map();
  for (const l of logs) {
    if (!l[key]) continue;
    const item = map.get(l[key]) || { id: l[key], name: l.name, emoji: l.emoji, count: 0, points: 0 };
    item.count += l.count;
    item.points += Math.abs(l.points);
    map.set(l[key], item);
  }
  return [...map.values()].sort((a, b) => b.points - a.points);
}

export const getStats = cached(async (today) => {
  const store = getStore();
  const from = addDays(today, -29);
  const [balance, logs] = await Promise.all([
    store.getBalance(),
    store.listLogsBetween(from, today),
  ]);

  const daily = [];
  for (let i = 13; i >= 0; i--) {
    const date = addDays(today, -i);
    daily.push({ date, ...summarizeLogs(logs.filter((l) => l.local_date === date)) });
  }
  const weekFrom = addDays(today, -6);
  const taskLogs = logs.filter((l) => l.kind === "task");

  return {
    balance,
    today: summarizeLogs(logs.filter((l) => l.local_date === today)),
    week: summarizeLogs(logs.filter((l) => l.local_date >= weekFrom)),
    month: summarizeLogs(logs),
    // 過去30日で何かしらタスクを達成した日数
    activeDays: new Set(taskLogs.map((l) => l.local_date)).size,
    daily,
    taskRanking: rankingOf(taskLogs, "task_id"),
    penaltyRanking: rankingOf(logs.filter((l) => l.kind === "penalty"), "task_id"),
    rewardRanking: rankingOf(logs.filter((l) => l.kind === "reward"), "reward_id"),
  };
}, "stats");

export async function getHistory({ before, limit = 30 } = {}) {
  const size = Math.min(100, Math.max(1, Number(limit) || 30));
  const beforeId = before ? toId(before) : null;
  const logs = await getStore().listLogsPage({ beforeId, limit: size });
  return {
    logs,
    nextCursor: logs.length === size ? logs[logs.length - 1].id : null,
  };
}

// ---- タスク・ご褒美の CRUD ----

export async function createTask(data) {
  const task = await getStore().insertTask(validateTask(data));
  invalidate();
  return task;
}

export async function updateTask(id, data) {
  const task = await getStore().updateTask(toId(id), validateTask(data));
  if (!task) throw new AppError("見つかりません", 404);
  invalidate();
  return task;
}

// 履歴・統計を残すため、削除はアーカイブ（非表示）にする
export async function archiveTask(id) {
  const ok = await getStore().archiveTask(toId(id));
  if (!ok) throw new AppError("見つかりません", 404);
  invalidate();
}

export async function createReward(data) {
  const reward = await getStore().insertReward(validateReward(data));
  invalidate();
  return reward;
}

export async function updateReward(id, data) {
  const reward = await getStore().updateReward(toId(id), validateReward(data));
  if (!reward) throw new AppError("見つかりません", 404);
  invalidate();
  return reward;
}

export async function archiveReward(id) {
  const ok = await getStore().archiveReward(toId(id));
  if (!ok) throw new AppError("見つかりません", 404);
  invalidate();
}

function validateIds(ids) {
  if (!Array.isArray(ids) || ids.length > 500) throw new AppError("並び順が不正です");
  return ids.map(toId);
}

// ids の並び順どおりに sort_order (0, 1, 2, ...) を振り直す
export async function reorderTasks(ids) {
  await getStore().reorderTasks(validateIds(ids));
  invalidate();
}

export async function reorderRewards(ids) {
  await getStore().reorderRewards(validateIds(ids));
  invalidate();
}

// ---- ポイントの増減 ----

function limitError(dailyLimit, done) {
  const left = Math.max(0, dailyLimit - done);
  return new AppError(
    left === 0 ? "今日はもう上限回数に達しています" : `今日はあと${left}回までです`
  );
}

// タスク達成。ポイントはサーバー側で「今日の何回目か」から計算する
export async function completeTask(id, rawCount) {
  const store = getStore();
  const count = validateCount(rawCount);
  const task = await store.getTask(toId(id));
  if (!task || task.archived) throw new AppError("見つかりません", 404);

  const today = todayKey();
  const done = await store.countForDate({ taskId: task.id }, today);
  if (task.daily_limit && done + count > task.daily_limit) {
    throw limitError(task.daily_limit, done);
  }

  const { total } = pointsForRange(task, done + 1, count);
  const base = {
    task_id: task.id,
    reward_id: null,
    name: task.name,
    emoji: task.emoji,
    count,
    seq_from: done + 1,
    local_date: today,
  };

  let log;
  if (task.is_penalty) {
    // 残高はマイナスにしない。足りない分は 0pt で止める（実際に引いた分だけ記録）
    const balance = await store.getBalance();
    const deducted = Math.min(total, balance);
    log = await store.insertLogIfAffordable({ ...base, kind: "penalty", points: -deducted });
    if (!log) throw new AppError("もう一度お試しください", 409);
    log.requested = total;
  } else {
    log = await store.insertLog({ ...base, kind: "task", points: total });
  }

  invalidate();
  return { log, balance: await store.getBalance() };
}

// ご褒美の実行。残高が足りなければ実行できない
export async function redeemReward(id, rawCount) {
  const store = getStore();
  const count = validateCount(rawCount);
  const reward = await store.getReward(toId(id));
  if (!reward || reward.archived) throw new AppError("見つかりません", 404);

  const today = todayKey();
  const done = await store.countForDate({ rewardId: reward.id }, today);
  if (reward.daily_limit && done + count > reward.daily_limit) {
    throw limitError(reward.daily_limit, done);
  }

  const cost = reward.cost * count;
  const log = await store.insertLogIfAffordable({
    kind: "reward",
    task_id: null,
    reward_id: reward.id,
    name: reward.name,
    emoji: reward.emoji,
    count,
    seq_from: done + 1,
    points: -cost,
    local_date: today,
  });
  if (!log) {
    const balance = await store.getBalance();
    throw new AppError(`ポイントが足りません（あと${cost - balance}pt）`);
  }

  invalidate();
  return { log, balance: await store.getBalance() };
}

// 取り消し（履歴の削除）
export async function undoLog(id) {
  const store = getStore();
  const log = await store.getLog(toId(id));
  if (!log) throw new AppError("見つかりません", 404);

  // 等差・等比の回数計算がずれないよう、同じ日の同じタスクは新しい記録から順に取り消す
  if (log.task_id) {
    const latestId = await store.latestTaskLogId(log.task_id, log.local_date);
    if (latestId !== log.id) {
      throw new AppError("同じタスクの後の記録から順に取り消してください");
    }
  }

  const ok = await store.deleteLogIfAffordable(log.id);
  if (!ok) {
    throw new AppError("取り消すと残高がマイナスになるため取り消せません");
  }

  invalidate();
  return { balance: await store.getBalance() };
}
