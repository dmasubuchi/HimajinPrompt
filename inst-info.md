BPMN swimlane diagramのツールのうち、テキスト形式（主にXMLやJSON）のインポート/エクスポートが可能で、LLM（例: ChatGPTやGemini）から生成したデータを制御しやすいものをピックアップします。これらはAPIやスクリプト経由でLLMの出力を直接取り込め、自動化しやすいのが特徴です。主に開発者向けですが、ブラウザ上で動くものも多く、LLMでBPMN XMLを生成してインポートするワークフローが実現可能です。以下で主なものを比較し、使い方を簡単に説明します。[1][2][3][4]

### おすすめツールの比較
以下は、テキストI/Oの対応度、LLM制御のしやすさ（APIの豊富さやスクリプト統合）、swimlane対応を基準にまとめました。[3][5][4][1]

| ツール/ライブラリ | テキストインポート/エクスポート | LLM制御のしやすさ | swimlane対応 | 備考 |
|-------------------|-------------------------------|-------------------|--------------|------|
| **bpmn-js** (JavaScriptライブラリ) | XML/JSON形式のインポート/エクスポート可能。APIで直接制御（例: importXML, saveXML）[3][6][4]。 | 非常に高い。PromiseベースのAPIでLLM生成のXMLを非同期インポート可能。Node.jsやブラウザでスクリプト化しやすく、LLM出力の自動処理に最適[4][7]。 | 完全対応（プール/レーンをサポート）[8][4]。 | 無料オープンソース。Webアプリに組み込みやすい。LLMでBPMN XMLを生成→インポート→レンダリングの流れがスムーズ[1][2]。 |
| **draw.io (Diagrams.net)** | テキスト（PlantUMLやCSV形式）からインポート可能。XMLエクスポートも標準[1][9]。 | 高い。APIやプラグインでLLM生成のテキストをインポート。ChatGPTでPlantUMLコードを作成して取り込みやすい[1]。 | 完全対応（ドラッグでswimlane追加）[10][9]。 | 無料オンラインエディタ。LLMでテキストベースのダイアグラム記述を生成してインポート[1]。 |
| **JointJS** | JSON/XML形式のインポート/エクスポート。カスタムオブジェクトで制御[8][11]。 | 高い。JavaScript APIでLLM出力のJSONを直接レンダリング可能[8][12]。 | 完全対応（プール/swimlane/マイルストーン）[8]。 | 無料版あり。カスタムBPMNアプリに適し、LLMで構造化データを生成してインポート[11]。 |
| **Camunda Modeler** | BPMN XMLのインポート/エクスポート標準対応[13]。 | 中程度。デスクトップアプリだが、API経由でLLM統合可能（例: スクリプトでXML処理）[13]。 | 完全対応。 | 無料オープンソース。LLMで生成したXMLをインポートして編集[13]。 |
| **Eraser.io (AIツール)** | テキスト入力から直接生成（インポート相当）。エクスポートは画像/テキスト[14]。 | 非常に高い。AI内蔵でLLMのようにテキストからswimlaneを自動作成[14]。 | 対応（AI生成でswimlane含む）[14]。 | 無料プランあり。LLM制御がネイティブで、テキストプロンプトでダイアグラム生成[14][2]。 |

### 使い方の例（bpmn-jsの場合）
bpmn-jsはLLM制御に特に適しているので、簡単なサンプルを挙げます。Node.js環境で、LLM（例: Gemini）からBPMN XMLを生成し、インポート/エクスポートする流れです。[4][7]

1. **インストール**: `npm install bpmn-js`。
2. **コード例** (JavaScript):
   ```javascript
   const BpmnModeler = require('bpmn-js/lib/Modeler');
   const fs = require('fs');

   const modeler = new BpmnModeler({ container: '#canvas' });  // HTMLにcanvas要素を用意

   // LLMから生成したBPMN XML（例: swimlane付きプロセス）をインポート
   async function importFromLLM(llmGeneratedXML) {
     try {
       await modeler.importXML(llmGeneratedXML);
       console.log('インポート成功');
     } catch (err) {
       console.error('エラー:', err);
     }
   }

   // エクスポートしてファイル保存
   async function exportDiagram() {
     try {
       const { xml } = await modeler.saveXML({ format: true });
       fs.writeFileSync('output.bpmn', xml);
       console.log('エクスポート成功');
     } catch (err) {
       console.error('エラー:', err);
     }
   }

   // 例: LLM生成のXMLを渡す
   const sampleXML = '<bpmn:definitions ...>';  // LLMで生成したXML
   importFromLLM(sampleXML).then(exportDiagram);
   ```
   - LLM側: 「BPMN swimlane diagramのXMLを生成せよ」とプロンプトしてXMLを得る。[2][1]
   - これでLLM制御が可能。ブラウザ版も似たAPIで動きます。[4]

