
# Copilot / AI エージェント向け指示 (リポジトリ用)

目的
- この最小限の静的サイトで、AI コーディングエージェントがすぐに作業を始められるようにする。

全体像
- 静的でクライアント側レンダリングのサイトです。主要ページは `index.html`、`blog.html`、`photos.html`、`stamps.html`。
- コンテンツは `content/{blog,photos,stamps}` にプレーンな Markdown ファイルで置かれ、画像などのアセットは `assets/` に置かれます。
- `js/main.js` が軽量なクライアント側レンダラを持ち、表示する Markdown を定義するハードコードされた `CONTENT_INDEX` を参照します。

重要なワークフロー
- ビルドステップはありません。静的ファイルを編集して push すればデプロイできます（例: GitHub Pages）。
- 新しい投稿/アイテムを追加する手順：
  1) 対応するフォルダに Markdown ファイルを追加（例：`content/blog/`）
  2) `js/main.js` の `CONTENT_INDEX` にエントリを追加（`file`, `title`, `date`, `excerpt`）
  3) push

プロジェクト固有の慣習
- Markdown はフロントマター無しのプレーンなブロックで管理します。Markdown 内の画像は相対パス（例：`../../assets/photos/photo-001.jpg`）で記述します。
- `js/main.js` の Markdown パーサは最小実装です。サポートする構文は見出し（#, ##, ###）、コードブロック（``` ```）、インラインコード（`code`）、画像 `![alt](url)`、リンクのみです。完全な CommonMark を期待しないでください。
- 一覧表示は `js/main.js` の `CONTENT_INDEX` によって制御されます。ファイルを追加・リネームする場合は必ず `CONTENT_INDEX` を更新してください。
- 深いリンクはハッシュ（`#filename.md`）を使って記事を直接開きます。`CONTENT_INDEX` の `file` 値は Markdown ファイル名と一致させてください。

参照すべき主要ファイル
- `index.html` — ランディングページ（サイト文言やヒーロー）
- `blog.html`, `photos.html`, `stamps.html` — 各セクションページ。`window.ZEN.renderSection(...)` を呼び出して動作します。
- `js/main.js` — レンダラ、`CONTENT_INDEX`、`loadMd`、`mdToHtml`（パーサを変更する場合はここを編集）
- `content/*/*.md` — 実際のコンテンツ
- `assets/*` — コンテンツで参照する画像等
- `css/style.css` — スタイルとレイアウト

具体例
- `js/main.js` の `CONTENT_INDEX` 例:

  { file: "2025-12-29.md", title: "余白の練習", date: "2025-12-29", excerpt: "短い文章で、静けさを残す。" }

- Markdown 例（`content/blog/2025-12-29.md`）:

  # タイトル

  段落テキスト。

  ![photo](../../assets/photos/photo-001.jpg)

注意点 / ハマりやすいところ
- `content/` にファイルを追加しただけでは一覧に出ません — 必ず `CONTENT_INDEX` を更新してください。
- 内蔵の Markdown パーサは最小実装です。機能を増やしたい場合は `mdToHtml` を拡張するか、`marked.js` 等のライブラリを導入して `loadMd` / レンダーのロジックを調整してください。

コード編集時の方針
- 一覧表示やパースの振る舞いを変える場合は `js/main.js` を直接編集し、既存の UI 契約（`listEl` / `articleEl` / `metaEl`）を維持してください。
- 依存関係やビルドパイプラインを追加するなら、その手順をこのファイルに追記し、簡潔な `README.md` を追加してください。

追加が必要なとき
- 新しい投稿の追加方法や Markdown パーサ差し替えの具体的パッチが必要なら、`js/main.js` の修正パッチとサンプル `.md` を作成します。

— End
