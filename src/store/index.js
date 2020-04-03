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
    highlightedStates: [],
    selectedStates: []
  },
  mutations: {
    setStateData (state, data) {
      state.dateRange = [data[data.length - 1].date, data[0].date]

      state.allDates = data.reduce((arr, { date }) => {
        if (!arr.find(d => d.toISODate() === date.toISODate())) arr[arr.length] = date
        return arr
      }, []).reverse()
      state.stateList = data.reduce((arr, { state }) => {
        if (!arr.find(d => d === state)) arr[arr.length] = state
        return arr
      }, [])

      // fill in blank data (zeros) for missing states
      state.stateData = state.allDates.reduce((data, date) => { // called once per date
        // Find any dates where there are states missing
        state.stateList.forEach(state => {
          const findRes = data.find(d => d.date === date && d.state === state)
          if (!findRes) data.push({ state, date, positive: 0, totalTestResults: 0 })
        })
        return data
      }, data)

      // If we are filtering by states
      if (state.selectedStates.length) {
        state.filteredStateData = state.stateData.filter(d => {
          // filter by selected state
          return state.selectedStates.includes(d.state)
        })
      } else {
        // don't filter
        state.filteredStateData = state.stateData
      }
    },
    setLoading (state, data) {
      state.loading = data
    },
    setHighlightedStates (state, data) {
      state.highlightedStates = data
      state.filteredStateData = state.filteredStateData.map((d) => ({
        ...d, highlight: data.includes(d.state)
      }))
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
