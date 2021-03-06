import Vue from 'vue'
import Router from 'vue-router'
// import { domain, fromNow } from './filters'
import App from './App.vue'
import UserProfileView from './components/UserProfileView.vue'
import UserGroupView from './components/UserGroupView.vue'
import NewIncomeView from './components/NewIncomeView.vue'
import PayGroupView from './components/PayGroupView.vue'

require('superagent-promise-plugin').patch(require('superagent'))

// install router
Vue.use(Router)

// routing
var router = new Router({
  hashbang: false,
  history: true,
  root: '/simple'
})

router.map({
  '/': { component: UserGroupView },
  '/new-user': { component: UserProfileView },
  '/user': { component: UserProfileView },
  '/user/:username': { component: UserProfileView },
  '/user-group': { component: UserGroupView },
  '/new-income': { component: NewIncomeView },
  '/pay-group': { component: PayGroupView }
})

router.beforeEach(function () {
  window.scrollTo(0, 0)
})

router.redirect({
  '*': '/' // TODO: make this a 404
})

router.start(App, '#app')

// alt from https://github.com/vuejs/vuex/blob/master/examples/todomvc/main.js
/*
import Vue from 'vue'
import store from './vuex/store'
import App from './components/App.vue'

new Vue({
  store, // inject store to all children
  el: 'body',
  components: { App }
})
*/
