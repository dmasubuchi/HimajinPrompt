# 🚀 セットアップガイド（動作確認済み）

## 必要なファイル（3つ）

### 1. コード.gs
[`bpmn-swimlane.gs`](./bpmn-swimlane.gs)の内容を**すべてコピー**

### 2. web-app.gs（新規スクリプト）
```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('json-input')
    .setTitle('ひまじん式BPMN')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function generateBPMNPresentationFromWeb(jsonData) {
  try {
    return generateBPMNPresentation(jsonData);
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
```

### 3. json-input.html（新規HTML）
[`json-input.html`](./json-input.html)の内容を**すべてコピー**

## デプロイ手順

1. **3つのファイルを正確にコピー**
2. **保存**（Ctrl+S）
3. **デプロイ**
   - デプロイ → 新しいデプロイ
   - 種類：ウェブアプリ
   - 実行ユーザー：自分
   - アクセス：全員
4. **URLにアクセス**

## テスト用JSON（最小）

```json
{
  "processInfo": {"name": "テスト"},
  "actors": [
    {"id": "A1", "name": "部門A"}
  ],
  "tasks": [
    {"id": "T1", "name": "作業1", "actor": "A1"}
  ],
  "flows": []
}
```

## よくあるエラーと対処法

### エラー1: `generateBPMNPresentation is not defined`
**原因**: bpmn-swimlane.gsが正しくコピーされていない
**対処**: コード.gsに完全にコピーされているか確認

### エラー2: HTMLが表示されない
**原因**: ファイル名が間違っている
**対処**: HTMLファイル名が`json-input`になっているか確認

### エラー3: スライド生成エラー
**原因**: 権限不足
**対処**:
1. 一度GASエディタで`testBPMNGeneration()`を実行
2. 権限を承認
3. 再度Webアプリにアクセス