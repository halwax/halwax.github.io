const router = new VueRouter({
  routes: [{
    path: '/*', 
    component: vModelViewer
  }],
});

Vue.component('vModelApp', {
  template: `
  <vApp id="root">
    <vAppBar app :clipped-left="$vuetify.breakpoint.mdAndUp" :extension-height="32">
      <vAppBarNavIcon @click.stop="drawer = !drawer"></vAppBarNavIcon>
      <vToolbarTitle>Model</vToolbarTitle>
      <template v-slot:extension>
        <vBreadcrumbs :items="breadCrumbs"></vBreadcrumbs>
      </template>
    </vAppBar>
    <vNavigationDrawer app v-model="drawer" :width="navigationDrawerWidth" clipped>
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
        <routerView/>
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
    return {
      expansionPanels: 0,
      drawer: false,
      selectedTab: null,
      items: [],
    };
  },
  mounted() {
    this.initModel();
  },
  watch: {
    $route(to, from) {
      this.$store.dispatch('selectModelElement', to.path);
    }
  },
  computed: {
    navigationDrawerWidth() {
      return '550';
    },
    content() {
      return this.$store.state.mModelText;
    },
    breadCrumbs() {
      let breadCrumbs = [];
      breadCrumbs.push({
        text: 'Model',
        disabled: false,
        exact: true,
        to: '/',
      })
      let modelSelection = this.$store.getters.modelSelection;
      if(modelSelection.empty) {
        return breadCrumbs;
      }

      let currentPath = '';
      for(let elementPathSegment of modelSelection.elementPathSegments) {
        currentPath = currentPath + (_.isEmpty(currentPath)? '' : '.') + elementPathSegment;
        breadCrumbs.push({
          text: elementPathSegment,
          disabled: false,
          exact: true,
          to: currentPath,
        })
      }

      return breadCrumbs;
    }
  },
  methods: {
    changeContent: _.debounce(function (newContent) {
      this.$store.dispatch('loadModelFromText', newContent);
    }, 1000),
    initModel() {
      this.$store.dispatch('loadDefaultModel');
    }
  },
});

new Vue({
  el:'#model-app',
  template: `<vModelApp></vModelApp>`,
  vuetify: new Vuetify({theme: {
    dark: false,
  }}),
  router,
  store: modelStore,
});