Vue.component('vClassDiagram', {
  template: `
  <vRow dense>
    <vCol cols="12">
      <vCard>
        <vAppBar dense short elevation="1">
          <vSubheader>Class Diagram</vSubheader>
          <vSpacer></vSpacer>
          <vBtn icon small @click="copySvgToClipboard">
            <vIcon small>mdi-xml</vIcon>
          </vBtn>
          <vBtn icon small @click="copyMxgraphXmlToClipboard">
            <vIcon small>mdi-content-copy</vIcon>
          </vBtn>
        </vAppBar>
        <vCardText>
          <div v-show="_.size(mPackage.mClasses)>0">
            <div class="diagram" id="class-diagram" style="overflow-x: scroll;"></div>
          </div>
        </vCardText>   
      </vCard>
    </vCol>
  </vRow>
  `,
  data() {
    return {
      diagramXmlDialog: false,
      diagramXml: '',
    };
  },
  mounted() {
    this.renderDiagram();
  },
  beforeUpdate() {
    this.renderDiagram();
  },
  computed: {
    mPackage() {
      return this.$store.state.mModelObject;
    },
    mPackageName() {
      return _.capitalize(this.$store.state.mModelObject.name);
    },
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
    copySvgToClipboard() {
      new VUtils().copyToClipboard(new ModelDiagram().getSvg(this.graph));
      this.showCopiedToClipboardMessage('Svg');
    },
    copyMxgraphXmlToClipboard() {
      new VUtils().copyToClipboard(new ModelDiagram().getPrettyXml(this.graph));
      this.showCopiedToClipboardMessage('Xml');
    },
    showCopiedToClipboardMessage(type) {
      this.$store.dispatch('showMessage', type + ' has been copied to clipboard');
    }
  }
});