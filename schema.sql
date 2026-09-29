-- Neon で実行するスキーマ

-- タスク（達成するとポイント獲得。is_penalty = TRUE のものは減点）
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '✅',
  points INTEGER NOT NULL CHECK (points >= 0),          -- 1回目のポイント（基本値）
  is_penalty BOOLEAN NOT NULL DEFAULT FALSE,
  -- 1日の中で回数を重ねたときの変化: none=固定 / arithmetic=等差（+step） / geometric=等比（×step）
  progression VARCHAR(20) NOT NULL DEFAULT 'none'
    CHECK (progression IN ('none', 'arithmetic', 'geometric')),
  step NUMERIC(10, 2) NOT NULL DEFAULT 0,
  daily_limit INTEGER CHECK (daily_limit IS NULL OR daily_limit > 0),
  memo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ご褒美（実行するとポイント消費）
CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '🎁',
  cost INTEGER NOT NULL CHECK (cost > 0),
  daily_limit INTEGER CHECK (daily_limit IS NULL OR daily_limit > 0),
  memo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ポイントの増減履歴（台帳）。所持ポイント = SUM(points)
-- name / emoji / points は記録時点のスナップショットなので、後でタスクを編集しても履歴は変わらない
CREATE TABLE IF NOT EXISTS point_logs (
  id SERIAL PRIMARY KEY,
  kind VARCHAR(10) NOT NULL CHECK (kind IN ('task', 'penalty', 'reward')),
  task_id INTEGER REFERENCES tasks (id) ON DELETE SET NULL,
  reward_id INTEGER REFERENCES rewards (id) ON DELETE SET NULL,
  name VARCHAR(50) NOT NULL,
  emoji VARCHAR(16) NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0),              -- まとめて達成した回数
  seq_from INTEGER NOT NULL DEFAULT 1,                   -- その日の何回目から始まったか
  points INTEGER NOT NULL,                               -- 符号付き（獲得 +, 消費・減点 -）
  local_date DATE NOT NULL,                              -- JST・深夜4時区切りの日付
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_logs_local_date ON point_logs (local_date);
CREATE INDEX IF NOT EXISTS idx_point_logs_task_date ON point_logs (task_id, local_date);
CREATE INDEX IF NOT EXISTS idx_point_logs_reward_date ON point_logs (reward_id, local_date);

-- ---- アイコン画像（2026-09 追加）----
-- アップロード画像はブラウザで 128px の正方形に縮小した data URL で保存し、/api/icons/:id で配信する
CREATE TABLE IF NOT EXISTS icon_images (
  id SERIAL PRIMARY KEY,
  data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS image_id INTEGER REFERENCES icon_images (id) ON DELETE SET NULL;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS image_id INTEGER REFERENCES icon_images (id) ON DELETE SET NULL;
-- 履歴にも記録時点のアイコンを残す
ALTER TABLE point_logs ADD COLUMN IF NOT EXISTS image_id INTEGER REFERENCES icon_images (id) ON DELETE SET NULL;
