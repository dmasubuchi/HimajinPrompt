/**
 * BPMN Gemini Dialogue System
 * ひまじん式BPMN - Gemini対話型アシスタント
 *
 * @version 1.0.0
 * @author ひまじん
 * @description 自然な会話から業務フローを抽出しJSON生成
 */

// ========================================
// Gemini API設定
// ========================================
const GEMINI_CONFIG = {
  apiKey: PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY'),
  model: 'gemini-pro',
  temperature: 0.7,
  maxOutputTokens: 2048
};

// ========================================
// システムプロンプト
// ========================================
const SYSTEM_PROMPT = `
# ひまじん式BPMN - 業務フロー聞き取りアシスタント

あなたは優秀なビジネスアナリストです。
ユーザーから業務フローを聞き取り、最終的にBPMNスイムレーン図用のJSONを生成します。

## あなたの役割
1. 自然な会話でヒアリング（堅苦しくない、絵文字で親しみやすく）
2. 不足情報を察知して質問
3. 曖昧な部分を明確化
4. 最終的にJSON出力

## ヒアリングの流れ

### Phase 1: 初期ヒアリング（必須情報）
- プロセス名
- 関係者（部門/役職）
- 大まかな流れ

### Phase 2: 詳細確認（自動判断）
- 判定ポイント
- システム利用
- 例外処理

### Phase 3: JSON生成
- 確認と修正
- JSON出力

## 会話のコツ
- 「〜ということですね？」と確認
- 「他には〜はありますか？」と網羅性確認
- 専門用語を避けて平易な言葉で

## 重要ルール
- ユーザーが急いでいる場合は最小限の質問で
- 詳細を求められたら深掘り
- 常に具体例を示す
- BPMNやスイムレーンという専門用語は使わない

## JSON出力フォーマット
必ず以下の構造でJSON生成：
{
  "processInfo": {...},
  "actors": [...],
  "tasks": [...],
  "gateways": [...],
  "flows": [...]
}
`;

// ========================================
// 対話セッション管理
// ========================================
class DialogueSession {
  constructor() {
    this.sessionId = Utilities.getUuid();
    this.messages = [];
    this.collectedInfo = {
      processName: null,
      actors: [],
      tasks: [],
      gateways: [],
      flows: []
    };
    this.phase = 1;
  }

  addMessage(role, content) {
    this.messages.push({
      role: role,
      content: content,
      timestamp: new Date().toISOString()
    });
  }

  getContext() {
    return this.messages.slice(-10); // 最新10件のコンテキストを保持
  }

  updateCollectedInfo(info) {
    Object.assign(this.collectedInfo, info);
  }
}

