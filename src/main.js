import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import VueResizeObserver from 'vue-resize-observer'
import VueGtag from 'vue-gtag'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
// register globally
Vue.component('multiselect', Multiselect)
Vue.use(VueResizeObserver)
Vue.use(VueGtag, {
  config: { id: 'UA-64119500-4' }
})

Vue.config.productionTip = false

Vue.use(Buefy)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
