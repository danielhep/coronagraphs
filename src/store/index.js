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
    async getData ({ commit }) {
      const covidData = (await d3.csv('https://covidtracking.com/api/states/daily.csv', d3.autoType))
      const populationData = await d3.csv('/population_states.csv', d3.autoType)
      const data = covidData.map(d => ({ population: populationData.find(c => c.state === d.state).pop, ...d }))
      commit('setStateData', data)
    }
  },
  modules: {
  }
})
