# 🎯 ひまじん式BPMN自動生成システム

**JSONを貼り付けてボタンを押すだけで業務フロー図が完成！**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ⚠️ このプロジェクトは「**まじん式プロンプト**」にインスパイアされた**非公式派生版**です

---

## 🚀 セットアップ（3分）

### ステップ1: GASプロジェクト作成
```
Google Drive → 新規 → その他 → Google Apps Script
```

### ステップ2: 必要な2ファイルをコピー

| GAS内のファイル名 | 作成方法 | コピー元 |
|------------------|---------|---------|
| **コード.gs** | デフォルトで存在 | [`bpmn-ultra-lite.gs`](./bpmn-ultra-lite.gs)の全内容 |
| **index.html** | ＋ → HTML → ファイル名を`index`に | [`index.html`](./index.html)の全内容 |

### ステップ3: 権限承認とデプロイ
```
1. まず myFunction を実行して権限を承認
   実行 → myFunction → 実行 → 権限を確認

2. デプロイ
   デプロイ → 新しいデプロイ → ウェブアプリ
   実行ユーザー：自分
   アクセス：全員
```

### ステップ4: 使う
URLにアクセス → JSONを貼り付けて「BPMN生成」ボタン

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