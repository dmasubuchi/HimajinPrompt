/**
 * BPMN Swimlane Diagram Generator for Google Slides
 * ひまじん式BPMN - スイムレーン図自動生成システム
 *
 * @version 1.0.0
 * @author ひまじん
 * @description 業務フローをBPMNスイムレーン図として可視化
 */

// ========================================
// テスト関数（GASエディタから実行用）
// ========================================
function myFunction() {
  // テスト用のJSONデータ
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
    flows: [
      { from: "T1", to: "T2" }
    ]
  };

  // BPMN生成実行
  const result = generateBPMNPresentation(testData);

  if (result.success) {
    console.log("✅ 生成成功:", result.url);
  } else {
    console.log("❌ エラー:", result.error);
  }
}

// ========================================
// カラーパレット定義
// ========================================
const BPMN_COLORS = {
  // スイムレーン
  swimlane: {
    header: '#00acc1',      // ヘッダー背景
    headerText: '#ffffff',  // ヘッダーテキスト
    lane1: '#ffffff',       // レーン背景（奇数）
    lane2: '#f5f5f5',       // レーン背景（偶数）
    border: '#e0e0e0'       // 境界線
  },
  // BPMN要素
  elements: {
    task: '#e3f2fd',        // タスク背景
    gateway: '#fff3e0',     // ゲートウェイ背景
    event: '#f3e5f5',       // イベント背景
    system: '#e8f5e9',      // システムタスク背景
    error: '#ffebee'        // エラーイベント背景
  },
  // フロー
  flows: {
    normal: '#424242',      // 通常フロー
    conditional: '#ff6f00', // 条件付きフロー
    error: '#d32f2f'        // エラーフロー
  }
};

// ========================================
// レイアウト設定
// ========================================
const LAYOUT_CONFIG = {
  horizontal: {
    pageWidth: 720,
    pageHeight: 405,
    margin: 40,
    laneHeight: 80,
    headerWidth: 120,
    phaseWidth: 150,
    elementWidth: 100,
    elementHeight: 60,
    elementPadding: 10
  },
  vertical: {
    pageWidth: 720,
    pageHeight: 405,
    margin: 40,
    laneWidth: 150,
    headerHeight: 40,
    phaseHeight: 100,
    elementWidth: 100,
    elementHeight: 60,
    elementPadding: 10
  }
};

