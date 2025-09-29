# directPrompt 利用ガイド

本ディレクトリは、プロンプトから直接 Google Apps Script（GAS）コードを生成し、Google Slides に BPMN スイムレーン図を描画するためのテンプレート集です。ファイル名は `_codex` サフィックスで統一しています。

## ファイル一覧（用途）
- `GEM_BPMN_SWIMLANE_GAS_codex.md` — Gemini の Gem 用「システム指示」。会話から単一ファイルのGASコードを出力する設定。
- `BPMN_SWIMLANE_DIRECT_PROMPT_codex.md` — ChatGPT/Claude 等に貼り付ける「直接生成」プロンプト。

## 使い方（Gemini: Gem を作る）
1. Google AI Studio で Gem を新規作成。
2. 「システム指示」に `GEM_BPMN_SWIMLANE_GAS_codex.md` の本文を貼り付け。
3. 必要なら「クイックプロンプト」を追加（例: JSONを貼って生成依頼）。
4. 会話で JSON を渡す → 完成コード（1ブロック）が返る。

### 使い方の例（Gem）
- ユーザー入力例:
  - 「この JSON から BPMN スイムレーンの GAS を生成して」
  - 続けて下記 JSON を貼り付け
```json
{
  "processInfo": {"name": "受注処理フロー"},
  "actors": [
    {"id": "A1", "name": "営業"},
    {"id": "A2", "name": "倉庫"}
  ],
  "tasks": [
    {"id": "T1", "name": "受注確認", "actor": "A1"},
    {"id": "T2", "name": "商品出荷", "actor": "A2"}
  ],
  "flows": [
    {"from": "T1", "to": "T2"}
  ]
}
```
- 期待される応答: 単一ファイルの完成コード（`// コード.gs` で始まる 1 コードブロック）。
- 実行: GAS の「コード.gs」に貼り付け → `myFunction` を実行して権限承認 → スライドURLがログに出力。

## 使い方（ChatGPT/Claude: 直接生成）
1. `BPMN_SWIMLANE_DIRECT_PROMPT_codex.md` を開き、本文をそのまま送信。
2. 指示に従い JSON を提示（サンプル可）。
3. 返ってきたコードを GAS の「コード.gs」へ貼り付け。
4. エディタで `myFunction` を実行して権限承認・動作確認。
5. 必要に応じて Web アプリとしてデプロイ（HTML を使う場合は `index` という名前で作成）。

### 使い方の例（直接生成）
1) 最初の投稿:
```
以下のプロンプトに従って、単一ファイルのGASコードを生成してください。
```
→ `BPMN_SWIMLANE_DIRECT_PROMPT_codex.md` の本文を貼り付け。

2) 続けて JSON を提示（例）:
```json
{
  "processInfo": {"name": "シンプルテスト"},
  "actors": [{"id":"A1","name":"営業"},{"id":"A2","name":"倉庫"}],
  "tasks": [{"id":"T1","name":"受注","actor":"A1"},{"id":"T2","name":"出荷","actor":"A2"}],
  "flows": [{"from":"T1","to":"T2"}]
}
```
3) 返却コードを GAS に貼り付け → `myFunction` 実行 → スライドURLを確認。

## 実装上の注意
- 背景色は `slide.getBackground().setSolidFill('#00acc1')` を使用（存在しないAPIを呼ばない）。
- HTML は GAS 内でファイル名を `index` にする（`doGet()` が参照）。
- `google.script.run` はデプロイ後のWebアプリ環境で有効（ローカルHTMLでは不可）。

## 命名規則
- 本ディレクトリの新規プロンプト/Readme は末尾に `_codex` を付与して作成してください。
