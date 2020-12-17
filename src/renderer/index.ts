import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSweetalert2 from 'vue-sweetalert2'

import '@sweetalert2/theme-dark/dark.scss'

import BaseLayout from './runtime/components/BaseLayout.vue'
import Login from './runtime/scenes/Login.vue'
import Test from './runtime/scenes/Test.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/test', component: Test }
]

Vue.use(VueRouter)
Vue.use(VueSweetalert2)
new Vue({
    el: '#app',
    router: new VueRouter({ routes }),
    render: h => h(BaseLayout)
})
