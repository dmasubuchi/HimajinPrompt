# 🎯 ひまじん式BPMN自動生成システム

**JSONを貼り付けてボタンを押すだけで業務フロー図が完成！**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ⚠️ このプロジェクトは「**まじん式プロンプト**」にインスパイアされた**非公式派生版**です

---

## 🎯 2つのバージョンから選択

### ⚡ LITE版（推奨）- 高速・シンプル
- **特徴**: 2ファイル完結、3分セットアップ、エラー修正済み
- **用途**: 素早いBPMN作成、シンプルなフロー
- **フォルダ**: [`/lite/`](./lite/)

### 📊 標準版 - 高機能・カスタマイズ可能
- **特徴**: 複雑なBPMN対応、詳細設定可能
- **用途**: 複雑な業務フロー、カスタマイズが必要
- **フォルダ**: [`/standard/`](./standard/)

---

## 🚀 LITE版 クイックセットアップ

### ステップ1: [`/lite/`](./lite/)フォルダを開く

### ステップ2: GASプロジェクト作成
```
Google Drive → 新規 → その他 → Google Apps Script
```

### ステップ3: 2ファイルをコピー

| GAS内のファイル名 | コピー元 |
|------------------|---------|
| **コード.gs** | [`lite/コード.gs`](./lite/コード.gs) |
| **index.html** | [`lite/index.html`](./lite/index.html) |

### ステップ4: デプロイ
```
1. myFunction を実行して権限承認
2. デプロイ → ウェブアプリ → 全員アクセス
```

---

## 📝 テスト用JSON

```json
{
  "processInfo": {"name": "シンプルテスト"},
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

---

## 🆘 トラブルシューティング

### デプロイが遅い・うまくいかない場合
GASエディタで直接実行：
1. `myFunction()`を実行
2. Google Driveで生成されたプレゼンテーションを確認

### エラー: 権限がありません
1. GASエディタで一度 `myFunction()` を実行
2. 権限を承認（Google DriveとSlidesへのアクセス）
3. 再度Webアプリにアクセス

### エラー: generateBPMNFromWeb is not defined
→ `bpmn-ultra-lite.gs`が正しくコード.gsにコピーされているか確認

### デプロイが遅い・エラーが出る場合
→ 最新の超軽量版（2ファイル）を使用すれば高速デプロイ可能

---

## 📊 より高度な使い方

### AI対話でJSON生成
[`BPMN_DIALOGUE_PROMPT.md`](./BPMN_DIALOGUE_PROMPT.md)をChatGPT/Claudeにコピペ

---

## 🙏 謝辞

**まじん式プロンプト**の革新的なアプローチに感謝します。

⭐ **役立ったらStarをお願いします！**