const modelStore = new Vuex.Store({
  state: () => ({
    mModelObject: {
      mPackages: [],
    },
    mModelText: '',
    mModelSelectedElementPath: '',
    snackbarMessage: '',
  }),
  actions: {
    loadDefaultModel(context) {
      let mModelText = tsDefaultModel;
      context.dispatch('loadModelFromText', mModelText);
      context.dispatch('selectModelElement', '');
      context.commit('setModelText', mModelText);
    },
    loadModelFromText(context, mModelText) {
      return new Promise((resolve, reject) => {
        let mModelObject = new Model(mModelText).toMModel();
        resolve(mModelObject);
      }).then(mModelObject => {
        context.commit('setModelObject', mModelObject);
      });
    },
    selectModelElement(context, elementPath) {
      let tidyElementPath = elementPath;
      if(!_.isNil(tidyElementPath) && tidyElementPath.indexOf('/') === 0) {
        tidyElementPath = tidyElementPath.substring(1);
      }
      context.commit('setModelSelectedElementPath', tidyElementPath);
    },
    showMessage(context, snackbarMessage) {
      context.commit('setSnackbarMessage', snackbarMessage);
    }
  },
  mutations: {
    setModelObject(state, mModelObject) {
      if(JSON.stringify(state.mModelObject) !== JSON.stringify(mModelObject)) {
        Vue.set(state, 'mModelObject', mModelObject);
      }
    },
    setModelText(state, mModelText) {
      if(state.mModelText !== mModelText) {
        Vue.set(state, 'mModelText', mModelText);
      }
    },
    setModelSelectedElementPath(state, elementPath) {
      Vue.set(state, 'mModelSelectedElementPath', elementPath);
    },
    setSnackbarMessage(state, snackbarMessage) {
      Vue.set(state, 'snackbarMessage', snackbarMessage);
    }
  },
  getters: {
    modelSelection(state) {
      
      let selectionPath = state.mModelSelectedElementPath;
      let elementPathSegments = _.isNil(selectionPath) ? [] : selectionPath.split('.');

      let selectedMPackage = state.mModelObject;
      let elementPathSegmentsToProcess = elementPathSegments.slice();
      while(elementPathSegmentsToProcess.length > 0) {

        let currentPathSegment = elementPathSegmentsToProcess.splice(0, 1)[0];
        let matchingPackage = selectedMPackage.mPackages.find(it => it.name === currentPathSegment);
        if(!_.isNil(matchingPackage)) {
          selectedMPackage = matchingPackage;
        }
      }
      
      return {
         elementPathSegments: elementPathSegments,
         selectionPath,
         empty: selectionPath === '',
         mPackage: selectedMPackage,
      };
    },
  },
});