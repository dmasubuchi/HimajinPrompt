## コンサルタントが収集する情報の構造化

### 1. 情報収集の現実と課題

```yaml
現場での情報収集パターン:
  ヒアリング:
    - 断片的な口頭説明
    - 時系列がバラバラ
    - 例外処理の後出し
    - 担当者による認識の違い
  
  既存資料:
    - Excel手順書（非構造化）
    - メール文面
    - 規定書・マニュアル
    - システム画面キャプチャ
  
  観察:
    - 実際の作業風景
    - 使用システム・ツール
    - 非公式な運用
```

### 2. 必要情報の体系化

```yaml
# ひまじん式BPMNインプット構造
業務プロセス定義:
  基本情報:
    プロセス名: "受注処理フロー"
    プロセスID: "ORD-001"
    版: "1.0"
    作成日: "2024-01-15"
    作成者: "山田太郎"
    対象期間: "As-Is" # As-Is / To-Be
    
  スコープ:
    開始: "顧客からの注文受領"
    終了: "商品出荷完了"
    対象外: ["返品処理", "キャンセル処理"]
    
  登場人物:
    アクター:
      - id: "sales"
        名称: "営業部"
        種別: "部門"
        説明: "注文受付と顧客対応"
        
      - id: "warehouse"
        名称: "倉庫"
        種別: "部門"
        説明: "在庫管理と出荷"
        
    システム:
      - id: "sap"
        名称: "SAP"
        種別: "基幹システム"
        
      - id: "wms"
        名称: "WMS"
        種別: "倉庫管理システム"

  アクティビティ一覧:
    - id: "ACT001"
      名称: "注文受付"
      担当: "sales"
      種類: "手動タスク"
      
      入力情報:
        - "注文書"
        - "顧客情報"
        
      出力情報:
        - "受注データ"
        
      使用システム: ["sap"]
      所要時間: "10分"
      
      詳細手順:
        - "注文書の内容確認"
        - "SAP入力"
        - "受注番号発行"
      
    - id: "ACT002"
      名称: "在庫確認"
      担当: "warehouse"
      種類: "システムタスク"
      前提条件: "ACT001完了"
      
  フロー定義:
    - from: "開始"
      to: "ACT001"
      
    - from: "ACT001"
      to: "DEC001"
      
    - from: "DEC001"
      to: "ACT002"
      条件: "在庫あり"
      
    - from: "DEC001"
      to: "ACT003"
      条件: "在庫なし"
      
  判定ポイント:
    - id: "DEC001"
      名称: "在庫有無"
      担当: "warehouse"
      
      条件:
        - label: "在庫あり"
          next: "ACT002"
          
        - label: "在庫なし"
          next: "ACT003"
          
  例外処理:
    - id: "EXC001"
      名称: "与信エラー"
      発生箇所: "ACT001"
      対処: "営業マネージャーへエスカレーション"
```

### 3. 段階的な情報収集テンプレート

```yaml
# レベル1: 最小限情報（5分ヒアリング）
クイック収集:
  プロセス: "受注処理"
  
  誰が何をする:
    - "営業が注文を受ける"
    - "倉庫が在庫を確認する"
    - "在庫があれば出荷する"
    - "なければ発注する"
    
  主な判断:
    - "在庫の有無"
    - "与信OK/NG"

---

# レベル2: 基本情報（30分ヒアリング）
標準収集:
  アクター:
    - 営業部
    - 倉庫
    - 経理部
    
  主要ステップ:
    営業部:
      1. 注文受付:
         入力: "注文書"
         出力: "受注データ"
         システム: "SAP"
         時間: "10分"
         
    倉庫:
      2. 在庫確認:
         入力: "受注データ"
         判定: "在庫有無"
         
  ルート分岐:
    在庫あり: "出荷処理へ"
    在庫なし: "発注処理へ"

---

# レベル3: 詳細情報（2時間ワークショップ）
詳細収集:
  # 全項目を記載...
```

### 4. システムへの入力JSON構造