// ========================================
// Gemini API呼び出し
// ========================================
function callGeminiAPI(prompt, context = []) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          ...context.map(msg => ({ text: `${msg.role}: ${msg.content}` })),
          { text: `User: ${prompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: GEMINI_CONFIG.temperature,
      maxOutputTokens: GEMINI_CONFIG.maxOutputTokens
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.candidates && result.candidates[0]) {
      return result.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from Gemini');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'すみません、エラーが発生しました。もう一度お試しください。';
  }
}

// ========================================
// 対話型ヒアリング関数
// ========================================
function startDialogue(initialInput = '') {
  const session = new DialogueSession();

  // 初期メッセージ
  const greeting = initialInput ?
    `${initialInput}のフローを作成しますね！📝\nまず、このプロセスに関わる部門や担当者を教えてください。\n例えば「営業部、倉庫、経理部」のような感じで。` :
    `こんにちは！業務フローの作成をお手伝いします。😊\nどのようなプロセスのフローを作りたいですか？`;

  session.addMessage('assistant', greeting);
  return {
    sessionId: session.sessionId,
    message: greeting,
    phase: session.phase
  };
}

// ========================================
// ユーザー入力の処理
// ========================================
function processUserInput(sessionId, userInput) {
  // セッションの復元（実際の実装では永続化が必要）
  const session = getSession(sessionId);

  session.addMessage('user', userInput);

  // フェーズに応じた処理
  let response = '';

  switch (session.phase) {
    case 1: // 初期ヒアリング
      response = handlePhase1(session, userInput);
      break;
    case 2: // 詳細確認
      response = handlePhase2(session, userInput);
      break;
    case 3: // JSON生成前の最終確認
      response = handlePhase3(session, userInput);
      break;
    case 4: // JSON出力
      response = generateFinalJSON(session);
      break;
  }

  session.addMessage('assistant', response);

  return {
    sessionId: session.sessionId,
    message: response,
    phase: session.phase,
    isComplete: session.phase === 4
  };
}

// ========================================
// フェーズ別処理関数
// ========================================
function handlePhase1(session, input) {
  // 関係者の抽出
  const actors = extractActorsFromText(input);

  if (actors.length === 0) {
    return '部門や担当者が分からなかったです。😅\n「営業」「倉庫」「経理」のような部門名を教えてください。';
  }

  session.updateCollectedInfo({ actors });

  // 次の質問へ
  const response = `${actors.map(a => a.name).join('、')}が関わるんですね。✅\n\nでは、簡単に流れを教えてください。\n「営業が〜して、倉庫が〜する」という感じで大丈夫です！`;

  session.phase = 2;
  return response;
}

function handlePhase2(session, input) {
  // タスクとフローの抽出
  const taskData = extractTasksFromText(input, session.collectedInfo.actors);

  if (taskData.tasks.length === 0) {
    return 'すみません、作業の流れがよく分かりませんでした。😅\n「誰が何をするか」をもう少し具体的に教えていただけますか？';
  }

  session.updateCollectedInfo(taskData);

  // 判定ポイントの確認
  const response = `なるほど！整理すると：\n${formatTaskList(taskData.tasks)}\n\nここで確認ですが、**判断が必要な場面**はありますか？\n例：在庫の有無、金額チェック、承認など`;

  return response;
}

function handlePhase3(session, input) {
  // 判定ポイントの処理
  const gateways = extractGatewaysFromText(input);

  if (gateways.length > 0) {
    session.updateCollectedInfo({ gateways });

    // 条件分岐の詳細を確認
    return `${gateways[0].name}での判断があるんですね。📊\n\n「${gateways[0].name}」の場合、どのような条件で分岐しますか？\n例：「在庫あり→出荷」「在庫なし→発注」`;
  }

  // 最終確認へ
  return generateConfirmation(session);
}

function generateConfirmation(session) {
  const info = session.collectedInfo;

  const confirmation = `
【最終確認】
━━━━━━━━━━━━━━━━━━
📋 プロセス: ${info.processName || '業務処理フロー'}

👥 関係者:
${info.actors.map(a => `• ${a.name}`).join('\n')}

📍 フロー:
${info.tasks.map((t, i) => `${i + 1}. [${getActorName(info.actors, t.actor)}] ${t.name}`).join('\n')}

${info.gateways.length > 0 ? `\n🔀 判断ポイント:\n${info.gateways.map(g => `• ${g.name}`).join('\n')}` : ''}
━━━━━━━━━━━━━━━━━━

このまま進めてよろしいですか？
「OK」「はい」「了解」で図を生成します。
追加・修正があれば教えてください。`;

  session.phase = 4;
  return confirmation;
}

// ========================================
// JSON生成
// ========================================
function generateFinalJSON(session) {
  const info = session.collectedInfo;

  const jsonData = {
    processInfo: {
      name: info.processName || '業務処理フロー',
      version: '1.0',
      generatedAt: new Date().toISOString(),
      inputMethod: 'dialogue'
    },
    orientation: 'both',
    actors: info.actors,
    tasks: info.tasks,
    gateways: info.gateways,
    flows: generateFlows(info.tasks, info.gateways)
  };

  // BPMNプレゼンテーション生成を呼び出し
  const result = generateBPMNPresentation(jsonData);

  if (result.success) {
    return `
✅ 業務フロー図を生成しました！

📊 スライドURL:
${result.url}

生成された内容：
- タイトルスライド
- 横型フロー図（部門を横に配置）
- 縦型フロー図（時系列を縦に配置）

\`\`\`json
${JSON.stringify(jsonData, null, 2)}
\`\`\`

ご確認ください。修正が必要な場合はお申し付けください。`;
  } else {
    return '申し訳ございません。図の生成中にエラーが発生しました。もう一度お試しください。';
  }
}

// ========================================
// テキスト解析ヘルパー関数
// ========================================
function extractActorsFromText(text) {
  const actors = [];
  const patterns = [
    /([^、。\s]+?)(部|課|室|チーム|担当|センター)/g,
    /([^、。\s]+?)(さん|氏|様)/g
  ];

  let idCounter = 1;
  const found = new Set();

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1] + match[2];
      if (!found.has(name)) {
        found.add(name);
        actors.push({
          id: `A${idCounter++}`,
          name: name,
          type: 'department'
        });
      }
    }
  });

  // カンマ区切りの部門名も処理
  if (actors.length === 0) {
    const parts = text.split(/[、,]/);
    parts.forEach(part => {
      const cleaned = part.trim();
      if (cleaned && cleaned.length < 20) {
        actors.push({
          id: `A${idCounter++}`,
          name: cleaned,
          type: 'department'
        });
      }
    });
  }

  return actors;
}

