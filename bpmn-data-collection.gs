/**
 * BPMN Data Collection System
 * ひまじん式BPMN - 段階的情報収集システム
 *
 * @version 1.0.0
 * @author ひまじん
 * @description 業務フロー情報の構造化収集と自動JSON生成
 */

// ========================================
// 情報収集レベル定義
// ========================================
const COLLECTION_LEVELS = {
  QUICK: 1,      // 5分ヒアリング
  STANDARD: 2,   // 30分ヒアリング
  DETAILED: 3    // 2時間ワークショップ
};

// ========================================
// Googleフォーム作成：段階的情報収集
// ========================================
function createBPMNCollectionForm() {
  const form = FormApp.create('業務フロー情報収集フォーム');

  // フォームの説明
  form.setDescription(
    '業務フローを可視化するための情報を段階的に収集します。\n' +
    '必須項目（レベル1）だけでも基本的なフロー図が生成可能です。'
  );

  // ========== レベル1: 基本情報（必須） ==========
  form.addSectionHeaderItem()
    .setTitle('📝 基本情報（必須）')
    .setHelpText('最小限必要な情報です（約5分）');

  // プロセス名
  form.addTextItem()
    .setTitle('プロセス名')
    .setHelpText('例：受注処理フロー、経費精算プロセス')
    .setRequired(true);

  // プロセスの説明
  form.addParagraphTextItem()
    .setTitle('プロセスの概要')
    .setHelpText('このプロセスが何を行うか簡単に説明してください')
    .setRequired(true);

  // 開始と終了
  const scopeGrid = form.addGridItem()
    .setTitle('プロセスの範囲')
    .setRows(['開始点', '終了点'])
    .setColumns(['何から始まる？/何で終わる？'])
    .setRequired(true);

  // 関係者
  form.addParagraphTextItem()
    .setTitle('誰が関わりますか？')
    .setHelpText('部門や担当者を箇条書きで記入\n例：\n・営業部\n・倉庫\n・経理部')
    .setRequired(true);

  // 主な流れ
  form.addParagraphTextItem()
    .setTitle('主な流れを教えてください')
    .setHelpText(
      '誰が何をするか箇条書きで記入\n' +
      '例：\n' +
      '1. 営業が注文を受ける\n' +
      '2. 倉庫が在庫を確認する\n' +
      '3. 在庫があれば出荷する\n' +
      '4. なければ発注する'
    )
    .setRequired(true);

  // 判断ポイント
  form.addParagraphTextItem()
    .setTitle('判断が必要な場面はありますか？')
    .setHelpText(
      '例：\n' +
      '・在庫の有無\n' +
      '・金額による承認\n' +
      '・与信チェック'
    )
    .setRequired(false);

  // ========== レベル2: 詳細情報（任意） ==========
  form.addPageBreakItem()
    .setTitle('詳細情報（任意）')
    .setHelpText('より詳しいフロー図を作成する場合にご記入ください（約30分）');

  form.addSectionHeaderItem()
    .setTitle('📊 レベル2: 詳細情報');

  // 各ステップの詳細
  form.addGridItem()
    .setTitle('各ステップの詳細')
    .setHelpText('主要なステップについて詳細を記入してください')
    .setRows(['ステップ1', 'ステップ2', 'ステップ3', 'ステップ4', 'ステップ5'])
    .setColumns(['作業内容', '担当者/部門', '使用システム', '所要時間', '必要な情報/書類']);

  // システム利用
  form.addCheckboxItem()
    .setTitle('使用するシステム')
    .setChoices([
      'SAP',
      'Salesforce',
      'Excel',
      'メール',
      'チャットツール',
      'ワークフロー',
      'その他'
    ]);

  // 例外処理
  form.addParagraphTextItem()
    .setTitle('例外やエラーが発生する場合')
    .setHelpText(
      '例：\n' +
      '・与信エラー → マネージャー承認\n' +
      '・在庫不足 → 代替品提案\n' +
      '・システムエラー → 手動処理'
    );

  // ========== レベル3: 完全情報（任意） ==========
  form.addPageBreakItem()
    .setTitle('完全情報（任意）')
    .setHelpText('最も詳細なフロー図を作成する場合（約2時間）');

  form.addSectionHeaderItem()
    .setTitle('🎯 レベル3: 完全情報');

  // KPI/メトリクス
  form.addGridItem()
    .setTitle('測定指標（KPI）')
    .setRows(['処理時間', '処理件数', 'エラー率', '顧客満足度'])
    .setColumns(['現状値', '目標値', '測定方法']);

  // 改善ポイント
  form.addParagraphTextItem()
    .setTitle('現在の課題や改善したい点')
    .setHelpText('As-Is（現状）とTo-Be（理想）の違いを記載');

  // ビジネスルール
  form.addParagraphTextItem()
    .setTitle('ビジネスルール・制約事項')
    .setHelpText(
      '例：\n' +
      '・100万円以上は部長承認必須\n' +
      '・月末は処理を3日以内に完了\n' +
      '・特定顧客は優先処理'
    );

  // 提出者情報
  form.addSectionHeaderItem()
    .setTitle('👤 提出者情報');

  form.addTextItem()
    .setTitle('お名前')
    .setRequired(true);

  form.addTextItem()
    .setTitle('部署')
    .setRequired(true);

  form.addTextItem()
    .setTitle('メールアドレス')
    .setValidation(FormApp.createTextValidation()
      .requireTextIsEmail()
      .build())
    .setRequired(true);

  // フォーム送信時のトリガー設定
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  return form;
}

