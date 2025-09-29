# 🔗 GitHub連携手順

## 1. GitHubでリポジトリ作成

1. **GitHubにアクセス**
   - https://github.com にログイン
   - 右上の「+」→「New repository」

2. **リポジトリ設定**
   ```
   Repository name: HimajinPrompt
   Description: ひまじん式BPMN自動生成システム - Google Apps Scriptで業務フロー図を自動作成
   Public/Private: お好みで選択
   ⚠️ 重要: "Add a README file"のチェックは外す（既にREADMEがあるため）
   ```

3. **「Create repository」をクリック**

## 2. ローカルリポジトリをGitHubに接続

ターミナルで以下のコマンドを実行：

```bash
# 現在のディレクトリを確認
cd /Users/matthew/Documents/GitHub/vs-code-active/HimajinPrompt

# Gitリポジトリとして初期化（まだの場合）
git init

# GitHubをリモートリポジトリとして追加
git remote add origin https://github.com/YOUR_USERNAME/HimajinPrompt.git

# 現在のリモート設定を確認
git remote -v

# ブランチ名をmainに設定（必要な場合）
git branch -M main

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "🚀 Initial commit: ひまじん式BPMN自動生成システム

- BPMNスイムレーン図生成機能
- Googleフォーム連携による段階的情報収集
- Gemini AI対話型インターフェース
- 横型・縦型の2パターン同時生成対応"

# GitHubにプッシュ
git push -u origin main
```

## 3. トラブルシューティング

### エラー: "fatal: remote origin already exists"
```bash
# 既存のoriginを削除してから再追加
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/HimajinPrompt.git
```

### エラー: "Permission denied (publickey)"
```bash
# HTTPSを使用（SSHの代わりに）
git remote set-url origin https://github.com/YOUR_USERNAME/HimajinPrompt.git
```

### エラー: "rejected - non-fast-forward"
```bash
# 強制プッシュ（最初のみ、注意して使用）
git push -u origin main --force
```

### 認証エラーの場合
```bash
# Personal Access Tokenを使用
# GitHub → Settings → Developer settings → Personal access tokens → Generate new token
# repo権限を付与してトークンを生成

# ユーザー名: YOUR_USERNAME
# パスワード: 生成したトークン
```

## 4. .gitignoreファイルの作成

```bash
# .gitignoreファイルを作成
cat > .gitignore << 'EOF'
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Editor
*.swp
*.swo
*~
.vscode/
.idea/

# Logs
*.log

# Sensitive data
.env
config.js
*credentials.json

# Temporary files
*.tmp
*.temp
EOF

# .gitignoreを追加してコミット
git add .gitignore
git commit -m "Add .gitignore file"
git push
```

## 5. Google Apps ScriptとGitHub連携（clasp使用）

### claspのインストールと設定

```bash
# claspをグローバルインストール
npm install -g @google/clasp

# Googleアカウントでログイン
clasp login

# 既存のGASプロジェクトをクローン
# Script IDは：GASエディタ → プロジェクトの設定 → スクリプトID
clasp clone YOUR_SCRIPT_ID

# .clasp.jsonが作成される
```

### package.jsonの作成

```bash
cat > package.json << 'EOF'
{
  "name": "himajin-prompt",
  "version": "1.0.0",
  "description": "ひまじん式BPMN自動生成システム",
  "scripts": {
    "push": "clasp push",
    "pull": "clasp pull",
    "open": "clasp open",
    "deploy": "clasp deploy",
    "watch": "clasp push --watch"
  },
  "keywords": ["bpmn", "gas", "automation", "workflow"],
  "author": "ひまじん",
  "license": "MIT",
  "devDependencies": {
    "@google/clasp": "^2.4.2"
  }
}
EOF

# package.jsonをコミット
git add package.json
git commit -m "Add package.json for clasp integration"
git push
```

## 6. 開発ワークフロー

### 日常的な開発フロー

```bash
# 1. 最新版を取得
git pull origin main

# 2. GASから最新コードを取得
npm run pull

# 3. ローカルで編集

# 4. GASにプッシュしてテスト
npm run push

# 5. 動作確認後、Gitにコミット
git add .
git commit -m "機能追加: ○○○"
git push

# 6. タグを付ける（リリース時）
git tag -a v1.0.0 -m "Version 1.0.0: 初回リリース"
git push origin v1.0.0
```

### ブランチ運用

```bash
# 機能開発用ブランチ作成
git checkout -b feature/add-new-diagram-type

# 開発・コミット
git add .
git commit -m "新しい図形タイプを追加"

# mainにマージ
git checkout main
git merge feature/add-new-diagram-type
git push
```

## 7. GitHub Actionsで自動化（オプション）

`.github/workflows/deploy.yml`を作成：

```yaml
name: Deploy to Google Apps Script

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'

    - name: Install clasp
      run: npm install -g @google/clasp

    - name: Setup clasp credentials
      run: |
        echo '${{ secrets.CLASP_CREDENTIALS }}' > ~/.clasprc.json

    - name: Push to GAS
      run: clasp push --force
```

必要なSecrets：
- `CLASP_CREDENTIALS`: ~/.clasprc.jsonの内容

## 8. README.mdにバッジを追加

README.mdの最初に追加：

```markdown
# 🎯 ひまじん式BPMN自動生成システム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/YOUR_USERNAME/HimajinPrompt/pulls)
```

## 完了チェックリスト

- [ ] GitHubリポジトリ作成
- [ ] ローカルとGitHub接続
- [ ] 初回プッシュ成功
- [ ] .gitignore設定
- [ ] README.md確認
- [ ] （オプション）clasp設定
- [ ] （オプション）GitHub Actions設定

これで完了です！🎉