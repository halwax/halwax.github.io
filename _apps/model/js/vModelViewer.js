Vue.component('vModelViewer', {
  template: `
  <vRow dense>
    <vCol cols="12">
      <vClassDiagram :mPackage="mPackage"/>
    </vCol>
  </vRow>
  `,
  props: ['mPackage'],
});