// ========================================
// フォーム送信時の処理
// ========================================
function onFormSubmit(e) {
  try {
    const responses = e.response.getItemResponses();
    const formData = {};

    // レスポンスをキーバリュー形式に変換
    responses.forEach(response => {
      formData[response.getItem().getTitle()] = response.getResponse();
    });

    // 情報レベルを判定
    const level = determineCollectionLevel(formData);

    // JSONデータ生成
    const jsonData = convertFormToJSON(formData, level);

    // BPMNプレゼンテーション生成
    const result = generateBPMNPresentation(jsonData);

    // 結果をメール送信
    if (result.success && formData['メールアドレス']) {
      sendResultEmail(formData['メールアドレス'], formData['お名前'], result.url);
    }

    // スプレッドシートに記録
    logToSpreadsheet(formData, jsonData, result);

  } catch (error) {
    console.error('Error processing form submission:', error);
  }
}

// ========================================
// フォームデータからJSON変換
// ========================================
function convertFormToJSON(formData, level) {
  const jsonData = {
    processInfo: {
      name: formData['プロセス名'] || '業務フロー',
      description: formData['プロセスの概要'] || '',
      version: '1.0',
      createdAt: new Date().toISOString(),
      author: formData['お名前'] || 'Unknown',
      department: formData['部署'] || '',
      inputLevel: level
    },
    orientation: 'both',  // 横型・縦型両方生成
    actors: [],
    tasks: [],
    gateways: [],
    flows: []
  };

  // 関係者の解析
  if (formData['誰が関わりますか？']) {
    const actors = parseActors(formData['誰が関わりますか？']);
    jsonData.actors = actors;
  }

  // 主な流れの解析
  if (formData['主な流れを教えてください']) {
    const flowData = parseMainFlow(formData['主な流れを教えてください'], jsonData.actors);
    jsonData.tasks = flowData.tasks;
    jsonData.flows = flowData.flows;
  }

  // 判断ポイントの解析
  if (formData['判断が必要な場面はありますか？']) {
    const gateways = parseGateways(formData['判断が必要な場面はありますか？']);
    jsonData.gateways = gateways;
  }

  // レベル2以上の詳細情報を追加
  if (level >= COLLECTION_LEVELS.STANDARD) {
    enhanceWithDetailedInfo(jsonData, formData);
  }

  // レベル3の完全情報を追加
  if (level >= COLLECTION_LEVELS.DETAILED) {
    enhanceWithCompleteInfo(jsonData, formData);
  }

  return jsonData;
}

// ========================================
// パース関数群
// ========================================
function parseActors(actorsText) {
  const actors = [];
  const lines = actorsText.split('\n');

  lines.forEach((line, index) => {
    const cleanLine = line.replace(/^[・\-\*\d\.]+\s*/, '').trim();
    if (cleanLine) {
      actors.push({
        id: `A${index + 1}`,
        name: cleanLine,
        type: 'department'
      });
    }
  });

  return actors;
}

function parseMainFlow(flowText, actors) {
  const tasks = [];
  const flows = [];
  const lines = flowText.split('\n');

  lines.forEach((line, index) => {
    const cleanLine = line.replace(/^[\d\.]+\s*/, '').trim();
    if (cleanLine) {
      // アクターと作業を抽出
      const match = cleanLine.match(/(.+?)が(.+)/);
      if (match) {
        const actorName = match[1].trim();
        const taskName = match[2].trim();

        // アクターIDを検索
        const actor = actors.find(a => a.name.includes(actorName));
        const actorId = actor ? actor.id : 'A1';

        const taskId = `T${index + 1}`;
        tasks.push({
          id: taskId,
          name: taskName,
          actor: actorId,
          type: 'userTask'
        });

        // フローを追加（前のタスクから現在のタスクへ）
        if (index > 0) {
          flows.push({
            from: `T${index}`,
            to: taskId
          });
        }
      }
    }
  });

  return { tasks, flows };
}

function parseGateways(gatewayText) {
  const gateways = [];
  const lines = gatewayText.split('\n');

  lines.forEach((line, index) => {
    const cleanLine = line.replace(/^[・\-\*]+\s*/, '').trim();
    if (cleanLine) {
      gateways.push({
        id: `G${index + 1}`,
        name: cleanLine,
        type: 'exclusive'
      });
    }
  });

  return gateways;
}

