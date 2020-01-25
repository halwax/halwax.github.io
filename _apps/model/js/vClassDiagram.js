Vue.component('vClassDiagram', {
  template: `
  <vCard>
    <vAppBar dense short elevation="1">
      <vToolbarTitle class="subtitle-1">Class Diagram</vToolbarTitle>
      <vSpacer></vSpacer>
      <vBtn icon small @click="openDiagramXmlDialog">
        <vIcon small>mdi-xml</vIcon>
      </vBtn>
      <vBtn icon small @click="copyDiagramXmlToClipboard">
        <vIcon small>mdi-content-copy</vIcon>
      </vBtn>
      <vDialog v-model="diagramXmlDialog" width="70%">
        <vCard>
          <vAppBar dense short elevation="1">
            <vToolbarTitle class="subtitle-1">Class Diagram Xml</vToolbarTitle>
          </vAppBar>
          <vCardText style="height:300px; margin-top: 2px;">
            <vMonacoEditor :readOnly="true" :content="diagramXml" language="xml"/>
          </vCardText>
          <vCardActions>
            <vSpacer/>
            <vBtn text @click="copyDiagramXmlDialogToClipboard">Copy to clipboard</vBtn>
            <vBtn text @click="diagramXmlDialog = false">Cancel</vBtn>
          </vCardActions>
        </vCard>
      </vDialog>
    </vAppBar>
    <vCardText>
      <div v-show="_.size(mPackage.mClasses)>0">
        <div class="diagram" id="class-diagram" style="overflow-x: scroll;"></div>
      </div>
    </vCardText>
    <vSnackbar color="sucess" v-model="copyClassDiagramXmlSnackbar" :timeout="snackbarTimeout">
      Xml has been copied to clipboard
      <vBtn icon @click="copyClassDiagramXmlSnackbar = false">
        <vIcon small>mdi-close</vIcon>
      </vBtn>
    </vSnackbar>     
  </vCard>
  `,
  props: ['mPackage'],
  data() {
    return {
      diagramXmlDialog: false,
      diagramXml: '',
      copyClassDiagramXmlSnackbar: false,
      snackbarTimeout: 1500,
    };
  },
  mounted() {
    this.renderDiagram();
  },
  beforeUpdate() {
    this.renderDiagram();
  },
  destroyed() {
    this.destroyDiagram();
  },
  methods: {
    renderDiagram() {
      this.destroyDiagram();

      let diagramDiv = this.$el.querySelector('#class-diagram')
      let classDiagram = new ClassDiagram((elementPath) => {
        this.$router.push(elementPath);
      });

      let mClasses = this.mPackage.mClasses;
      for (let pI = 0; pI < _.size(mClasses); pI++) {
        let mClassObj = mClasses[pI];
        classDiagram.addClass(mClassObj);
      }

      let mReferences = this.mPackage.mReferences;
      for (let rI = 0; rI < _.size(mReferences); rI++) {
        let mReferenceObj = mReferences[rI];
        classDiagram.addReference(mReferenceObj);
      }
      let mGeneralizations = this.mPackage.mGeneralizations;
      for (let gI = 0; gI < _.size(mGeneralizations); gI++) {
        let mGeneralizationObj = mGeneralizations[gI];
        classDiagram.addGeneralization(mGeneralizationObj);
      }

      this.graph = classDiagram.render(diagramDiv);
    },
    destroyDiagram() {
      if (!_.isNil(this.graph)) {
        this.graph.destroy();
        this.graph = null;
      }
      let diagramDiv = this.$el.querySelector('#class-diagram')
      diagramDiv.innerHTML = '';
    },
    openDiagramXmlDialog() {
      this.diagramXml = new ModelDiagram().getPrettyXml(this.graph);
      this.diagramXmlDialog = true;
    },
    copyDiagramXmlDialogToClipboard() {
      new VUtils().copyToClipboard(this.diagramXml);
      this.copyClassDiagramXmlSnackbar = true;
      this.diagramXmlDialog = false;
    },
    copyDiagramXmlToClipboard() {
      new VUtils().copyToClipboard(new ModelDiagram().getPrettyXml(this.graph));
      this.copyClassDiagramXmlSnackbar = true;
    },
  }
});