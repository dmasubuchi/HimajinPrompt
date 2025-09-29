/**
 * Web Application Entry Point
 * ひまじん式BPMN - シンプルWeb画面
 *
 * @description 本家まじん式と同様の簡単入力画面
 */

// ========================================
// Webアプリケーション表示
// ========================================
function doGet() {
  return HtmlService.createHtmlOutputFromFile('simple-ui')
    .setTitle('ひまじん式BPMN生成システム')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ========================================
// HTML画面から呼び出される関数
// ========================================
function generateBPMNPresentationFromWeb(jsonData) {
  try {
    // bpmn-swimlane.gsのメイン関数を呼び出し
    const result = generateBPMNPresentation(jsonData);

    // 成功時はJSONデータも返す（確認用）
    if (result.success) {
      result.jsonData = jsonData;
    }

    return result;

  } catch (error) {
    console.error('Error in generateBPMNPresentationFromWeb:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}