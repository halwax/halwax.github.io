Vue.component('vPackageOverview', {
  template: `
  <vRow dense>
    <vCol cols="12">
      <vCard>
        <vAppBar dense short elevation="1">
          <vSubheader>Subpackages</vSubheader>
          <vSpacer></vSpacer>
        </vAppBar>
        <vListItem v-for="mSubpackage in mSubPackages" :key="mSubpackage.name" @click="">
          <vListItemContent>
            <vListItemTitle>{{mSubpackage.name}}</vListItemTitle>
          </vListItemContent>
        </vListItem>
      </vCard>
    </vCol>
  </vRow>
  `,
  computed: {
    mSubPackages() {
      let mSubPackages = [];
      let modelSelection = this.$store.getters.modelSelection;
      let model = this.$store.state.mModelObject;
      for(let mPackage of model.mPackages) {
        mSubPackages.push({
          name: mPackage.name
        })
      }
      return mSubPackages;
    }
  },
  methods: {
    copyModelToClipboard() {
      new VUtils().copyToClipboard(JSON.stringify(this.$store.state.mModelObject, null, 2));
      this.$store.dispatch('showMessage', 'Model Json has been copied to clipboard');
    },
  },
});

Vue.component('vPackageDetails', {
  template: `
  <vRow dense>
    <vCol cols="12">
      <vCard>
        <vAppBar dense short elevation="1">
          <vSubheader>Details</vSubheader>
          <vSpacer></vSpacer>
        </vAppBar>
        <vCardText>
        </vCardText>   
      </vCard>
    </vCol>
  </vRow>
  `,
});

const vModelViewer = {
  template: `
  <div>
    <vPackageOverview/>   
    <vClassDiagram/>
    <vPackageDetails/>
  </div>
  `,
};