// ========================================
// 情報レベル判定
// ========================================
function determineCollectionLevel(formData) {
  // 記入されたフィールド数でレベルを判定
  let filledFields = 0;
  let totalFields = 0;

  for (const key in formData) {
    totalFields++;
    if (formData[key] && formData[key].toString().trim() !== '') {
      filledFields++;
    }
  }

  const fillRate = filledFields / totalFields;

  if (fillRate > 0.8) {
    return COLLECTION_LEVELS.DETAILED;
  } else if (fillRate > 0.5) {
    return COLLECTION_LEVELS.STANDARD;
  } else {
    return COLLECTION_LEVELS.QUICK;
  }
}

// ========================================
// 詳細情報の追加
// ========================================
function enhanceWithDetailedInfo(jsonData, formData) {
  // ステップ詳細の追加
  if (formData['各ステップの詳細']) {
    // GridItemのレスポンス処理
    const stepDetails = formData['各ステップの詳細'];
    if (Array.isArray(stepDetails)) {
      stepDetails.forEach((row, index) => {
        if (jsonData.tasks[index]) {
          jsonData.tasks[index].details = {
            description: row[0] || '',
            system: row[2] || '',
            duration: row[3] || '',
            inputs: row[4] ? [row[4]] : []
          };
        }
      });
    }
  }

  // システム情報の追加
  if (formData['使用するシステム']) {
    jsonData.systems = Array.isArray(formData['使用するシステム']) ?
      formData['使用するシステム'] : [formData['使用するシステム']];
  }

  // 例外処理の追加
  if (formData['例外やエラーが発生する場合']) {
    jsonData.exceptions = parseExceptions(formData['例外やエラーが発生する場合']);
  }
}

function enhanceWithCompleteInfo(jsonData, formData) {
  // KPI情報の追加
  if (formData['測定指標（KPI）']) {
    jsonData.kpis = formData['測定指標（KPI）'];
  }

  // 改善ポイントの追加
  if (formData['現在の課題や改善したい点']) {
    jsonData.improvements = formData['現在の課題や改善したい点'];
  }

  // ビジネスルールの追加
  if (formData['ビジネスルール・制約事項']) {
    jsonData.businessRules = parseBusinessRules(formData['ビジネスルール・制約事項']);
  }
}

function parseExceptions(exceptionText) {
  const exceptions = [];
  const lines = exceptionText.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/(.+?)→(.+)/);
    if (match) {
      exceptions.push({
        id: `EXC${index + 1}`,
        name: match[1].trim(),
        action: match[2].trim()
      });
    }
  });

  return exceptions;
}

function parseBusinessRules(rulesText) {
  const rules = [];
  const lines = rulesText.split('\n');

  lines.forEach(line => {
    const cleanLine = line.replace(/^[・\-\*]+\s*/, '').trim();
    if (cleanLine) {
      rules.push(cleanLine);
    }
  });

  return rules;
}

// ========================================
// 結果のメール送信
// ========================================
function sendResultEmail(email, name, presentationUrl) {
  const subject = '業務フロー図が生成されました';
  const body = `
${name} 様

ご提出いただいた情報から業務フロー図を生成しました。

プレゼンテーションURL:
${presentationUrl}

このリンクから生成されたスライドをご確認いただけます。
- 1ページ目：タイトルスライド
- 2ページ目：横型スイムレーン図
- 3ページ目：縦型スイムレーン図

ご不明な点がございましたら、お気軽にお問い合わせください。

---
ひまじん式BPMN自動生成システム
  `;

  GmailApp.sendEmail(email, subject, body);
}

// ========================================
// スプレッドシートへのログ記録
// ========================================
function logToSpreadsheet(formData, jsonData, result) {
  // ログ用スプレッドシートを取得または作成
  let spreadsheet;
  const files = DriveApp.getFilesByName('BPMN生成ログ');

  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    spreadsheet = SpreadsheetApp.create('BPMN生成ログ');
    const sheet = spreadsheet.getActiveSheet();
    sheet.getRange(1, 1, 1, 7).setValues([[
      '日時', '作成者', '部署', 'プロセス名', 'レベル', 'URL', 'JSON'
    ]]);
  }

  const sheet = spreadsheet.getActiveSheet();
  const lastRow = sheet.getLastRow();

  sheet.getRange(lastRow + 1, 1, 1, 7).setValues([[
    new Date(),
    formData['お名前'] || '',
    formData['部署'] || '',
    jsonData.processInfo.name,
    jsonData.processInfo.inputLevel,
    result.url || '',
    JSON.stringify(jsonData)
  ]]);
}

// ========================================
// テスト関数
// ========================================
function testFormCreation() {
  const form = createBPMNCollectionForm();
  console.log('Form created:', form.getPublishedUrl());
  return form.getPublishedUrl();
}