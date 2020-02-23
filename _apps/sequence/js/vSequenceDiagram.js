Vue.component('vSequenceDiagram', {
  template: `
  <vRow dense>
    <vCol cols="12">
      <vCard>
        <vAppBar dense short elevation="1">
          <vIcon small>mdi-sitemap</vIcon>
          <vSubheader>Sequence Diagram</vSubheader>
          <vSpacer></vSpacer>
          <vBtn icon small @click="copySvgToClipboard">
            <vIcon small>mdi-xml</vIcon>
          </vBtn>
          <vBtn icon small @click="copyMxgraphXmlToClipboard">
            <vIcon small>mdi-content-copy</vIcon>
          </vBtn>
        </vAppBar>
        <vCardText>
          <div>
            <div class="diagram" id="sequence-diagram" style="overflow-x: scroll;"></div>
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
      rendredSequenceJson: '',
    };
  },
  mounted() {
    this.renderDiagram();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setSequenceObject') {
        this.renderDiagram();
      }
    });

  },
  beforeUpdate() {
    this.renderDiagram();
  },
  computed: {
    sequence() {
      return this.$store.getters.sequenceObject;
    },
  },
  destroyed() {
    this.destroyDiagram();
    if(typeof this.unsubscribe !== 'undefined') {
      this.unsubscribe();
    }
  },
  methods: {
    renderDiagram() {

      let toBeRendredSequenceJson = JSON.stringify(this.sequence);
      if(this.rendredSequenceJson === toBeRendredSequenceJson) {
        return;
      }

      this.destroyDiagram();

      let diagramDiv = this.$el.querySelector('#sequence-diagram')
      
      let sequenceDiagram = new SequenceDiagram(this.sequence, elementPath => {
        if(this.$route.path !== ('/' + elementPath)) {
          this.$router.push(elementPath);
        }
      });

      this.graph = sequenceDiagram.render(diagramDiv);

      this.rendredSequenceJson = toBeRendredSequenceJson;
    },
    destroyDiagram() {
      if (!_.isNil(this.graph)) {
        this.graph.destroy();
        this.graph = null;
      }
      let diagramDiv = this.$el.querySelector('#sequence-diagram')
      diagramDiv.innerHTML = '';
    },
    copySvgToClipboard() {
      new VUtils().copyToClipboard(new GraphUtils().getSvg(this.graph));
      this.showCopiedToClipboardMessage('Svg');
    },
    copyMxgraphXmlToClipboard() {
      new VUtils().copyToClipboard(new GraphUtils().getPrettyXml(this.graph));
      this.showCopiedToClipboardMessage('Xml');
    },
    showCopiedToClipboardMessage(type) {
      this.$store.dispatch('showMessage', type + ' has been copied to clipboard');
    }
  }
});