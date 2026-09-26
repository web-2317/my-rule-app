import { neon } from "@neondatabase/serverless";
import { rowToLog, rowToReward, rowToTask } from "./rows";

// Neon (Postgres) 版ストア。業務ロジックは lib/service.js 側に置き、ここは SQL だけにする
export function createNeonStore(url) {
  const sql = neon(url);

  return {
    kind: "neon",

    // 接続確認用（接続先の DB 名を返す）
    async ping() {
      const rows = await sql`SELECT current_database() AS db`;
      return rows[0].db;
    },

    // ---- tasks ----
    async listTasks() {
      const rows = await sql`
        SELECT * FROM tasks WHERE NOT archived ORDER BY sort_order ASC, id ASC
      `;
      return rows.map(rowToTask);
    },
    async getTask(id) {
      const rows = await sql`SELECT * FROM tasks WHERE id = ${id}`;
      return rows[0] ? rowToTask(rows[0]) : null;
    },
    async insertTask(t) {
      const rows = await sql`
        INSERT INTO tasks (name, emoji, points, is_penalty, progression, step, daily_limit, memo, sort_order)
        VALUES (${t.name}, ${t.emoji}, ${t.points}, ${t.is_penalty}, ${t.progression}, ${t.step},
                ${t.daily_limit}, ${t.memo},
                COALESCE((SELECT MAX(sort_order) + 1 FROM tasks), 0))
        RETURNING *
      `;
      return rowToTask(rows[0]);
    },
    async updateTask(id, t) {
      const rows = await sql`
        UPDATE tasks
        SET name = ${t.name}, emoji = ${t.emoji}, points = ${t.points}, is_penalty = ${t.is_penalty},
            progression = ${t.progression}, step = ${t.step}, daily_limit = ${t.daily_limit},
            memo = ${t.memo}, updated_at = NOW()
        WHERE id = ${id} AND NOT archived
        RETURNING *
      `;
      return rows[0] ? rowToTask(rows[0]) : null;
    },
    async archiveTask(id) {
      const rows = await sql`
        UPDATE tasks SET archived = TRUE, updated_at = NOW()
        WHERE id = ${id} AND NOT archived RETURNING id
      `;
      return rows.length > 0;
    },

    async reorderTasks(ids) {
      await Promise.all(
        ids.map((id, index) => sql`UPDATE tasks SET sort_order = ${index} WHERE id = ${id}`)
      );
    },

    // ---- rewards ----
    async listRewards() {
      const rows = await sql`
        SELECT * FROM rewards WHERE NOT archived ORDER BY sort_order ASC, id ASC
      `;
      return rows.map(rowToReward);
    },
    async getReward(id) {
      const rows = await sql`SELECT * FROM rewards WHERE id = ${id}`;
      return rows[0] ? rowToReward(rows[0]) : null;
    },
    async insertReward(r) {
      const rows = await sql`
        INSERT INTO rewards (name, emoji, cost, daily_limit, memo, sort_order)
        VALUES (${r.name}, ${r.emoji}, ${r.cost}, ${r.daily_limit}, ${r.memo},
                COALESCE((SELECT MAX(sort_order) + 1 FROM rewards), 0))
        RETURNING *
      `;
      return rowToReward(rows[0]);
    },
    async updateReward(id, r) {
      const rows = await sql`
        UPDATE rewards
        SET name = ${r.name}, emoji = ${r.emoji}, cost = ${r.cost}, daily_limit = ${r.daily_limit},
            memo = ${r.memo}, updated_at = NOW()
        WHERE id = ${id} AND NOT archived
        RETURNING *
      `;
      return rows[0] ? rowToReward(rows[0]) : null;
    },
    async archiveReward(id) {
      const rows = await sql`
        UPDATE rewards SET archived = TRUE, updated_at = NOW()
        WHERE id = ${id} AND NOT archived RETURNING id
      `;
      return rows.length > 0;
    },

    async reorderRewards(ids) {
      await Promise.all(
        ids.map((id, index) => sql`UPDATE rewards SET sort_order = ${index} WHERE id = ${id}`)
      );
    },

    // ---- point_logs ----
    async getBalance() {
      const rows = await sql`SELECT COALESCE(SUM(points), 0)::int AS balance FROM point_logs`;
      return rows[0].balance;
    },
    async getLog(id) {
      const rows = await sql`SELECT *, local_date::text AS day FROM point_logs WHERE id = ${id}`;
      return rows[0] ? rowToLog(rows[0]) : null;
    },
    async listLogsBetween(from, to) {
      const rows = await sql`
        SELECT *, local_date::text AS day FROM point_logs
        WHERE local_date BETWEEN ${from} AND ${to}
        ORDER BY id ASC
      `;
      return rows.map(rowToLog);
    },
    async listLogsPage({ beforeId, limit }) {
      const rows = beforeId
        ? await sql`
            SELECT *, local_date::text AS day FROM point_logs WHERE id < ${beforeId}
            ORDER BY id DESC LIMIT ${limit}
          `
        : await sql`SELECT *, local_date::text AS day FROM point_logs ORDER BY id DESC LIMIT ${limit}`;
      return rows.map(rowToLog);
    },
    async countForDate({ taskId, rewardId }, date) {
      const rows = taskId
        ? await sql`
            SELECT COALESCE(SUM(count), 0)::int AS n FROM point_logs
            WHERE task_id = ${taskId} AND local_date = ${date}
          `
        : await sql`
            SELECT COALESCE(SUM(count), 0)::int AS n FROM point_logs
            WHERE reward_id = ${rewardId} AND local_date = ${date}
          `;
      return rows[0].n;
    },
    async latestTaskLogId(taskId, date) {
      const rows = await sql`
        SELECT MAX(id) AS id FROM point_logs WHERE task_id = ${taskId} AND local_date = ${date}
      `;
      return rows[0].id;
    },
    async taskActiveDates(since) {
      const rows = await sql`
        SELECT DISTINCT task_id, local_date::text FROM point_logs
        WHERE task_id IS NOT NULL AND local_date >= ${since}
      `;
      return rows;
    },
    async insertLog(log) {
      const rows = await sql`
        INSERT INTO point_logs (kind, task_id, reward_id, name, emoji, count, seq_from, points, local_date)
        VALUES (${log.kind}, ${log.task_id}, ${log.reward_id}, ${log.name}, ${log.emoji},
                ${log.count}, ${log.seq_from}, ${log.points}, ${log.local_date})
        RETURNING *, local_date::text AS day
      `;
      return rowToLog(rows[0]);
    },
    // 残高が 0 未満にならない場合だけ記録する（ご褒美の消費・減点）
    async insertLogIfAffordable(log) {
      const rows = await sql`
        INSERT INTO point_logs (kind, task_id, reward_id, name, emoji, count, seq_from, points, local_date)
        SELECT ${log.kind}::varchar, ${log.task_id}::int, ${log.reward_id}::int, ${log.name}::varchar,
               ${log.emoji}::varchar, ${log.count}::int, ${log.seq_from}::int, ${log.points}::int,
               ${log.local_date}::date
        WHERE (SELECT COALESCE(SUM(points), 0) FROM point_logs) + ${log.points}::int >= 0
        RETURNING *, local_date::text AS day
      `;
      return rows[0] ? rowToLog(rows[0]) : null;
    },
    // 取り消し後に残高が 0 未満にならない場合だけ削除する
    async deleteLogIfAffordable(id) {
      const rows = await sql`
        DELETE FROM point_logs
        WHERE id = ${id}
          AND (SELECT COALESCE(SUM(points), 0) FROM point_logs) - points >= 0
        RETURNING id
      `;
      return rows.length > 0;
    },
  };
}
