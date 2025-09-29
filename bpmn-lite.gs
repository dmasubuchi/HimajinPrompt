/**
 * BPMN Lite - 超軽量版
 * 最小限のコードでBPMNスライド生成
 */

// ========================================
// テスト関数（権限承認用）
// ========================================
function myFunction() {
  const testData = {
    processInfo: { name: "テストプロセス" },
    actors: [
      { id: "A1", name: "営業部" },
      { id: "A2", name: "経理部" }
    ],
    tasks: [
      { id: "T1", name: "見積書作成", actor: "A1" },
      { id: "T2", name: "請求処理", actor: "A2" }
    ],
    flows: [{ from: "T1", to: "T2" }]
  };

  const result = generateBPMNPresentation(testData);
  console.log(result.success ? "✅ 成功: " + result.url : "❌ エラー: " + result.error);
}

// ========================================
// Webアプリエントリポイント
// ========================================
function doGet() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>BPMN生成</title>
  <style>
    body { font-family: Arial; margin: 20px; max-width: 800px; }
    textarea { width: 100%; height: 300px; font-family: monospace; }
    button { padding: 10px 30px; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
    #result { margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>BPMNテスト（超軽量版）</h1>
  <textarea id="json">{
  "processInfo": {"name": "テストフロー"},
  "actors": [
    {"id": "A1", "name": "営業"},
    {"id": "A2", "name": "倉庫"}
  ],
  "tasks": [
    {"id": "T1", "name": "受注", "actor": "A1"},
    {"id": "T2", "name": "出荷", "actor": "A2"}
  ],
  "flows": [{"from": "T1", "to": "T2"}]
}</textarea>
  <br><br>
  <button onclick="generate()">生成</button>
  <div id="result"></div>
  <script>
    function generate() {
      const jsonText = document.getElementById('json').value;
      let data;
      try {
        data = JSON.parse(jsonText);
      } catch(e) {
        document.getElementById('result').innerHTML = 'JSONエラー: ' + e.message;
        return;
      }
      document.getElementById('result').innerHTML = '生成中...';
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            document.getElementById('result').innerHTML = '✅ 成功！<br><a href="' + result.url + '" target="_blank">' + result.url + '</a>';
          } else {
            document.getElementById('result').innerHTML = '❌ エラー: ' + result.error;
          }
        })
        .withFailureHandler(function(error) {
          document.getElementById('result').innerHTML = '❌ エラー: ' + error;
        })
        .generateBPMNPresentationFromWeb(data);
    }
  </script>
</body>
</html>
  `;
  return HtmlService.createHtmlOutput(html).setTitle('BPMN生成');
}

// Web画面から呼び出される関数
function generateBPMNPresentationFromWeb(jsonData) {
  try {
    return generateBPMNPresentation(jsonData);
  } catch (error) {
    return {success: false, error: error.toString()};
  }
}

// ========================================
// メイン関数：BPMN生成
// ========================================
function generateBPMNPresentation(jsonData) {
  try {
    // プレゼンテーション作成
    const presentation = SlidesApp.create(jsonData.processInfo.name || 'BPMN Diagram');
    const presentationId = presentation.getId();

    // 最初のスライドを取得してタイトル設定
    const slides = presentation.getSlides();
    const titleSlide = slides[0];

    // タイトルスライドの背景色設定（エラー回避版）
    const background = titleSlide.getBackground();
    const fill = background.getSolidFill();
    fill.getColor().setRgbColor(0, 172, 193);

    // タイトル設定
    const shapes = titleSlide.getShapes();
    if (shapes.length > 0) {
      shapes[0].getText().setText(jsonData.processInfo.name || 'BPMN Diagram');
    }
    if (shapes.length > 1) {
      shapes[1].getText().setText('自動生成: ' + new Date().toLocaleString('ja-JP'));
    }

    // BPMNダイアグラムスライドを追加
    const diagramSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);

    // スイムレーンを描画
    drawSimpleSwimlanes(diagramSlide, jsonData);

    // プレゼンテーションを保存
    presentation.saveAndClose();

    // URLを返す
    const url = `https://docs.google.com/presentation/d/${presentationId}/edit`;
    return {
      success: true,
      url: url,
      message: 'BPMNダイアグラムを生成しました'
    };

  } catch (error) {
    console.error('Error in generateBPMNPresentation:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// シンプルなスイムレーン描画
// ========================================
function drawSimpleSwimlanes(slide, jsonData) {
  const pageWidth = slide.getPageWidth();
  const pageHeight = slide.getPageHeight();
  const margin = 20;

  // アクター（部門）ごとのレーン作成
  const laneHeight = (pageHeight - margin * 2) / jsonData.actors.length;

  jsonData.actors.forEach((actor, index) => {
    const y = margin + index * laneHeight;

    // レーンヘッダー（部門名）
    const header = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, margin, y, 100, laneHeight);
    header.getFill().setSolidFill('#00acc1');
    header.getText().setText(actor.name).getTextStyle()
      .setForegroundColor('#ffffff')
      .setFontSize(12)
      .setBold(true);

    // レーン本体
    const lane = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, margin + 100, y, pageWidth - margin * 2 - 100, laneHeight);
    lane.getFill().setSolidFill(index % 2 === 0 ? '#ffffff' : '#f5f5f5');
    lane.getBorder().setWeight(1);
  });

  // タスクを配置
  const taskWidth = 100;
  const taskHeight = 40;
  const taskSpacing = 150;
  const taskShapes = {};

  jsonData.tasks.forEach((task, index) => {
    const actorIndex = jsonData.actors.findIndex(a => a.id === task.actor);
    if (actorIndex === -1) return;

    const x = margin + 150 + index * taskSpacing;
    const y = margin + actorIndex * laneHeight + (laneHeight - taskHeight) / 2;

    const taskShape = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, taskWidth, taskHeight);
    taskShape.getFill().setSolidFill('#e3f2fd');
    taskShape.getBorder().setWeight(2).getLineFill().setSolidFill('#1976d2');
    taskShape.getText().setText(task.name).getTextStyle()
      .setFontSize(10)
      .setBold(false);

    taskShapes[task.id] = {shape: taskShape, x: x + taskWidth/2, y: y + taskHeight/2};
  });

  // フローを描画
  jsonData.flows.forEach(flow => {
    const fromTask = taskShapes[flow.from];
    const toTask = taskShapes[flow.to];
    if (!fromTask || !toTask) return;

    const line = slide.insertLine(
      SlidesApp.LineCategory.STRAIGHT,
      fromTask.x, fromTask.y,
      toTask.x, toTask.y
    );
    line.getLineFill().setSolidFill('#424242');
    line.setWeight(2);
    line.setEndArrowStyle(SlidesApp.ArrowStyle.STEALTH_ARROW);
  });
}