import Vue from 'vue'
import Vuex from 'vuex'

import * as d3 from 'd3'

import { DateTime } from 'luxon'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stateData: [],
    dateRange: [DateTime.local(), DateTime.local()],
    allDates: [],
    loading: false,
    stateList: [],
    filteredStateData: [],
    selectedStates: []
  },
  mutations: {
    setStateData (state, data) {
      state.stateData = data
      state.dateRange = [data[data.length - 1].date, data[0].date]
      state.allDates = data.reduce((arr, { date }) => {
        if (!arr.find(d => d.toISODate() === date.toISODate())) arr[arr.length] = date
        return arr
      }, []).reverse()
      state.stateList = data.reduce((arr, { state }) => {
        if (!arr.find(d => d === state)) arr[arr.length] = state
        return arr
      }, [])

      if (state.selectedStates.length) {
        state.filteredStateData = state.stateData.filter(d => {
          return state.selectedStates.includes(d.state)
        })
      } else {
        state.filteredStateData = state.stateData
      }
    },
    setLoading (state, data) {
      state.loading = data
    },
    setSelectedStates (state, data) {
      state.selectedStates = data
      if (data.length) {
        state.filteredStateData = state.stateData.filter(d => {
          return data.includes(d.state)
        })
      } else {
        state.filteredStateData = state.stateData
      }
    }
  },
  actions: {
    async getData ({ commit }) {
      commit('setLoading', true)
      const covidData = (await (await fetch('https://covidtracking.com/api/states/daily')).json())
        .map(d => ({ ...d, date: DateTime.fromISO(d.date) }))

      const populationData = await d3.csv('/population_states.csv', d3.autoType)
      const data = covidData.map(d => ({ population: populationData.find(c => c.state === d.state).pop, ...d }))
      commit('setStateData', data)
      commit('setLoading', false)
    }
  },
  modules: {
  }
})
