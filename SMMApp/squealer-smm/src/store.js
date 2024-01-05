import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
    email: null,
    vip: null,
  },
  mutations: {
    setAuthentication(state, status) {
      state.isAuthenticated = status;
    },
    setUserEmail(state, data) {
      state.email = data;
    },
    setVip(state, vip) {
      state.vip = vip;
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
    login({ commit }, email) {
      commit('setUserEmail', email);
      commit('setAuthentication', true);
    },
    logout({ commit }) {
      commit('setUserEmail', null);
      commit('setAuthentication', false);
      commit('setVip', null); // Resetta lo stato VIP al logout
    },
  },
});
