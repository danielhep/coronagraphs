<template>
  <div class="columns is-fluid">
    <div class="column">
      <testing-v-positive-cases />
    </div>
    <b-menu style="padding-top: 20px" class="column container is-fluid is-one-fifth">
      <b-menu-list label="Graphs">
        <b-menu-item icon="information-outline" active label="Testing Capacity vs Positive Cases"></b-menu-item>
      </b-menu-list>
    </b-menu>
  </div>
</template>

<script>
// @ is an alias to /src
import TestingVPositiveCases from '@/components/TestingVPositiveCases.vue'

export default {
  name: 'Home',
  components: {
    TestingVPositiveCases
  },
  created () {
  }
}
</script>
