const router = new VueRouter({
  routes: [{
    path: '/*', 
    component: vSequenceViewer
  }],
});

Vue.component('vStoreSnackbar', {
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
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setSnackbarMessage') {
        this.message = state.snackbarMessage;
        this.show = true
      }
    });
  },
  destroyed() {
    if(typeof this.unsubscribe !== 'undefined') {
      this.unsubscribe();
    }
  },
})

Vue.component('vNavigationTabs', {
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
      return this.$store.state.sequenceText;
    },
  },
  methods: {
    changeContent: _.debounce(function (newContent) {
      this.$store.dispatch('loadSequenceFromText', newContent);
    }, 1000),
  },
})

Vue.component('vSequenceApp', {
  template: `
  <vApp id="root">
    <vAppBar app :clipped-left="$vuetify.breakpoint.mdAndUp" :extension-height="32">
      <vAppBarNavIcon @click.stop="drawer = !drawer"></vAppBarNavIcon>
      <vToolbarTitle>Sequence</vToolbarTitle>
      <vSpacer></vSpacer>
      <vBtn icon small @click="copySequenceJsonToClipboard">
        <vIcon small>mdi-content-copy</vIcon>
      </vBtn>
      <template v-slot:extension>
        <div class="title" style="min-width: 100px; padding-left: 5px;">{{sequenceTitle}}</div>
      </template>
    </vAppBar>
    <vNavigationDrawer app v-model="drawer" :width="navigationDrawerWidth" clipped>
      <vNavigationTabs/>
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
    <vStoreSnackbar/>
  </vApp>
  `,
  data: function() {
    return {
      drawer: true,
    };
  },
  mounted() {
    this.initSequence();
  },
  computed: {
    navigationDrawerWidth() {
      return '550';
    },
    content() {
      return this.$store.state.sequenceText;
    },
    sequenceTitle() {
      return this.$store.getters.sequenceObject.name;
    },
  },
  methods: {
    changeContent: _.debounce(function (newContent) {
      this.$store.dispatch('initSequence', newContent);
    }, 1000),
    initSequence() {
      this.$store.dispatch('loadDefaultSequence');
    },
    copySequenceJsonToClipboard() {
      new VUtils().copyToClipboard(JSON.stringify(this.$store.state.sequenceObject, null, 2));
      this.$store.dispatch('showMessage', 'Sequence Json has been copied to clipboard');
    }
  },
});

new Vue({
  el:'#model-app',
  template: `<vSequenceApp></vSequenceApp>`,
  vuetify: new Vuetify({theme: {
    dark: false,
  }}),
  router,
  store: modelStore,
});