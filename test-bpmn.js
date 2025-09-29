const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. ページにアクセス...');
  await page.goto('https://script.google.com/macros/s/AKfycbxIJ3527rM2-poz7e3Ko1nACa7_wXx0tNXjB22ECpofF3JlM_6jCc6e_j17VSAbFAo3/exec');

  // ページの読み込みを待つ
  await page.waitForTimeout(3000);

  console.log('2. ページのスクリーンショットを撮影...');
  await page.screenshot({ path: 'page-loaded.png' });

  // ページの内容を確認
  console.log('3. ページタイトル:', await page.title());

  // body内のテキストを取得
  const bodyText = await page.textContent('body');
  console.log('4. ページ内容（最初の500文字）:', bodyText.substring(0, 500));

  // フォーム要素を探す
  try {
    // JSONテキストエリアを探す
    const textareaExists = await page.locator('textarea').count();
    console.log('5. テキストエリアの数:', textareaExists);

    if (textareaExists > 0) {
      console.log('6. JSONを入力...');
      const testJson = {
        "processInfo": {"name": "Playwrightテスト"},
        "actors": [
          {"id": "A1", "name": "テスト部門1"},
          {"id": "A2", "name": "テスト部門2"}
        ],
        "tasks": [
          {"id": "T1", "name": "タスク1", "actor": "A1"},
          {"id": "T2", "name": "タスク2", "actor": "A2"}
        ],
        "flows": [
          {"from": "T1", "to": "T2"}
        ]
      };

      // 最初のテキストエリアにJSON入力
      await page.locator('textarea').first().fill(JSON.stringify(testJson, null, 2));

      console.log('7. 入力後のスクリーンショット...');
      await page.screenshot({ path: 'after-input.png' });

      // ボタンを探す
      const buttons = await page.locator('button').all();
      console.log('8. ボタンの数:', buttons.length);

      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        console.log(`   ボタン${i + 1}: "${buttonText}"`);
      }

      // 生成ボタンを探してクリック
      const generateButton = page.locator('button:has-text("生成"), button:has-text("スライド生成"), button:has-text("Generate")').first();
      const generateButtonExists = await generateButton.count();

      if (generateButtonExists > 0) {
        console.log('9. 生成ボタンをクリック...');
        await generateButton.click();

        // 結果を待つ
        console.log('10. 結果を待機中（10秒）...');
        await page.waitForTimeout(10000);

        // 結果のスクリーンショット
        await page.screenshot({ path: 'after-generate.png' });

        // 結果テキストを取得
        const resultText = await page.textContent('body');
        console.log('11. 生成後のページ内容（最初の1000文字）:', resultText.substring(0, 1000));

        // URLリンクを探す
        const links = await page.locator('a[href*="docs.google.com/presentation"]').all();
        console.log('12. プレゼンテーションリンクの数:', links.length);

        for (const link of links) {
          const href = await link.getAttribute('href');
          console.log('    生成されたURL:', href);
        }

        // エラーメッセージを探す
        const errorElements = await page.locator('*:has-text("error"), *:has-text("エラー"), *:has-text("Error")').all();
        if (errorElements.length > 0) {
          console.log('13. エラーメッセージが見つかりました:');
          for (const elem of errorElements) {
            console.log('    ', await elem.textContent());
          }
        }

      } else {
        console.log('9. 生成ボタンが見つかりません');
      }

    } else {
      console.log('6. テキストエリアが見つかりません');

      // ページ全体のHTMLを出力
      const html = await page.content();
      console.log('ページHTML（最初の2000文字）:', html.substring(0, 2000));
    }

  } catch (error) {
    console.error('エラー:', error);

    // エラー時のスクリーンショット
    await page.screenshot({ path: 'error-state.png' });
  }

  console.log('\n=== テスト完了 ===');
  console.log('スクリーンショットを確認してください:');
  console.log('- page-loaded.png: 初期画面');
  console.log('- after-input.png: JSON入力後');
  console.log('- after-generate.png: 生成ボタンクリック後');

  await browser.close();
})();