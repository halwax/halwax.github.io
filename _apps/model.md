---
layout: app
title: Model Editor
headline: Typescript to UML class diagram editor
noSiteContainer: true
cssLinks:
  - ./css/roboto/roboto.css
  - ./css/materialdesignicons/materialdesignicons.min.css
  - ./css/vuetify/vuetify.min.css
  - ./css/model.css
---

<div id="model-app"></div>

<script src="js/lodash/lodash.js"></script>
<script src="js/elkjs/lib/elk.bundled.js"></script>
<script type="text/javascript">
  mxBasePath = './js/mxgraph';
</script>
<script src="js/mxgraph/mxClient.js"></script>
<script src="js/vue/vue.js"></script>
<script src="js/vuex/vuex.js"></script>
<script src="js/vue-router/vue-router.js"></script>
<script src="js/vuetify/vuetify.js"></script>
<script src="js/monaco-editor/min/vs/loader.js"></script>
<script src="js/typescriptConfig.js"></script>
<script src="js/typescript/typescript.min.js"></script>
<script src="js/model.js"></script>
<script src="js/modelSample.js"></script>
<script src="js/modelDiagram.js"></script>
<script src="js/classDiagram.js"></script>
<script src="js/vUtils.js"></script>
<script src="js/vModelStore.js"></script>
<script src="js/vClassDiagram.js"></script>
<script src="js/vMonacoEditor.js"></script>
<script src="js/vModelViewer.js"></script>
<script src="js/vModelApp.js"></script>