```json
{
  "version": "1.0",
  "metadata": {
    "processName": "受注処理フロー",
    "processId": "ORD-001",
    "createdAt": "2024-01-15",
    "author": "山田太郎",
    "type": "As-Is",
    "inputLevel": 2  // 1:最小, 2:基本, 3:詳細
  },
  
  "actors": [
    {
      "id": "sales",
      "name": "営業部",
      "type": "department",
      "color": "#e3f2fd"  // オプション
    },
    {
      "id": "warehouse",
      "name": "倉庫",
      "type": "department",
      "color": "#f3e5f5"
    }
  ],
  
  "phases": [
    {
      "id": "phase1",
      "name": "受注",
      "order": 1
    },
    {
      "id": "phase2", 
      "name": "在庫確認",
      "order": 2
    }
  ],
  
  "activities": [
    {
      "id": "act1",
      "name": "注文受付",
      "type": "userTask",  // userTask, serviceTask, manualTask
      "actor": "sales",
      "phase": "phase1",
      "position": {"x": 1, "y": 1},  // オプション：自動配置可
      
      "details": {
        "inputs": ["注文書", "顧客情報"],
        "outputs": ["受注番号"],
        "systems": ["SAP"],
        "duration": "10min",
        "description": "顧客からの注文を受け付けてSAPに登録"
      }
    },
    {
      "id": "dec1",
      "name": "在庫有無",
      "type": "exclusiveGateway",
      "actor": "warehouse",
      "phase": "phase2"
    }
  ],
  
  "flows": [
    {
      "id": "flow1",
      "from": "start",
      "to": "act1"
    },
    {
      "id": "flow2",
      "from": "act1",
      "to": "dec1"
    },
    {
      "id": "flow3",
      "from": "dec1",
      "to": "act2",
      "condition": "在庫あり"
    }
  ],
  
  "exceptions": [
    {
      "id": "exc1",
      "name": "与信エラー",
      "attachedTo": "act1",
      "action": "マネージャー承認"
    }
  ],
  
  "annotations": [
    {
      "id": "note1",
      "text": "繁忙期は30分かかる場合あり",
      "attachedTo": "act1"
    }
  ]
}
```

### 5. 収集情報チェックリスト

```yaml
必須情報チェック:
  ✓ プロセスの開始と終了が明確か
  ✓ すべてのアクターが識別されているか
  ✓ 各アクティビティの担当が明確か
  ✓ 判定ポイントと分岐条件が明確か
  
推奨情報チェック:
  ✓ 各アクティビティの入出力
  ✓ 使用システム・ツール
  ✓ 所要時間・頻度
  ✓ 例外処理・エラーパターン
  
品質チェック:
  ✓ フローに行き止まりがないか
  ✓ すべての分岐に条件があるか
  ✓ 役割の重複・矛盾がないか
  ✓ システム連携が明確か
```

### 6. 段階的入力を支援するUI案

```javascript
// Googleフォームでの段階的入力
function createInputForm() {
  const form = FormApp.create('業務フロー情報収集');
  
  // レベル1: クイック入力
  form.addSectionHeaderItem()
    .setTitle('基本情報（必須）');
    
  form.addTextItem()
    .setTitle('プロセス名')
    .setRequired(true);
    
  form.addParagraphTextItem()
    .setTitle('誰が何をするか箇条書きで')
    .setHelpText('例：営業が注文を受ける')
    .setRequired(true);
    
  // レベル2: 詳細入力
  form.addPageBreakItem()
    .setTitle('詳細情報（任意）');
    
  form.addGridItem()
    .setTitle('アクティビティ詳細')
    .setRows(['入力', '出力', 'システム', '時間'])
    .setColumns(['activity1', 'activity2', 'activity3']);
    
  return form;
}
```

### 7. 自然言語からの自動構造化

```javascript
const structurePrompt = `
以下のヒアリングメモから構造化JSONを生成してください。

入力例：
「営業の田中さんが注文を受けて、それをSAPに入れる。
倉庫の人が在庫を見て、あればすぐ出荷、
なければ購買に発注依頼。だいたい1日で終わる。」

出力すべきJSON構造：
{
  "actors": [...],
  "activities": [...],
  "flows": [...],
  "gateways": [...]
}

不明な情報は "TBD" としてマークし、
確認すべき事項をコメントで付記してください。
`;
```

### 実装の優先順位

1. **最小構造での動作確認**（3日）
   - アクター + アクティビティ + フローのみ

2. **段階的詳細化**（1週間）
   - レベル1→2→3の拡張機能

3. **収集支援ツール**（2週間）
   - Googleフォーム連携
   - 音声入力対応
   - 既存Excel取り込み

