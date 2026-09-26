// DB の行 → アプリで扱うオブジェクト（Neon / メモリ共通）

export function rowToTask(row) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    points: row.points,
    is_penalty: row.is_penalty,
    progression: row.progression,
    // NUMERIC は文字列で返ってくるため数値に直す
    step: Number(row.step),
    daily_limit: row.daily_limit ?? null,
    memo: row.memo || "",
    sort_order: row.sort_order,
    archived: row.archived,
  };
}

export function rowToReward(row) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    cost: row.cost,
    daily_limit: row.daily_limit ?? null,
    memo: row.memo || "",
    sort_order: row.sort_order,
    archived: row.archived,
  };
}

export function rowToLog(row) {
  return {
    id: row.id,
    kind: row.kind,
    task_id: row.task_id ?? null,
    reward_id: row.reward_id ?? null,
    name: row.name,
    emoji: row.emoji,
    count: row.count,
    seq_from: row.seq_from,
    points: row.points,
    // Neon では local_date::text を day として受け取る（DATE 型の Date 変換によるずれを避ける）
    local_date: row.day ?? row.local_date,
    created_at:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}