// ========================================
// メイン関数：プレゼンテーション生成
// ========================================
function generateBPMNPresentation(jsonData) {
  try {
    // JSON文字列の場合はパース
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // プレゼンテーション作成
    const presentation = SlidesApp.create(data.processInfo?.name || '業務フロー図');
    const slides = presentation.getSlides();

    // タイトルスライド作成
    createTitleSlide(slides[0], data);

    // スイムレーン図生成（横型・縦型）
    if (data.orientation === 'both' || data.orientation === 'horizontal') {
      const horizontalSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
      createHorizontalSwimLane(horizontalSlide, data);
    }

    if (data.orientation === 'both' || data.orientation === 'vertical') {
      const verticalSlide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
      createVerticalSwimLane(verticalSlide, data);
    }

    return {
      success: true,
      url: presentation.getUrl(),
      id: presentation.getId()
    };

  } catch (error) {
    console.error('Error generating BPMN presentation:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ========================================
// タイトルスライド作成
// ========================================
function createTitleSlide(slide, data) {
  // 背景色設定
  const background = slide.getBackground();
  const fill = background.getSolidFill();
  fill.getColor().setRgbColor(0, 172, 193); // #00acc1

  // タイトル
  const title = slide.insertTextBox(
    data.processInfo?.name || '業務フロー図',
    100, 150, 520, 60
  );
  title.getText().getTextStyle()
    .setFontSize(36)
    .setForegroundColor('#ffffff')
    .setBold(true);
  title.getText().getParagraphStyle()
    .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);

  // サブタイトル
  if (data.processInfo?.description) {
    const subtitle = slide.insertTextBox(
      data.processInfo.description,
      100, 220, 520, 40
    );
    subtitle.getText().getTextStyle()
      .setFontSize(18)
      .setForegroundColor('#ffffff');
    subtitle.getText().getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  }

  // 日付
  const date = slide.insertTextBox(
    new Date().toLocaleDateString('ja-JP'),
    100, 320, 520, 30
  );
  date.getText().getTextStyle()
    .setFontSize(14)
    .setForegroundColor('#ffffff');
  date.getText().getParagraphStyle()
    .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

// ========================================
// 横型スイムレーン作成
// ========================================
function createHorizontalSwimLane(slide, data) {
  const config = LAYOUT_CONFIG.horizontal;
  const actors = data.actors || [];
  const tasks = data.tasks || [];
  const gateways = data.gateways || [];
  const flows = data.flows || [];

  // スライドタイトル
  const slideTitle = slide.insertTextBox(
    '業務フロー図（横型）',
    config.margin, 10, config.pageWidth - config.margin * 2, 30
  );
  slideTitle.getText().getTextStyle()
    .setFontSize(20)
    .setBold(true);

  // フェーズ計算
  const phases = extractPhases(data);
  const contentWidth = config.headerWidth + (phases.length * config.phaseWidth);
  const startY = 50;

  // スイムレーンヘッダー（左側の部門名列）
  actors.forEach((actor, index) => {
    const y = startY + (index * config.laneHeight);

    // ヘッダー背景
    const header = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      config.margin, y, config.headerWidth, config.laneHeight
    );
    header.getFill().setSolidFill(BPMN_COLORS.swimlane.header);
    header.getBorder().setWeight(1)
      .getLineFill().setSolidFill(BPMN_COLORS.swimlane.border);

    // 部門名
    header.getText().setText(actor.name)
      .getTextStyle()
      .setForegroundColor(BPMN_COLORS.swimlane.headerText)
      .setBold(true)
      .setFontSize(14);
    header.getText().getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  });

  // フェーズヘッダー（上部）
  phases.forEach((phase, index) => {
    const x = config.margin + config.headerWidth + (index * config.phaseWidth);

    const phaseHeader = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      x, startY - 25, config.phaseWidth, 25
    );
    phaseHeader.getFill().setSolidFill('#e0e0e0');
    phaseHeader.getBorder().setWeight(1)
      .getLineFill().setSolidFill(BPMN_COLORS.swimlane.border);

    phaseHeader.getText().setText(phase.name)
      .getTextStyle().setFontSize(12).setBold(true);
    phaseHeader.getText().getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  });

  // レーン背景
  actors.forEach((actor, index) => {
    const y = startY + (index * config.laneHeight);
    const bgColor = index % 2 === 0 ?
      BPMN_COLORS.swimlane.lane1 : BPMN_COLORS.swimlane.lane2;

    const lane = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      config.margin + config.headerWidth, y,
      phases.length * config.phaseWidth, config.laneHeight
    );
    lane.getFill().setSolidFill(bgColor);
    lane.getBorder().setWeight(1)
      .getLineFill().setSolidFill(BPMN_COLORS.swimlane.border);

    // フェーズ区切り線
    for (let i = 1; i < phases.length; i++) {
      const lineX = config.margin + config.headerWidth + (i * config.phaseWidth);
      slide.insertLine(
        SlidesApp.LineCategory.STRAIGHT,
        lineX, y, lineX, y + config.laneHeight
      ).setDashStyle(SlidesApp.DashStyle.DASH)
        .setWeight(1)
        .getLineFill().setSolidFill('#bdbdbd');
    }
  });

  // BPMN要素の配置
  const elementPositions = {};

  // タスク配置
  tasks.forEach(task => {
    const position = calculateElementPosition(
      task, actors, phases, config, 'horizontal'
    );
    const element = createTaskElement(slide, task, position);
    elementPositions[task.id] = position;
  });

  // ゲートウェイ配置
  gateways.forEach(gateway => {
    const position = calculateGatewayPosition(
      gateway, actors, tasks, config, 'horizontal'
    );
    const element = createGatewayElement(slide, gateway, position);
    elementPositions[gateway.id] = position;
  });

  // フロー（矢印）描画
  flows.forEach(flow => {
    drawFlow(slide, flow, elementPositions, config);
  });
}

