
## ひまじん式BPMNの要件定義（実例を踏まえて）

### 対応すべき図のパターン

1. **標準スイムレーン（横型）**
   - 縦軸：部門/役割
   - 横軸：フェーズ/時系列

2. **縦型スイムレーン**
   - 横軸：部門/役割  
   - 縦軸：時系列（戻りあり）

3. **複雑な分岐パターン**
   - 条件分岐の多重化
   - 並列処理
   - ループバック

## 実装案：2枚同時生成システム

### JSONデータ構造（拡張版）

```json
{
  "diagram": {
    "title": "業務プロセス名",
    "orientation": "both",  // "horizontal", "vertical", "both"
    "generatePages": 2,      // 生成ページ数
    
    "swimlanes": {
      "horizontal": {
        "axis_x": "phase",    // "phase", "time", "step"
        "axis_y": "department", // "department", "role", "system"
        "lanes": [...]
      },
      "vertical": {
        "axis_x": "department",
        "axis_y": "time",
        "lanes": [...]
      }
    },
    
    "elements": [
      {
        "id": "task1",
        "type": "task",
        "text": "注文受付",
        "position_h": {"lane": 1, "phase": 1, "x": 2, "y": 1},
        "position_v": {"lane": 2, "phase": 1, "x": 1, "y": 2}
      }
    ],
    
    "flows": [
      {"from": "task1", "to": "decision1", "condition": "在庫あり"}
    ]
  }
}
```

### GASでの2ページ同時生成

```javascript
function generateDualOrientation(jsonData) {
  const presentation = SlidesApp.create('業務フロー（2方向）');
  
  // ページ1: 横型スイムレーン
  const slide1 = presentation.getSlides()[0];
  drawHorizontalSwimLane(slide1, jsonData);
  
  // ページ2: 縦型スイムレーン（新規追加）
  const slide2 = presentation.appendSlide();
  drawVerticalSwimLane(slide2, jsonData);
  
  return presentation;
}

// 横型描画（従来型）
function drawHorizontalSwimLane(slide, data) {
  const config = {
    startX: 50,
    startY: 50,
    laneHeight: 80,
    phaseWidth: 150,
    elementWidth: 60,
    elementHeight: 40
  };
  
  // スイムレーン背景
  data.swimlanes.horizontal.lanes.forEach((lane, i) => {
    // レーン背景
    const y = config.startY + (i * config.laneHeight);
    const laneShape = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      config.startX, y, 600, config.laneHeight
    );
    
    // レーンヘッダー
    const header = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      config.startX, y, 100, config.laneHeight
    );
    header.getFill().setSolidFill('#e0e0e0');
    header.getText().setText(lane.name);
    
    // フェーズ区切り
    lane.phases?.forEach((phase, j) => {
      const x = config.startX + 100 + (j * config.phaseWidth);
      if (j > 0) {
        slide.insertLine(
          SlidesApp.LineCategory.STRAIGHT,
          x, y, x, y + config.laneHeight
        ).setDashStyle(SlidesApp.DashStyle.DASH);
      }
    });
  });
  
  // BPMN要素配置
  placeElements(slide, data.elements, 'horizontal', config);
}

// 縦型描画（新規）
function drawVerticalSwimLane(slide, data) {
  const config = {
    startX: 50,
    startY: 30,
    laneWidth: 150,
    phaseHeight: 100,
    elementWidth: 60,
    elementHeight: 40
  };
  
  // スイムレーンヘッダー（上部）
  const headerShape = slide.insertShape(
    SlidesApp.ShapeType.RECTANGLE,
    config.startX, config.startY, 450, 30
  );
  headerShape.getFill().setSolidFill('#00acc1');
  headerShape.getText().setText('スイムレーン').getTextStyle()
    .setForegroundColor('#ffffff').setBold(true);
  
  // 縦レーン
  data.swimlanes.vertical.lanes.forEach((lane, i) => {
    const x = config.startX + (i * config.laneWidth);
    
    // レーン背景
    const laneShape = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      x, config.startY + 30, config.laneWidth, 400
    );
    laneShape.getFill().setSolidFill(
      i % 2 === 0 ? '#ffffff' : '#f5f5f5'
    );
    
    // レーンタイトル
    const title = slide.insertTextBox(
      lane.name, x + 5, config.startY + 35, 
      config.laneWidth - 10, 30
    );
    title.getText().getTextStyle().setBold(true);
  });
  
  // BPMN要素配置
  placeElements(slide, data.elements, 'vertical', config);
}
```

### 自然言語からの変換プロンプト

```javascript
const enhancedPrompt = `
あなたはBPMNスイムレーン図の専門家です。
以下の業務フローを、横型と縦型の2つのスイムレーン図用JSONに変換してください。

重要な指示：
1. 横型：部門を縦軸、時系列を横軸に配置
2. 縦型：部門を横軸、時系列を縦軸に配置（戻り矢印も考慮）
3. 両方の図で同じ業務フローを表現
4. 判定（ダイヤモンド）には必ず条件ラベルを付与

入力例：
「受注処理：営業が注文を受け、在庫部が確認。
在庫があれば出荷部が処理、なければ営業に戻る」

出力：
{
  "orientation": "both",
  "swimlanes": {
    "horizontal": {...},
    "vertical": {...}
  },
  ...
}
`;
```

### 特殊要素への対応

```javascript
// 日本のビジネス図でよく使う要素
const japaneseBusinessElements = {
  // 承認印風の要素
  'approval': function(slide, x, y, text) {
    const stamp = slide.insertShape(
      SlidesApp.ShapeType.ELLIPSE, x, y, 50, 50
    );
    stamp.getBorder().setWeight(2).getLineFill()
      .setSolidFill('#ff0000');
    stamp.getText().setText(text).getTextStyle()
      .setForegroundColor('#ff0000').setBold(true);
  },
  
  // 書類アイコン
  'document': function(slide, x, y, text) {
    const doc = slide.insertShape(
      SlidesApp.ShapeType.WAVE, x, y, 60, 40
    );
    doc.getFill().setSolidFill('#ffffcc');
  },
  
  // システム連携
  'system': function(slide, x, y, text) {
    const sys = slide.insertShape(
      SlidesApp.ShapeType.CLOUD, x, y, 70, 40
    );
    sys.getFill().setSolidFill('#e3f2fd');
  }
};
```

### 実装の優先順位

1. **第1段階（1週間）**
   - 横型スイムレーンの基本実装
   - 5種類の基本BPMN要素

2. **第2段階（2週間）**
   - 縦型スイムレーンの追加
   - 2ページ同時生成

3. **第3段階（1ヶ月）**
   - 日本的ビジネス要素の追加
   - テンプレートライブラリ
   - エラーチェック機能

この方式なら、コンサルタントが「横で見たい」「縦で見たい」という両方のニーズに**一度に**応えられます！

