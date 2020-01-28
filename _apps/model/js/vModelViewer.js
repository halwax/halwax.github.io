Vue.component('vPackageOverview', {
  template: `
  <vRow dense v-show="mPackageHasSubPackages">
    <vCol cols="12">
      <vCard>
        <vAppBar dense short elevation="1">
          <vIcon small>mdi-package-variant-closed</vIcon>          
          <vSubheader>Subpackages</vSubheader>
          <vSpacer></vSpacer>
        </vAppBar>
        <vListItem dense v-for="mSubPackage in mSubPackages" :key="mSubPackage.name"
          @click="navigateToSubPackage(mSubPackage)">
          <vListItemIcon>
            <vIcon>mdi-chevron-right</vIcon>
          </vListItemIcon>
          <vListItemContent>
            <vListItemSubtitle>{{mSubPackage.name}}</vListItemSubtitle>
          </vListItemContent>
        </vListItem>
      </vCard>
    </vCol>
  </vRow>
  `,
  computed: {
    mPackageHasSubPackages() {
      return this.mSubPackages.length > 0;
    },
    mSubPackages() {
      let mSubPackages = [];
      let modelSelection = this.$store.getters.modelSelection;
      let selectedPackage = modelSelection.mPackage;
      for(let mPackage of selectedPackage.mPackages) {
        mSubPackages.push({
          name: mPackage.name,
          path: mPackage.path,
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
    navigateToSubPackage(mSubPackage) {
      this.$router.push(mSubPackage.path);
    }
  },
});

Vue.component('vPackageDetails', {
  template: `
  <vRow dense v-show="mPackageHasClasses">
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
  computed: {
    mPackageHasClasses() {
      return this.$store.getters.selectedMPackage.mClasses.length > 0;
    },
  },
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