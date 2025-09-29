# 🎯 ひまじん式BPMN自動生成システム

**JSONを貼り付けてボタンを押すだけで業務フロー図が完成！**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ⚠️ このプロジェクトは「**まじん式プロンプト**」にインスパイアされた**非公式派生版**です

---

## 🚀 セットアップ（5分）

### ステップ1: GASプロジェクト作成
```
Google Drive → 新規 → その他 → Google Apps Script
```

### ステップ2: 必要な3ファイルをコピー

| GAS内のファイル名 | 作成方法 | コピー元 |
|------------------|---------|---------|
| **コード.gs** | デフォルトで存在 | [`bpmn-swimlane.gs`](./bpmn-swimlane.gs)の全内容 |
| **test-minimal** | ＋ → HTML | [`test-minimal.html`](./test-minimal.html)の全内容 |
| **web-app** | ＋ → スクリプト | 下記のコードをコピー |

### ステップ3: web-app.gsの内容
```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('test-minimal')
    .setTitle('BPMN生成');
}

function generateBPMNPresentationFromWeb(jsonData) {
  try {
    return generateBPMNPresentation(jsonData);
  } catch (error) {
    return {success: false, error: error.toString()};
  }
}
```

### ステップ4: デプロイ
```
デプロイ → 新しいデプロイ → ウェブアプリ
実行ユーザー：自分
アクセス：全員
```

### ステップ5: 使う
URLにアクセス → JSONを貼り付けて「生成」ボタン

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

### エラー: 権限がありません
1. GASエディタで一度 `testBPMNGeneration()` を実行
2. 権限を承認
3. 再度Webアプリにアクセス

### エラー: generateBPMNPresentation is not defined
→ `bpmn-swimlane.gs`が正しくコード.gsにコピーされているか確認

### エラー: setRgbColor is not a function
→ 111行目付近を以下に修正：
```javascript
const background = slide.getBackground();
const fill = background.getSolidFill();
fill.getColor().setRgbColor(0, 172, 193);
```

---

## 📊 より高度な使い方

### AI対話でJSON生成
[`BPMN_DIALOGUE_PROMPT.md`](./BPMN_DIALOGUE_PROMPT.md)をChatGPT/Claudeにコピペ

### フォーム入力
[`bpmn-data-collection.gs`](./bpmn-data-collection.gs)を追加してGoogleフォーム連携

### 見た目を改善
[`json-input.html`](./json-input.html)を使用（サンプルボタン付き）

---

## 🙏 謝辞

**まじん式プロンプト**の革新的なアプローチに感謝します。

⭐ **役立ったらStarをお願いします！**