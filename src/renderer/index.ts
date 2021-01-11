import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSweetalert2 from 'vue-sweetalert2'

import '@sweetalert2/theme-dark/dark.scss'

import BaseLayout from './runtime/components/BaseLayout.vue'
import Login from './runtime/scenes/Login.vue'
import ServersList from './runtime/scenes/ServersList.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/server-list', component: ServersList }
]

Vue.use(VueRouter)
Vue.use(VueSweetalert2)

export const Launcher = new Vue({
    el: '#app',
    router: new VueRouter({ routes }),
    render: h => h(BaseLayout)
})