### 注意点
- **LLM制御のしやすさ**: APIが豊富なもの（bpmn-jsなど）がおすすめ。LLMでXML/JSONを生成→インポート→修正→エクスポートのサイクルを自動化できますが、スクリプトスキルが必要。[2][3]
- **制限**: 完全自動化にはエラー処理を追加（例: LLMの出力が不正なXMLの場合）。無料ツールは商用制限を確認。[13][1]
- **代替**: 高度なLLM統合なら、BPMN-Chatbotのような研究ツールを参考にカスタム実装。[2]

もし特定のツールの詳細やサンプルコードが必要なら、教えてください！

[1](https://github.com/jgraph/drawio/discussions/4245)
[2](https://ceur-ws.org/Vol-4032/paper-39.pdf)
[3](https://bpmn.io/blog/posts/2020-bpmn-js-7-0-awaitable-import-export-apis)
[4](https://bpmn.io/toolkit/bpmn-js/walkthrough/)
[5](https://modeling-languages.com/javascript-drawing-libraries-diagrams/)
[6](https://stackoverflow.com/questions/39803319/how-to-export-bpmn-2-0-xml-format-in-bpmn-js)
[7](https://hatemsiala.hashnode.dev/integrating-bpmn-js-with-angular-step-by-step-guide)
[8](https://www.jointjs.com/demos/bpmn-pools-swimlanes-milestones)
[9](https://www.drawio.com/blog/swimlane-diagrams)
[10](https://drawio-app.com/blog/working-with-swimlanes-in-draw-io/)
[11](https://docs.jointjs.com/4.0/learn/features/export-import/bpmn/export/)
[12](https://www.jointjs.com/demos/bpmn)
[13](https://flower-bpm.com/docs/components/bpmn/import)
[14](https://www.eraser.io/ai/swimlane-diagram-generator)
[15](https://www.eclipse.org/forums/index.php/t/1104514/)
[16](https://yed.yworks.com/support/qa/10468/possible-create-swimlane-chart-automatically-import-excel)
[17](https://docs.uipath.com/task-capture/standalone/2022.4/user-guide/import-bpmn-diagram)
[18](https://www.lucidchart.com/pages/tutorial/bpmn)
[19](https://doc.igrafx.com/doc/chapter-2-create-a-diagram)
[20](https://arxiv.org/html/2408.08892v1)
[21](https://www.ibm.com/docs/en/baw/24.0.x?topic=toolkits-importing-exporting-bpmn-models)
[22](https://www.softwareideas.net/tp/187/bpmn-import-export-to-sql-DDL-instruction)
[23](https://forum.nwoods.com/t/swimlanes-that-is-used-for-rendering-bpmn-diagram/14398)
[24](https://arxiv.org/html/2412.05958v1)
[25](https://bpmn.io/blog/posts/2021-dmn-js-11-0-awaitable-import-export-apis)
[26](https://yed.yworks.com/support/qa/22917/excel-import-to-bpmn-or-swimlanes)
[27](https://www.computer.org/csdl/magazine/so/2025/04/10935604/25mY3m4wFS8)
[28](https://community.lucid.co/ideas/bpmn-2-0-file-import-and-export-with-lucidchart-507)
[29](https://forum.bpmn.io/t/adding-import-export-functionality-to-starter-dmn-js/4408)
[30](https://docs.automationanywhere.com/ja-JP/bundle/enterprise-v2019/page/ai-tools-mc-rag-aa.html)
[31](https://bpmn.io/blog/posts/2018-bpmn-js-2-2-0)
[32](https://community.decisions.com/discussion/48866/import-and-export-bpmn)
[33](https://orkes.io/blog/building-agentic-interview-app-with-conductor/)
[34](https://docs.automationanywhere.com/bundle/enterprise-v2019/page/microsoft-azure-multimodal-chatai-action.html)
[35](https://documentation.decisions.com/docs/import-and-export-bpmn)
[36](https://ironpdf.com/nodejs/blog/node-help/bpmn-js-npm/)
[37](https://community.miro.com/ideas/export-bpmn-diagrams-19039)
[38](https://help.sap.com/docs/signavio-process-governance/user-guide/bpmn-import)
