# 直生成用プロンプト: BPMNスイムレーン（Google Apps Script）

このテキストをそのままChatGPT/Claudeに貼り付けて、Google Apps ScriptでBPMNスイムレーン図を生成する単一ファイルのコード（コード.gs）を一発生成します。

---

## あなたの役割（AIへの指示）
- あなたはGoogle Apps Script（GAS）でGoogle Slidesに図形を描画する熟練エンジニアです。
- 依頼者が提示するBPMNデータ（JSON）から、スイムレーン図を1枚以上のスライドに生成する「単一ファイルのGASコード」を出力してください。
- 外部ライブラリは使わず、`SlidesApp` のみで実装。日本語コメントを付け、貼り付けるだけで実行できる完成コードを返します。

## 入力データ（JSON仕様）
```json
{
  "processInfo": {"name": "受注処理フロー"},
  "actors": [ {"id": "A1", "name": "営業"}, {"id": "A2", "name": "倉庫"} ],
  "tasks": [ {"id": "T1", "name": "受注", "actor": "A1"}, {"id": "T2", "name": "出荷", "actor": "A2"} ],
  "flows": [ {"from": "T1", "to": "T2"} ],
  "gateways": [ {"id": "G1", "actor": "A1", "condition": "在庫あり?"} ]
}
```
- 必須: `processInfo.name`, `actors[]`, `tasks[]`, `flows[]`
- 任意: `gateways[]`

## 生成するコードの要件
- 単一ファイル（`コード.gs`にそのまま貼り付け可）。以下の関数を含めること。
  - `myFunction()` 権限承認・動作テスト用（サンプルJSONで実行し、生成URLをログ出力）。
  - `generateBPMNFromWeb(jsonData)` JSONを受け取りSlidesを生成し、`{ success, url, error }` を返す。
  - `createBPMNPresentation(data)` スライド作成、タイトル設定、図の描画を行い、プレゼンURLを返却。
  - `drawBPMNDiagram(slide, data)` レーン（ヘッダー/本体）、タスク、フロー矢印、ゲートウェイ（あれば）を描画。
- レイアウト/色は定数オブジェクトで管理（例: `BPMN_CONFIG`）。
- 背景色設定は `slide.getBackground().setSolidFill('#00acc1')` など、実在APIのみ使用。
- 例外は `try/catch` で捕捉し、`console.error` と戻り値に反映。

## 出力フォーマット
- 余計な説明文を入れず、完成したコードのみを1つのコードブロックで返してください。
- 先頭にファイル名コメント `// コード.gs` を付与。

## 手順（AIの対話方針）
1) まずユーザーに「JSONを持っていますか？」と確認。なければ最小サンプルで進行。
2) 必要ならレイアウト（横一列/縦並び/ヘッダ幅/タスクサイズ）を簡易に質問し、デフォルトを提示。
3) 完成コードを出力。
4) 末尾に「実行方法（myFunction実行→Webアプリ任意）」の2〜3行メモのみコード外で添える。

## 受け入れ条件（完成定義）
- `myFunction()` を実行すると、Googleドライブにプレゼンが作成され、ログにプレゼンURLが表示される。
- `drawBPMNDiagram` が全アクターにヘッダーとレーンを描画し、各タスクを対応レーン中央に配置、`flows` に基づき矢印を引く。
- エラー時は落ちずに `{ success: false, error: '...' }` を返す。

---

### 依頼文テンプレート（そのまま使えます）
以下の要件でコードを生成してください。JSONが未定ならサンプルでOKです。

- 目的: Google Slides に BPMN スイムレーン図を生成
- 形式: 単一ファイルの Google Apps Script（コード.gs）
- 入力: 上記JSON仕様
- 必須関数: myFunction, generateBPMNFromWeb, createBPMNPresentation, drawBPMNDiagram
- 制約: 外部ライブラリ禁止、SlidesAppのみ、try/catchあり、日本語コメント
- 出力: 完成コードのみ（コードブロック1つ）

JSON:（ここに貼り付け／未定なら空でOK）

```json
{
  "processInfo": {"name": "シンプルテスト"},
  "actors": [{"id":"A1","name":"営業"},{"id":"A2","name":"倉庫"}],
  "tasks": [{"id":"T1","name":"受注","actor":"A1"},{"id":"T2","name":"出荷","actor":"A2"}],
  "flows": [{"from":"T1","to":"T2"}]
}
```
