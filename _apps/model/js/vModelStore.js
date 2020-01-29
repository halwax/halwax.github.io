const modelStore = new Vuex.Store({
  state: () => ({
    mModelObject: {
      path: '',
      name: '',
      qualifiedName: '',
      mPackages: [],
      mClassPaths: [],
      mClasses: [],
      mReferences: [],
      mGeneralizations: [],
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
        let originalSelectedElementPath = context.state.mModelSelectedElementPath;
        let selectedElementPath = context.getters.modelSelection.selectionPath;
        if(originalSelectedElementPath !== selectedElementPath) {
          context.dispatch('selectModelElement', selectedElementPath);
        }
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
    selectedMPackage(state, getters) {
      
      let modelSelection = getters.modelSelection;
      let mModelObject = state.mModelObject;

      let selectedMPackage = {
        name: modelSelection.mPackage.name,
        path: modelSelection.mPackage.path,
        mClasses: [],
        mReferences: [],
        mGeneralizations: [],
        externalMClassPaths: [],
      }

      let declaredClassPaths = modelSelection.mPackage.mClassPaths;

      let resolvedMClassPaths = [];

      let insertMClass = mClassPath => {
        let mClass = mModelObject.mClasses.find(mClass => mClass.path === mClassPath);
        if(!resolvedMClassPaths.includes(mClassPath)) {
          resolvedMClassPaths.push(mClassPath);
          selectedMPackage.mClasses.push(mClass);
          if(!declaredClassPaths.includes(mClassPath)) {
            selectedMPackage.externalMClassPaths.push(mClassPath);
          }
        }
        return mClass;
      };

      for(let mClassPath of declaredClassPaths) {

        let mClass = insertMClass(mClassPath);

        let mReferencesWithSource = mModelObject.mReferences.filter(mReference => mReference.source === mClass.path);
        for(let mReference of mReferencesWithSource) {
          insertMClass(mReference.target);
        }
        selectedMPackage.mReferences = selectedMPackage.mReferences.concat(mReferencesWithSource);

        let mGeneralizationsWithClassSource = mModelObject.mGeneralizations.filter(mGeneralization => mGeneralization.source === mClass.path);
        for(let mGeneralization of mGeneralizationsWithClassSource) {
          insertMClass(mGeneralization.target);
        }
        selectedMPackage.mGeneralizations = selectedMPackage.mGeneralizations.concat(mGeneralizationsWithClassSource);
      }

      return selectedMPackage;
    },
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

      if(selectionPath !== selectedMPackage.path) {
        let matchingMClass = state.mModelObject.mClasses.find(mClass => mClass.path === selectionPath);
        if(_.isNil(matchingMClass)) {
          selectionPath = state.mModelObject === selectedMPackage ? '' : selectedMPackage.path;
          elementPathSegments = selectionPath.split('.');
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