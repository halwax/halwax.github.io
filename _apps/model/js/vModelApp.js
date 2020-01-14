Vue.component('vModelApp', {
  template: `
  <vApp id="root">
    <vAppBar app clipped-left>
      <vAppBarNavIcon @click.stop="drawer = !drawer"></vAppBarNavIcon>
      <vToolbarTitle>Model</vToolbarTitle>
    </vAppBar>
    <vNavigationDrawer v-model="drawer" :width="navigationDrawerWidth" clipped app>
      <vTabs vertical v-model="selectedTab">
        <vTab :key="'editor'" style="min-width: 50px;"><vIcon>mdi-file-document-edit-outline</vIcon></vTab>
        <vTab :key="'navigator'" style="min-width: 50px;"><vIcon>mdi-file-tree</vIcon></vTab>
        <vTabItem :key="'editor'">
          <div class="tab-item-wrapper">
            <vCard class="fill-height">
              <vMonacoEditor :content="content" language="typescript" @change="changeContent"/>
            </vCard>
          </div>
        </vTabItem>
        <vTabItem :key="'navigator'">
          <vCard class="fill-height">
            <vTreeview dense :items="items"></vTreeview>
          </vCard>
        </vTabItem>
      </vTabs>
      </vNavigationDrawer>
    <vContent>
      <vContainer fluid>
        <vModelViewer :mPackage="mModel"/>
      </vContainer>
    </vContent>
    <vFooter app clipped>
      <vCol class="text-center" cols="12">
        {{ new Date().getFullYear() }} — <strong>Scribdev</strong>
      </vCol>
    </vFooter>
  </vApp>
  `,
  data: function() {
    const mModel = new Model(tsDefaultModel).toMModel();
    return {
      mModel: mModel,
      content: tsDefaultModel,
      newContent: tsDefaultModel,
      expansionPanels: 0,
      drawer: false,
      selectedTab: null,
      items: [],
    };
  },
  computed: {
    navigationDrawerWidth() {
      return '550';
    }
  },
  methods: {
    changeContent: _.debounce(function (newContent) {
      this.newContent = newContent;
      this.syncModel();
    }, 1000),
    syncModel() {
      const newMModel = new Model(this.newContent).toMModel();
      if(JSON.stringify(newMModel) !== JSON.stringify(this.mModel)) {
        this.mModel = newMModel;
      }
    }
  },
});

new Vue({
  el:'#model-app',
  template: `<vModelApp></vModelApp>`,
  vuetify: new Vuetify({theme: {
    dark: false,
  }}),
});