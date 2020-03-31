<template>
  <div>
    <div class="columns">
      <div class="column">
        <testing-v-positive-cases />
        <testing-over-time v-if="false" />
      </div>
      <b-menu style="padding-top: 30px; " class="column container is-fluid is-one-fifth">
        <div style="position: sticky; top: 10px;">
          <b-menu-list label="Graphs">
            <b-menu-item
              icon="information-outline"
              active
              label="Testing Capacity vs Positive Cases"
            ></b-menu-item>
          </b-menu-list>
        </div>
      </b-menu>
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

export default {
  name: 'Home',
  components: {
    TestingVPositiveCases,
    TestingOverTime
  },
  created () {
    this.$store.dispatch('getData')
  }
}
</script>
