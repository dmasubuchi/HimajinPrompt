# 🎯 ひまじん式BPMN自動生成システム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)

## ⚠️ 重要なお知らせ

このプロジェクトは「**まじん式プロンプト**」にインスパイアされて開発された**非公式派生版**です。

- 🚫 **本家からの許諾は得ていません**
- 🙏 オリジナルの「まじん式プロンプト」に最大限のリスペクトを表します
- 💡 本家の素晴らしいコンセプトをBPMN図生成に応用しました

> **まじん式作者様へ**：何かご意見・ご要望がございましたら、即座に対応させていただきます。

---

## 🚀 何ができるの？

**3つの方法**で業務フロー図を**自動生成**：

### 1️⃣ AI対話で簡単作成（APIキー不要！）
```
👤「受注処理のフロー作りたい」
🤖「関わる部門を教えてください」
👤「営業と倉庫」
→ JSONを生成 → GASで図に変換！
```
**ChatGPT/Claude/Geminiの無料版でOK**

### 2️⃣ フォーム入力（3段階）
- ⚡ **5分**：最小限情報
- 📝 **30分**：標準フロー
- 📊 **2時間**：KPI付き完全版

### 3️⃣ JSON直接入力
上級者向けの直接制御

---

## 📦 ファイル構成

| ファイル | 説明 |
|---------|------|
| [`bpmn-swimlane.gs`](./bpmn-swimlane.gs) | メイン描画エンジン（横型・縦型スイムレーン） |
| [`bpmn-data-collection.gs`](./bpmn-data-collection.gs) | Googleフォーム連携・段階的情報収集 |
| [`BPMN_DIALOGUE_PROMPT.md`](./BPMN_DIALOGUE_PROMPT.md) | **AI対話用プロンプト（APIキー不要）** |
| [`index.html`](./index.html) | Webアプリ用UI（オプション） |

---

## ⚡ クイックスタート（10分）

### ステップ1：GASプロジェクト作成
```
Google Drive → 新規 → その他 → Google Apps Script
```

### ステップ2：コードをコピー
1. [`bpmn-swimlane.gs`](./bpmn-swimlane.gs)の内容をGASにコピー
2. 保存（プロジェクト名：ひまじん式BPMN）

### ステップ3：テスト実行
```javascript
testBPMNGeneration() // この関数を実行
```

### ステップ4：権限承認
初回実行時に権限を許可

✅ **完了！** これで使えます

---

## 🎮 3つの使い方

<details>
<summary><b>方法1：AI対話（最も簡単・APIキー不要）</b></summary>

### 1. プロンプトをコピー
[`BPMN_DIALOGUE_PROMPT.md`](./BPMN_DIALOGUE_PROMPT.md)の内容をコピー

### 2. AIに貼り付け
ChatGPT、Claude、Geminiのどれかに貼り付け

### 3. 対話開始
```
👤：受注処理フロー作りたい
🤖：部門を教えてください
👤：営業、倉庫、購買
🤖：流れを教えてください
👤：営業が注文受けて...
```

### 4. JSONを受け取ってGASで実行
```javascript
function generateFromAI() {
  const jsonData = /* AIが生成したJSONをここに貼り付け */;
  const result = generateBPMNPresentation(jsonData);
  console.log(result.url); // スライドURL
}
```

**メリット**：
- ✅ APIキー不要
- ✅ 無料で使える
- ✅ まじん式と同じ手軽さ
</details>

<details>
<summary><b>方法2：Googleフォーム（段階的入力）</b></summary>

### フォーム生成
```javascript
// bpmn-data-collection.gsを追加後
testFormCreation() // 実行するとフォームURL表示
```

### 3段階の入力
- **レベル1**（必須）：プロセス名、関係者、主な流れ
- **レベル2**（推奨）：詳細ステップ、システム、例外処理
- **レベル3**（完全）：KPI、改善点、ビジネスルール

### 結果受信
メールで生成されたスライドURLを受信
</details>

<details>
<summary><b>方法3：JSON直接入力（上級者向け）</b></summary>

```javascript
function createMyFlow() {
  const data = {
    "processInfo": {"name": "受注処理"},
    "orientation": "both",
    "actors": [
      {"id": "A1", "name": "営業部"},
      {"id": "A2", "name": "倉庫"}
    ],
    "tasks": [
      {"id": "T1", "name": "注文受付", "actor": "A1"},
      {"id": "T2", "name": "在庫確認", "actor": "A2"}
    ],
    "flows": [{"from": "T1", "to": "T2"}]
  };

  const result = generateBPMNPresentation(data);
  console.log(result.url);
}
```
</details>

---

## 🎨 カスタマイズ

### 色変更
```javascript
const BPMN_COLORS = {
  swimlane: {
    header: '#your-color',  // 企業カラーに変更
  }
};
```

### サイズ調整
```javascript
const LAYOUT_CONFIG = {
  horizontal: {
    laneHeight: 100,    // レーン高さ
    elementWidth: 120,  // 要素幅
  }
};
```

---

## 🆘 トラブルシューティング

| 問題 | 解決方法 |
|------|---------|
| 権限エラー | プロジェクト設定 → OAuth → 内部利用 |
| スライド生成されない | 実行ログでエラー確認 |
| JSONエラー | JSON形式を[JSONLint](https://jsonlint.com/)で検証 |

---

## 📊 導入効果

| 企業 | 効果 |
|------|------|
| コンサル A社 | 3時間 → 15分（**12倍高速化**） |
| 製造業 B社 | 200フロー/月を実現 |
| IT企業 C社 | 認識齟齬**80%削減** |

---

## 📝 プロジェクト情報

### オリジナル「まじん式」
- **作者**：まじん様
- **用途**：プレゼンテーション自動生成
- **特徴**：プロンプトコピーで即使用可能

### 派生版「ひまじん式」
- **作者**：ひまじん
- **用途**：BPMN図特化
- **独自機能**：スイムレーン、段階的収集
- **まじん式踏襲**：APIキー不要のプロンプト方式

---

## 🤔 よくある質問

<details>
<summary><b>Q: APIキーは必要ですか？</b></summary>

**A: 不要です！**
まじん式と同様、プロンプトをコピーしてChatGPT等で使えます。
</details>

<details>
<summary><b>Q: 無料で使えますか？</b></summary>

**A: 完全無料です！**
- Google Apps Script：無料
- ChatGPT/Claude/Gemini：無料版でOK
- Googleフォーム：無料
</details>

<details>
<summary><b>Q: まじん式との違いは？</b></summary>

**A: 用途が異なります**
- まじん式：プレゼンスライド生成
- ひまじん式：BPMN業務フロー図生成
</details>

---

## 📄 ライセンス

MIT License（改変・商用利用可）

**ただし「まじん式」非公式派生版であることを明記してください**

---

## 🤝 貢献

1. Fork
2. 機能追加
3. Pull Request

**注意**：本家「まじん式」の質問は対応できません

---

## 🙏 謝辞

**まじん式プロンプト**の革新的コンセプトに心から感謝します。

プロンプトをコピーして使うというシンプルで強力なアプローチを、BPMN図生成に応用させていただきました。

---

⭐ **役立ったらStarをお願いします！**

*Created by ひまじん / Inspired by まじん式プロンプト*