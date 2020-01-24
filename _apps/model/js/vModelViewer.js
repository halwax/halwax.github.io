const vModelViewer = {
  template: `
  <vRow dense>
    <vCol cols="12">
      <vClassDiagram :mPackage="mPackage"/>
    </vCol>
  </vRow>
  `,
  computed: {
    mPackage() {
      return this.$store.state.mModelObject;
    }
  },
};