// ========================================
// 縦型スイムレーン作成
// ========================================
function createVerticalSwimLane(slide, data) {
  const config = LAYOUT_CONFIG.vertical;
  const actors = data.actors || [];
  const tasks = data.tasks || [];
  const gateways = data.gateways || [];
  const flows = data.flows || [];

  // スライドタイトル
  const slideTitle = slide.insertTextBox(
    '業務フロー図（縦型）',
    config.margin, 10, config.pageWidth - config.margin * 2, 30
  );
  slideTitle.getText().getTextStyle()
    .setFontSize(20)
    .setBold(true);

  const startY = 50;

  // ヘッダー（部門名）
  const headerBg = slide.insertShape(
    SlidesApp.ShapeType.RECTANGLE,
    config.margin, startY,
    actors.length * config.laneWidth, config.headerHeight
  );
  headerBg.getFill().setSolidFill(BPMN_COLORS.swimlane.header);
  headerBg.getBorder().setWeight(1)
    .getLineFill().setSolidFill(BPMN_COLORS.swimlane.border);

  // 各部門のレーン
  actors.forEach((actor, index) => {
    const x = config.margin + (index * config.laneWidth);

    // 部門名
    const deptName = slide.insertTextBox(
      actor.name,
      x, startY, config.laneWidth, config.headerHeight
    );
    deptName.getText().getTextStyle()
      .setForegroundColor(BPMN_COLORS.swimlane.headerText)
      .setBold(true)
      .setFontSize(14);
    deptName.getText().getParagraphStyle()
      .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);

    // レーン背景
    const bgColor = index % 2 === 0 ?
      BPMN_COLORS.swimlane.lane1 : BPMN_COLORS.swimlane.lane2;

    const lane = slide.insertShape(
      SlidesApp.ShapeType.RECTANGLE,
      x, startY + config.headerHeight,
      config.laneWidth, 300
    );
    lane.getFill().setSolidFill(bgColor);
    lane.getBorder().setWeight(1)
      .getLineFill().setSolidFill(BPMN_COLORS.swimlane.border);
  });

  // BPMN要素の縦配置
  const elementPositions = {};
  let currentY = startY + config.headerHeight + 20;

  // タスクを時系列で配置
  tasks.forEach((task, index) => {
    const actorIndex = actors.findIndex(a => a.id === task.actor);
    if (actorIndex >= 0) {
      const x = config.margin + (actorIndex * config.laneWidth) +
                (config.laneWidth - config.elementWidth) / 2;
      const y = currentY;

      const position = { x, y, width: config.elementWidth, height: config.elementHeight };
      createTaskElement(slide, task, position);
      elementPositions[task.id] = position;

      if (index < tasks.length - 1) {
        currentY += config.elementHeight + 20;
      }
    }
  });

  // フロー描画（縦型用）
  flows.forEach(flow => {
    drawFlow(slide, flow, elementPositions, config);
  });
}

// ========================================
// BPMN要素作成関数
// ========================================
function createTaskElement(slide, task, position) {
  const shape = slide.insertShape(
    SlidesApp.ShapeType.ROUND_RECTANGLE,
    position.x, position.y, position.width, position.height
  );

  // タスクタイプによる色分け
  const bgColor = task.type === 'serviceTask' ?
    BPMN_COLORS.elements.system : BPMN_COLORS.elements.task;

  shape.getFill().setSolidFill(bgColor);
  shape.getBorder().setWeight(2)
    .getLineFill().setSolidFill('#1976d2');

  // タスク名
  shape.getText().setText(task.name)
    .getTextStyle().setFontSize(11).setBold(false);
  shape.getText().getParagraphStyle()
    .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);

  return shape;
}

function createGatewayElement(slide, gateway, position) {
  // ダイヤモンド形状（45度回転した正方形）
  const shape = slide.insertShape(
    SlidesApp.ShapeType.DIAMOND,
    position.x, position.y, position.width * 0.8, position.height * 0.8
  );

  shape.getFill().setSolidFill(BPMN_COLORS.elements.gateway);
  shape.getBorder().setWeight(2)
    .getLineFill().setSolidFill('#ff6f00');

  // ゲートウェイ名
  shape.getText().setText(gateway.name)
    .getTextStyle().setFontSize(9).setBold(true);
  shape.getText().getParagraphStyle()
    .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);

  return shape;
}

function drawFlow(slide, flow, elementPositions, config) {
  const fromPos = elementPositions[flow.from];
  const toPos = elementPositions[flow.to];

  if (!fromPos || !toPos) return;

  // 開始点と終了点を計算
  const startX = fromPos.x + fromPos.width;
  const startY = fromPos.y + fromPos.height / 2;
  const endX = toPos.x;
  const endY = toPos.y + toPos.height / 2;

  // 矢印描画
  const line = slide.insertLine(
    SlidesApp.LineCategory.STRAIGHT,
    startX, startY, endX, endY
  );

  // 条件付きフローの場合は色を変更
  const flowColor = flow.condition ?
    BPMN_COLORS.flows.conditional : BPMN_COLORS.flows.normal;

  line.setWeight(2)
    .getLineFill().setSolidFill(flowColor);
  line.setEndArrowStyle(SlidesApp.ArrowStyle.FILLED_ARROW);

  // 条件ラベル
  if (flow.condition) {
    const labelX = (startX + endX) / 2 - 30;
    const labelY = (startY + endY) / 2 - 10;

    const label = slide.insertTextBox(
      flow.condition,
      labelX, labelY, 60, 20
    );
    label.getText().getTextStyle()
      .setFontSize(9)
      .setForegroundColor(flowColor);
  }
}

