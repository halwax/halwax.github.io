const modelStore = new Vuex.Store({
  state: () => ({
    sequenceText: '',
    sequenceObject: {
      name: '',
      objects: [],
      messages: [],
      draft: false,
    },
    snackbarMessage: '',
  }),
  actions: {
    loadDefaultSequence(context) {
      let sequenceText = tsDefaultSequence;
      context.dispatch('loadSequenceFromText', sequenceText);
      context.commit('setSequenceText', sequenceText);
    },
    showMessage(context, snackbarMessage) {
      context.commit('setSnackbarMessage', snackbarMessage);
    },
    loadSequenceFromText(context, sequenceText) {
      return new Promise((resolve, reject) => {
        try {
          let sequence = new SequenceParser().parse(sequenceText);
          resolve(sequence.toJsonObj());  
        } catch(e) {
          if (e instanceof TypeError) {
            reject(e.message);
           } else {
             throw e;
           }
        }
      }).then(sequenceObject => {
        context.commit('setSequenceObject', sequenceObject);
      }, (message) => {
        context.dispatch('showMessage', 'Error parsing sequence : ' + message);
      });
    },
  },
  getters: {
    sequenceObject(state) {
      return state.sequenceObject;
    }
  },
  mutations: {
    setSequenceObject(state, sequenceObject) {
      if(JSON.stringify(state.sequenceObject) !== JSON.stringify(sequenceObject)) {
        Vue.set(state, 'sequenceObject', sequenceObject);
      }
    },
    setSnackbarMessage(state, snackbarMessage) {
      Vue.set(state, 'snackbarMessage', snackbarMessage);
    },
    setSequenceText(state, sequenceText) {
      if(state.sequenceText !== sequenceText) {
        Vue.set(state, 'sequenceText', sequenceText);
      }
    },
  },
});