function extractTasksFromText(text, actors) {
  const tasks = [];
  const flows = [];
  const patterns = [
    /(.+?)が(.+?)[。、\n]/g,
    /(.+?)で(.+?)[。、\n]/g,
    /(.+?)は(.+?)[。、\n]/g
  ];

  let taskId = 1;
  let previousTaskId = null;

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const actorPart = match[1].trim();
      const taskPart = match[2].trim();

      // アクターを特定
      const actor = actors.find(a =>
        a.name.includes(actorPart) || actorPart.includes(a.name)
      );

      if (actor && taskPart.length > 2 && taskPart.length < 50) {
        const currentTaskId = `T${taskId}`;
        tasks.push({
          id: currentTaskId,
          name: taskPart,
          actor: actor.id,
          type: 'userTask'
        });

        // フローを追加
        if (previousTaskId) {
          flows.push({
            from: previousTaskId,
            to: currentTaskId
          });
        }

        previousTaskId = currentTaskId;
        taskId++;
      }
    }
  });

  return { tasks, flows };
}

function extractGatewaysFromText(text) {
  const gateways = [];
  const keywords = ['確認', '判断', '判定', 'チェック', '有無', '可否', 'あり', 'なし', '承認'];

  let gatewayId = 1;

  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      // キーワードの前後から判定名を抽出
      const pattern = new RegExp(`([^、。\\s]*${keyword}[^、。\\s]*)`, 'g');
      const matches = text.match(pattern);

      if (matches) {
        matches.forEach(match => {
          if (match.length > 2 && match.length < 20) {
            gateways.push({
              id: `G${gatewayId++}`,
              name: match,
              type: 'exclusive'
            });
          }
        });
      }
    }
  });

  return gateways;
}

function generateFlows(tasks, gateways) {
  const flows = [];

  // START -> 最初のタスク
  if (tasks.length > 0) {
    flows.push({
      from: 'START',
      to: tasks[0].id
    });
  }

  // タスク間のフロー
  for (let i = 0; i < tasks.length - 1; i++) {
    // ゲートウェイがある場合は経由
    if (gateways.length > 0 && i === Math.floor(tasks.length / 2)) {
      flows.push({
        from: tasks[i].id,
        to: gateways[0].id
      });
      flows.push({
        from: gateways[0].id,
        to: tasks[i + 1].id,
        condition: '条件1'
      });
    } else {
      flows.push({
        from: tasks[i].id,
        to: tasks[i + 1].id
      });
    }
  }

  // 最後のタスク -> END
  if (tasks.length > 0) {
    flows.push({
      from: tasks[tasks.length - 1].id,
      to: 'END'
    });
  }

  return flows;
}

// ========================================
// ユーティリティ関数
// ========================================
function formatTaskList(tasks) {
  return tasks.map((task, index) => {
    const actorName = getActorNameFromId(task.actor);
    return `${index + 1}. [${actorName}] ${task.name}`;
  }).join('\n');
}

function getActorName(actors, actorId) {
  const actor = actors.find(a => a.id === actorId);
  return actor ? actor.name : '不明';
}

function getActorNameFromId(actorId) {
  // 実際の実装ではセッションから取得
  return actorId;
}

// ========================================
// セッション管理（簡易版）
// ========================================
const sessions = {};

function getSession(sessionId) {
  return sessions[sessionId] || new DialogueSession();
}

function saveSession(session) {
  sessions[session.sessionId] = session;
}

// ========================================
// Webアプリケーション用エンドポイント
// ========================================
function doGet() {
  return HtmlService.createHtmlOutputFromFile('dialogue-ui')
    .setTitle('ひまじん式BPMN対話システム')
    .setWidth(800)
    .setHeight(600);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'start') {
    return ContentService.createTextOutput(
      JSON.stringify(startDialogue(data.initialInput))
    ).setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'continue') {
    return ContentService.createTextOutput(
      JSON.stringify(processUserInput(data.sessionId, data.input))
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Invalid action' })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// テスト関数
// ========================================
function testDialogue() {
  // 対話開始
  const start = startDialogue('受注処理');
  console.log('Start:', start);

  // ユーザー入力1
  const response1 = processUserInput(start.sessionId, '営業部、倉庫、購買部が関わります');
  console.log('Response 1:', response1);

  // ユーザー入力2
  const response2 = processUserInput(start.sessionId, '営業が注文を受けて、倉庫が在庫を確認して、あれば出荷します');
  console.log('Response 2:', response2);

  // ユーザー入力3
  const response3 = processUserInput(start.sessionId, '在庫の有無で判断します');
  console.log('Response 3:', response3);

  // 最終確認
  const response4 = processUserInput(start.sessionId, 'OK');
  console.log('Final:', response4);

  return response4;
}