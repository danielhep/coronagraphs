import Vue from 'vue'
import Vuex from 'vuex'

import * as d3 from 'd3'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stateData: []
  },
  mutations: {
    setStateData (state, data) {
      state.stateData = data
    }
  },
  actions: {
    async getDataForDate ({ commit }) {
      const covidData = (await d3.csv('https://covidtracking.com/api/states/daily.csv', d3.autoType))
      const populationData = await d3.csv('/population_states.csv', d3.autoType)
      const data = populationData.map(d => ({ ...covidData.find(c => c.state === d.state), population: d.pop }))
      commit('setStateData', data)
    }
  },
  modules: {
  }
})
