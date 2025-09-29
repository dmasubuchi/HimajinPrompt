/**
 * BPMN Ultra Lite - 超軽量版BPMNスライド生成システム
 * まじん式アーキテクチャーに基づく単一ファイル完結型
 *
 * @version 1.0.0
 * @author ひまじん
 * @license MIT
 */

// ========================================
// 設定定義
// ========================================
const BPMN_CONFIG = {
  COLORS: {
    swimlane_header: '#00acc1',
    swimlane_text: '#ffffff',
    lane_odd: '#ffffff',
    lane_even: '#f5f5f5',
    task: '#e3f2fd',
    task_border: '#1976d2',
    flow: '#424242'
  },
  LAYOUT: {
    margin: 20,
    header_width: 100,
    task_width: 100,
    task_height: 40,
    task_spacing: 150
  }
};

// ========================================
// メインエントリポイント
// ========================================
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('BPMN Generator - ひまじん式')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

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

  const result = generateBPMNFromWeb(testData);
  if (result.success) {
    console.log("✅ 成功: " + result.url);
  } else {
    console.log("❌ エラー: " + result.error);
  }
}

// ========================================
// Web APIエンドポイント
// ========================================
function generateBPMNFromWeb(jsonData) {
  try {
    const result = createBPMNPresentation(jsonData);
    return {
      success: true,
      url: result.url,
      message: 'BPMNダイアグラムを生成しました'
    };
  } catch (error) {
    console.error('Error in generateBPMNFromWeb:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// BPMN生成メイン処理
// ========================================
function createBPMNPresentation(data) {
  // プレゼンテーション作成
  const presentationName = data.processInfo?.name || 'BPMN Diagram';
  const presentation = SlidesApp.create(presentationName);
  const presentationId = presentation.getId();

  // タイトルスライド設定
  const slides = presentation.getSlides();
  const titleSlide = slides[0];

  // 背景色設定（別の方法）
  try {
    // 背景に矩形を追加して色を設定
    const bgShape = titleSlide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      0, 0,
      titleSlide.getPageWidth(),
      titleSlide.getPageHeight()
    );
    bgShape.getFill().setSolidFill(BPMN_CONFIG.COLORS.swimlane_header);
    bgShape.getBorder().setTransparent();
    bgShape.sendToBack();
  } catch (e) {
    // 背景設定に失敗した場合はスキップ
    console.log('Background color setting failed:', e.message);
  }

  // タイトルテキスト設定
  const shapes = titleSlide.getShapes();
  if (shapes.length > 0) {
    shapes[0].getText().setText(presentationName);
    shapes[0].getText().getTextStyle()
      .setForegroundColor('#ffffff')
      .setFontSize(40)
      .setBold(true);
  }
  if (shapes.length > 1) {
    const now = new Date();
    const dateStr = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy年MM月dd日 HH:mm');
    shapes[1].getText().setText('自動生成: ' + dateStr);
    shapes[1].getText().getTextStyle()
      .setForegroundColor('#ffffff')
      .setFontSize(14);
  }

  // BPMNダイアグラムスライド追加
  const diagramSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  drawBPMNDiagram(diagramSlide, data);

  // プレゼンテーション保存
  presentation.saveAndClose();

  return {
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    presentationId: presentationId
  };
}

// ========================================
// BPMNダイアグラム描画
// ========================================
function drawBPMNDiagram(slide, data) {
  const pageWidth = slide.getPageWidth();
  const pageHeight = slide.getPageHeight();
  const config = BPMN_CONFIG;
  const layout = config.LAYOUT;

  // スイムレーン描画
  const laneHeight = (pageHeight - layout.margin * 2) / data.actors.length;
  const swimlanes = {};

  data.actors.forEach((actor, index) => {
    const y = layout.margin + index * laneHeight;

    // レーンヘッダー
    const header = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      layout.margin,
      y,
      layout.header_width,
      laneHeight
    );
    header.getFill().setSolidFill(config.COLORS.swimlane_header);
    header.getText().setText(actor.name);
    header.getText().getTextStyle()
      .setForegroundColor(config.COLORS.swimlane_text)
      .setFontSize(12)
      .setBold(true);
    header.getText().getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);

    // レーン本体
    const lane = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      layout.margin + layout.header_width,
      y,
      pageWidth - layout.margin * 2 - layout.header_width,
      laneHeight
    );
    lane.getFill().setSolidFill(
      index % 2 === 0 ? config.COLORS.lane_odd : config.COLORS.lane_even
    );
    lane.getBorder().setWeight(1);
    lane.getBorder().getLineFill().setSolidFill('#e0e0e0');

    swimlanes[actor.id] = { y: y, height: laneHeight };
  });

  // タスク描画
  const taskPositions = {};

  data.tasks.forEach((task, index) => {
    const swimlane = swimlanes[task.actor];
    if (!swimlane) return;

    const x = layout.margin + layout.header_width + 30 + (index * layout.task_spacing);
    const y = swimlane.y + (swimlane.height - layout.task_height) / 2;

    const taskShape = slide.insertShape(
      SlidesApp.ShapeType.ROUND_RECTANGLE,
      x,
      y,
      layout.task_width,
      layout.task_height
    );

    taskShape.getFill().setSolidFill(config.COLORS.task);
    taskShape.getBorder().setWeight(2);
    taskShape.getBorder().getLineFill().setSolidFill(config.COLORS.task_border);

    taskShape.getText().setText(task.name);
    taskShape.getText().getTextStyle()
      .setFontSize(10)
      .setBold(false);
    taskShape.getText().getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);

    taskPositions[task.id] = {
      x: x,
      y: y,
      width: layout.task_width,
      height: layout.task_height
    };
  });

  // フロー矢印描画
  data.flows.forEach(flow => {
    const from = taskPositions[flow.from];
    const to = taskPositions[flow.to];

    if (!from || !to) return;

    // 矢印の開始と終了位置を計算
    const startX = from.x + from.width;
    const startY = from.y + from.height / 2;
    const endX = to.x;
    const endY = to.y + to.height / 2;

    const line = slide.insertLine(
      SlidesApp.LineCategory.STRAIGHT,
      startX,
      startY,
      endX,
      endY
    );

    line.getLineFill().setSolidFill(config.COLORS.flow);
    line.setWeight(2);
    line.setEndArrowStyle(SlidesApp.ArrowStyle.STEALTH_ARROW);
  });

  // ゲートウェイがある場合は描画
  if (data.gateways && data.gateways.length > 0) {
    drawGateways(slide, data.gateways, swimlanes, taskPositions);
  }
}

// ========================================
// ゲートウェイ描画（オプション）
// ========================================
function drawGateways(slide, gateways, swimlanes, taskPositions) {
  gateways.forEach((gateway, index) => {
    const swimlane = swimlanes[gateway.actor];
    if (!swimlane) return;

    const x = BPMN_CONFIG.LAYOUT.margin + BPMN_CONFIG.LAYOUT.header_width + 30 +
              ((Object.keys(taskPositions).length + index) * BPMN_CONFIG.LAYOUT.task_spacing);
    const y = swimlane.y + (swimlane.height - 40) / 2;

    // ダイヤモンド形のゲートウェイ
    const gatewayShape = slide.insertShape(
      SlidesApp.ShapeType.DIAMOND,
      x,
      y,
      40,
      40
    );

    gatewayShape.getFill().setSolidFill('#fff3e0');
    gatewayShape.getBorder().setWeight(2);
    gatewayShape.getBorder().getLineFill().setSolidFill('#ff6f00');

    gatewayShape.getText().setText(gateway.condition || '?');
    gatewayShape.getText().getTextStyle().setFontSize(10);
  });
}