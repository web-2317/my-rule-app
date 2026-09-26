# My Rule

タスクを達成してポイントを貯め、ご褒美に使う。自分ルールで規律を保つためのアプリ。

- **タスク**：達成するとポイント獲得。1日の中で回数を重ねるごとに「等差（+n ずつ）」「等比（×n ずつ）」でポイントを変えられる。複数回まとめて記録可。
- **ペナルティ（任意）**：やってしまったら記録してポイントを減らす。
- **ご褒美**：ポイントを消費して実行。残高が足りないと実行できない（残高はマイナスにならない）。
- **データ**：期間別の集計、14日間の推移、ランキング、履歴（取り消し可）。

Next.js 14 (App Router) / Tailwind CSS / Neon (Postgres)

## セットアップ

```bash
npm install
cp .env.example .env.local   # DATABASE_URL を設定
npm run dev                  # http://localhost:3000
```

`DATABASE_URL` を設定しない場合は、サンプルデータ入りのメモリストアで動く（サーバー再起動で消える）。
DB につながず試したいときは `DATABASE_URL= npm run dev`。

### DB 接続の確認

`/api/health` を開くと、保存先と接続状態がわかる。

- `{"ok":true,"store":"neon","database":"my-rule"}` … Neon に接続できている
- `"store":"memory"` … `DATABASE_URL` が読み込まれていない（開発時はサンプルデータで動き、本番ではエラーになる）
- `{"ok":false,"store":"neon","error":...}` … URL はあるが接続に失敗（URL の誤り・DB 名違いなど）

開発時（`npm run dev`）に DB 未接続のときは、画面上部に黄色の「DB 未接続」バーが出る。
本番ビルドでは `DATABASE_URL` がないとエラーになる（黙ってメモリ保存にならないように）。
本番ビルドをあえてメモリで動かすときだけ `ALLOW_MEMORY_STORE=1` を付ける。

### データベース（Neon）

Neon の SQL Editor で対象 DB を選び、`schema.sql` を実行する（何度実行しても安全）。

## デプロイ（Vercel）

1. GitHub にリポジトリを作って push する
2. Vercel で **Add New → Project** からリポジトリを Import（Framework は Next.js が自動選択される）
3. **Environment Variables** に以下を設定して Deploy
   - `DATABASE_URL`（必須）
   - `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD`（任意。両方設定すると Basic 認証がかかる）
4. デプロイ後に `https://<あなたのURL>/api/health` を開き、`"store":"neon"` と `"ok":true` になっていることを確認する。
   環境変数を後から追加・変更した場合は **Deployments → 最新の … → Redeploy** しないと反映されない
5. **Settings → Functions → Function Region** を Neon と同じ Singapore (`sin1`) にする
   （コード側でも `preferredRegion = "sin1"` を指定済み）

現状ログイン機能はないため、URL を知っていれば誰でも操作できる。公開する場合は Basic 認証の設定を推奨。

## 構成

```
app/
  page.js / rewards / stats / mypage   各画面（サーバーで初期データを取得してクライアントに渡す）
  api/                                 ルートハンドラ（lib/service.js を呼ぶだけ）
components/
  layout/   AppChrome（ヘッダー・ナビ・追加シート）
  tasks/ rewards/ stats/   各画面の部品
  ui/       Modal・Toast・Stepper などの共通部品
lib/
  service.js   業務ルール（計算・上限・残高チェック・取り消し）
  points.js    ポイント計算（サーバーとフォームのプレビューで共用）
  store/       保存先（neon.js / memory.js）。SQL はここだけ
middleware.js  任意の Basic 認証
schema.sql
```

## 仕様メモ

- **所持ポイント = `point_logs` の合計**。記録には記録時点の名前・ポイントを保存するため、後でタスクを編集しても履歴は変わらない。
- **「今日」は日本時間**で判定。日付が変わると回数・等差/等比はリセットされる。
- n 回目のポイント：固定 `base` / 等差 `base + (n-1)×d` / 等比 `round(base × r^(n-1))`。1回あたり 0〜9999pt に丸める。
- ペナルティで残高を超える場合は 0pt で止め、実際に引いた分だけ記録する。
- 取り消しは、残高がマイナスになる場合はできない。同じ日の同じタスクは新しい記録から順に取り消す（回数計算がずれないように）。
- タスク・ご褒美の削除はアーカイブ（非表示）で、履歴と統計は残る。
- 読み取りはキャッシュせず毎回 DB から取得する（`unstable_cache` は破棄直後に古い値を返し、Vercel では残高が巻き戻って見えたため）。
