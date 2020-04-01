<template>
  <div>
    <div class="columns">
      <div class="column">
        <testing-v-positive-cases />
        <testing-over-time v-if="false" />
      </div>
      <div class="column is-one-fifth container is-fluid">
        <div style="position: sticky; top: 10px;">
          <b-menu style="padding-top: 30px;">
            <div style=" top: 10px;">
              <b-menu-list label="Graphs">
                <b-menu-item
                  icon="information-outline"
                  active
                  label="Testing Capacity vs Positive Cases"
                ></b-menu-item>
              </b-menu-list>
            </div>
          </b-menu>

          <div class="columns" style="padding-top: 20px">
            <b-field class="column" label="Filter states:">
              <b-select
                multiple
                native-size="10"
                :value="selectedStates"
                @input="(e) => $store.commit('setSelectedStates', e)"
              >
                <option v-for="state in stateList" :key="state" :value="state">{{state}}</option>
              </b-select>
            </b-field>
            <p class="column">
              Hold control and click to select mutltiple states. Or,
              <a
                @click="() => $store.commit('setSelectedStates', stateList)"
              >click here</a> to select all.
            </p>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>CovidGraphs</strong> by
          <a href="https://twitter.com/danielhep">Daniel Heppner</a>. The source code is licensed
          <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. Data provided by
          <a href="https://covidtracking.com/">The COVID Tracking Project.</a>
        </p>
        <a href="https://github.com/danielhep/coronagraphs">
          <b-icon icon="github"></b-icon>
        </a>
      </div>
    </footer>
  </div>
</template>

<script>
// @ is an alias to /src
import TestingVPositiveCases from '@/components/TestingVPositiveCases.vue'
import TestingOverTime from '@/components/TestingOverTime.vue'
import { mapState } from 'vuex'

export default {
  name: 'Home',
  components: {
    TestingVPositiveCases,
    TestingOverTime
  },
  created () {
    this.$store.dispatch('getData')
  },
  computed: {
    ...mapState(['stateList', 'selectedStates'])
  }
}
</script>
