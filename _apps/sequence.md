---
layout: app
title: Sequence Editor
headline: Typescript to Sequence diagram editor
noSiteContainer: true
cssLinks:
  - ../libs/css/roboto/roboto.css
  - ../libs/css/materialdesignicons/materialdesignicons.min.css
  - ../libs/css/vuetify/vuetify.min.css
  - ./css/sequence.css
---

<div id="model-app"></div>

<script src="../libs/js/lodash/lodash.js"></script>
<script src="../libs/js/elkjs/lib/elk.bundled.js"></script>
<script type="text/javascript">
  mxBasePath = '../libs/js/mxgraph';
</script>
<script src="../libs/js/mxgraph/mxClient.js"></script>
<script src="../libs/js/vue/vue.js"></script>
<script src="../libs/js/vuex/vuex.js"></script>
<script src="../libs/js/vue-router/vue-router.js"></script>
<script src="../libs/js/vuetify/vuetify.js"></script>
<script src="../libs/js/monaco-editor/min/vs/loader.js"></script>
<script src="../libs/js/typescriptConfig.js"></script>
<script src="../libs/js/typescript/typescript.min.js"></script>
<script src="../libs/js/vUtils.js"></script>
<script src="../libs/js/graphUtils.js"></script>
<script src="js/monacoEditorConfig.js"></script>
<script src="../libs/js/vMonacoEditor.js"></script>
<script src="js/sequence.js"></script>
<script src="js/sequenceParser.js"></script>
<script src="js/sequenceSample.js"></script>
<script src="js/sequenceDiagram.js"></script>
<script src="js/vSequenceStore.js"></script>
<script src="js/vSequenceDiagram.js"></script>
<script src="js/vSequenceViewer.js"></script>
<script src="js/vSequenceApp.js"></script>