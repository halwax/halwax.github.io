const modelStore = new Vuex.Store({
  state: () => ({
    mModelObject: {},
    mModelText: '',
  }),
  actions: {
    loadDefaultModel(context) {
      let mModelText = tsDefaultModel;
      context.dispatch('loadModelFromText', mModelText);
      context.commit('setModelText', mModelText);
    },
    loadModelFromText(context, mModelText) {
      return new Promise((resolve, reject) => {
        let mModelObject = new Model(mModelText).toMModel();
        resolve(mModelObject);
      }).then(mModelObject => {
        context.commit('setModelObject', mModelObject);
      });
    }
  },
  mutations: {
    setModelObject(state, mModelObject) {
      if(JSON.stringify(state.mModelObject) !== JSON.stringify(mModelObject)) {
        state.mModelObject = mModelObject;
      }
    },
    setModelText(state, mModelText) {
      if(state.mModelText !== mModelText) {
        state.mModelText = mModelText;
      }
    }
  },
});