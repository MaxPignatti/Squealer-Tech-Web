import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    userData: null,
  },
  mutations: {
    setAuthentication(state, status) {
      state.isAuthenticated = status;
    },
    setUserData(state, data) {
      state.userData = data;
    },
  },
  actions: {
    authenticate({ commit }, token) {
      if (token) {
        commit('setAuthentication', true);
      } else {
        commit('setAuthentication', false);
      }
    },
    login({ commit }, userData) {
      commit('setUserData', userData);
      commit('setAuthentication', true);
    },
    logout({ commit }) {
      commit('setUserData', null);
      commit('setAuthentication', false);
    },
  },
});