// ========================================
// ヘルパー関数
// ========================================
function extractPhases(data) {
  // データからフェーズを抽出または自動生成
  if (data.phases && data.phases.length > 0) {
    return data.phases;
  }

  // デフォルトフェーズ
  return [
    { id: 'phase1', name: '受付', order: 1 },
    { id: 'phase2', name: '処理', order: 2 },
    { id: 'phase3', name: '完了', order: 3 }
  ];
}

function calculateElementPosition(task, actors, phases, config, orientation) {
  const actorIndex = actors.findIndex(a => a.id === task.actor);
  const phaseIndex = task.phase ?
    phases.findIndex(p => p.id === task.phase) : 0;

  if (orientation === 'horizontal') {
    const x = config.margin + config.headerWidth +
              (phaseIndex * config.phaseWidth) +
              (config.phaseWidth - config.elementWidth) / 2;
    const y = 50 + (actorIndex * config.laneHeight) +
              (config.laneHeight - config.elementHeight) / 2;

    return { x, y, width: config.elementWidth, height: config.elementHeight };
  } else {
    // 縦型の場合の位置計算
    const x = config.margin + (actorIndex * config.laneWidth) +
              (config.laneWidth - config.elementWidth) / 2;
    const y = 90 + (phaseIndex * config.phaseHeight);

    return { x, y, width: config.elementWidth, height: config.elementHeight };
  }
}

function calculateGatewayPosition(gateway, actors, tasks, config, orientation) {
  // ゲートウェイの位置を関連タスクから計算
  const relatedTasks = tasks.filter(t =>
    t.id === gateway.from || t.id === gateway.to
  );

  if (relatedTasks.length > 0) {
    const task = relatedTasks[0];
    const actorIndex = actors.findIndex(a => a.id === task.actor);

    if (orientation === 'horizontal') {
      const x = config.margin + config.headerWidth + config.phaseWidth + 20;
      const y = 50 + (actorIndex * config.laneHeight) +
                (config.laneHeight - config.elementHeight) / 2;

      return { x, y, width: config.elementWidth * 0.8, height: config.elementHeight * 0.8 };
    }
  }

  // デフォルト位置
  return { x: 200, y: 200, width: 60, height: 60 };
}

// ========================================
// テスト用関数
// ========================================
function testBPMNGeneration() {
  const testData = {
    "processInfo": {
      "name": "受注処理フロー",
      "description": "顧客注文から出荷までの標準プロセス",
      "version": "1.0"
    },
    "orientation": "both",
    "actors": [
      { "id": "A1", "name": "営業部", "type": "department" },
      { "id": "A2", "name": "倉庫", "type": "department" },
      { "id": "A3", "name": "購買部", "type": "department" }
    ],
    "phases": [
      { "id": "phase1", "name": "受注", "order": 1 },
      { "id": "phase2", "name": "在庫確認", "order": 2 },
      { "id": "phase3", "name": "出荷/発注", "order": 3 }
    ],
    "tasks": [
      { "id": "T1", "name": "注文受付", "actor": "A1", "type": "userTask", "phase": "phase1" },
      { "id": "T2", "name": "与信チェック", "actor": "A1", "type": "userTask", "phase": "phase1" },
      { "id": "T3", "name": "在庫確認", "actor": "A2", "type": "serviceTask", "phase": "phase2" },
      { "id": "T4", "name": "出荷処理", "actor": "A2", "type": "userTask", "phase": "phase3" },
      { "id": "T5", "name": "発注依頼", "actor": "A3", "type": "userTask", "phase": "phase3" }
    ],
    "gateways": [
      {
        "id": "G1",
        "name": "在庫有無",
        "type": "exclusive",
        "actor": "A2"
      }
    ],
    "flows": [
      { "from": "T1", "to": "T2" },
      { "from": "T2", "to": "T3" },
      { "from": "T3", "to": "G1" },
      { "from": "G1", "to": "T4", "condition": "在庫あり" },
      { "from": "G1", "to": "T5", "condition": "在庫なし" }
    ]
  };

  const result = generateBPMNPresentation(testData);
  console.log('Generation result:', result);
  return result;
}