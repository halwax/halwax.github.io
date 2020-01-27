const router = new VueRouter({
  routes: [{
    path: '/*', 
    component: vModelViewer
  }],
});

Vue.component('vModelSnackbar', {
  template: `
  <vSnackbar :color="color" v-model="show" :timeout="timeout">
    {{message}}
    <vBtn icon @click="show = false">
      <vIcon small>mdi-close</vIcon>
    </vBtn>
  </vSnackbar>  
  `,
  data () {
    return {
      show: false,
      message: '',
      color: 'sucess',
      timeout: 1500,
    }
  },
  created () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setSnackbarMessage') {
        this.message = state.snackbarMessage;
        this.show = true
      }
    })
  }
})

Vue.component('vModelNavigationTabs', {
  template: `
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
  `,
  data() {
    return {
      selectedTab: null,
      items: [],
    };
  },
  computed: {
    content() {
      return this.$store.state.mModelText;
    },
  },
  methods: {
    changeContent: _.debounce(function (newContent) {
      this.$store.dispatch('loadModelFromText', newContent);
    }, 1000),
  },
})

Vue.component('vModelApp', {
  template: `
  <vApp id="root">
    <vAppBar app :clipped-left="$vuetify.breakpoint.mdAndUp" :extension-height="32">
      <vAppBarNavIcon @click.stop="drawer = !drawer"></vAppBarNavIcon>
      <vToolbarTitle>Model</vToolbarTitle>
      <vSpacer></vSpacer>
      <vBtn icon small @click="copyModelJsonToClipboard">
        <vIcon small>mdi-content-copy</vIcon>
      </vBtn>
      <template v-slot:extension>
        <div class="title" style="min-width: 100px; padding-left: 5px;">{{mPackageName}}</div>
        <vBreadcrumbs :items="breadCrumbs"></vBreadcrumbs>
      </template>
    </vAppBar>
    <vNavigationDrawer app v-model="drawer" :width="navigationDrawerWidth" clipped>
      <vModelNavigationTabs/>
    </vNavigationDrawer>
    <vContent>
      <vContainer fluid>
        <routerView/>
      </vContainer>
    </vContent>
    <vFooter>
      <vCol class="text-center" cols="12">
        {{ new Date().getFullYear() }} — <strong>Scribdev</strong>
      </vCol>
    </vFooter>
    <vModelSnackbar/>
  </vApp>
  `,
  data: function() {
    return {
      drawer: false,
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
    mPackageName() {
      return _.capitalize(this.$store.state.mModelObject.name);
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
    },
    copyModelJsonToClipboard() {
      new VUtils().copyToClipboard(JSON.stringify(this.$store.state.mModelObject, null, 2));
      this.$store.dispatch('showMessage', 'Model Json has been copied to clipboard');
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