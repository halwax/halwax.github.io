require.config({ paths: { 'vs': 'js/monaco-editor/min/vs' }});

Vue.component('vMonacoEditor', {
  template: `
  <div class="monaco-editor"></div>
  `,
  props: {
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'js',
    },
    readOnly: {
      type: Boolean,
      default: false,
    }
  },
  mounted: function () {
    require(['vs/editor/editor.main'], () => {
      this.monaco = window.monaco
      this.initMonaco(window.monaco)

      let windowOnResize = _.debounce(this.layoutEditor, 50);
      this.originalWindowOnResize = window.onresize;
      if(typeof this.originalWindowOnResize !== 'undefined' && this.originalWindowOnResize !== null) {
        windowOnResize = () => {
          this.layoutEditor();
          return this.originalWindowOnResize();
        };
      }
      window.onresize = windowOnResize;
    });
  },
  beforeDestroy() {
    this.editor && this.editor.dispose();
    window.onresize = this.originalWindowOnResize;
  },
  methods: {
    layoutEditor() {
      const parentStyle = window.getComputedStyle(this.$el.parentNode);
      this.editor.layout({
        width: parseInt(parentStyle.width),
        height: parseInt(parentStyle.height),
      });
    },
    pxToNumber(pxString) {

    },
    initMonaco() {
      let settings = {
        value: this.content,
        language: this.language,
        readOnly: this.readOnly,
        scrollBeyondLastLine: false,
      };
      if(this.language === 'typescript') {
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          experimentalDecorators: true,
        });
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({ 
          noLib: true,
          allowNonTsExtensions: true
        });
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES6,
          allowNonTsExtensions: true,
        });

        // Register the additional library.
        monaco.languages.typescript.javascriptDefaults.addExtraLib(typeScriptEs5Lib.value, typeScriptEs5Lib.name);
      };
      this.editor = monaco.editor.create(this.$el, settings);
      this.editor.onDidChangeModelContent(event => {
        const value = this.editor.getValue();
        this.$emit('change', value, event);
      });
      this.layoutEditor();
    },
    getEditor() {
      return this.editor
    },
  },
});