import Vue from 'vue'
import Vuex from 'vuex'

import * as d3 from 'd3'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stateData: {

    }
  },
  mutations: {
    setStateData (state, data) {
      state.stateData = data
    }
  },
  actions: {
    async getDataForDate ({ commit }) {
      const covidData = (await d3.csv('https://covidtracking.com/api/states/daily.csv?date=20200328', d3.autoType))
      commit('setStateData', covidData)
    }
  },
  modules: {
  }
})
