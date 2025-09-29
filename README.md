# 🎯 ひまじん式BPMN自動生成システム

**JSONを貼り付けてボタンを押すだけで業務フロー図が完成！**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ⚠️ このプロジェクトは「**まじん式プロンプト**」にインスパイアされた**非公式派生版**です（本家から許諾は得ていません）

---

## 🚀 5分でスタート

### 1. GASプロジェクト作成
```
Google Drive → 新規 → その他 → Google Apps Script
```

### 2. ファイルをコピー（2つだけ！）

| ファイル | GASでの操作 |
|---------|------------|
| [`bpmn-swimlane.gs`](./bpmn-swimlane.gs) | コード.gsに貼り付け |
| [`json-input.html`](./json-input.html) | ＋ → HTML → 貼り付け |

**補助ファイル**（必要に応じて）：
- [`web-app.gs`](./web-app.gs) - Web画面表示用

### 3. Webアプリでデプロイ
```
デプロイ → 新しいデプロイ → ウェブアプリ → 全員 → デプロイ
```

### 4. URLを開く
→ **JSONを貼り付けてボタンを押すだけ！**

---

## 📝 使い方（3パターン）

### 方法1: JSONコピペ（最も簡単！）
```json
{
  "processInfo": {"name": "受注フロー"},
  "actors": [
    {"id": "A1", "name": "営業"},
    {"id": "A2", "name": "倉庫"}
  ],
  "tasks": [
    {"id": "T1", "name": "受注", "actor": "A1"},
    {"id": "T2", "name": "出荷", "actor": "A2"}
  ],
  "flows": [{"from": "T1", "to": "T2"}]
}
```
↑これをコピペして生成ボタンを押すだけ

### 方法2: AI対話（ChatGPT/Claude）
[`BPMN_DIALOGUE_PROMPT.md`](./BPMN_DIALOGUE_PROMPT.md)をAIにコピペ → 対話でJSON生成

### 方法3: Googleフォーム
[`bpmn-data-collection.gs`](./bpmn-data-collection.gs)追加でフォーム入力可能

---

## 🎨 生成される図

- **横型スイムレーン**：部門を横に配置（経営層向け）
- **縦型スイムレーン**：時系列を縦に配置（実務者向け）
- **BPMN要素**：タスク、ゲートウェイ、フロー矢印

---

## 🆘 エラーが出たら

| エラー | 解決方法 |
|--------|---------|
| 権限エラー | 詳細 → 安全ではないページに移動 → 許可 |
| JSON形式エラー | [JSONLint](https://jsonlint.com/)で検証 |
| スライド生成エラー | bpmn-swimlane.gsが正しくコピーされているか確認 |

---

## 📊 サンプルJSON

<details>
<summary>クリックして展開</summary>

### 最小構成
```json
{
  "processInfo": {"name": "シンプルフロー"},
  "actors": [
    {"id": "A1", "name": "営業"},
    {"id": "A2", "name": "倉庫"}
  ],
  "tasks": [
    {"id": "T1", "name": "受注", "actor": "A1"},
    {"id": "T2", "name": "出荷", "actor": "A2"}
  ],
  "flows": [{"from": "T1", "to": "T2"}]
}
```

### ゲートウェイ付き
```json
{
  "processInfo": {"name": "在庫確認フロー"},
  "actors": [
    {"id": "A1", "name": "営業"},
    {"id": "A2", "name": "倉庫"},
    {"id": "A3", "name": "購買"}
  ],
  "tasks": [
    {"id": "T1", "name": "注文受付", "actor": "A1"},
    {"id": "T2", "name": "在庫確認", "actor": "A2"},
    {"id": "T3", "name": "出荷", "actor": "A2"},
    {"id": "T4", "name": "発注", "actor": "A3"}
  ],
  "gateways": [
    {"id": "G1", "name": "在庫有無", "type": "exclusive"}
  ],
  "flows": [
    {"from": "T1", "to": "T2"},
    {"from": "T2", "to": "G1"},
    {"from": "G1", "to": "T3", "condition": "在庫あり"},
    {"from": "G1", "to": "T4", "condition": "在庫なし"}
  ]
}
```
</details>

---

## 🙏 謝辞

**まじん式プロンプト**の「JSONをコピペするだけ」という革新的なアプローチに感謝します。

---

⭐ **役立ったらStarをお願いします！**

*Created by ひまじん / Inspired by まじん式プロンプト*