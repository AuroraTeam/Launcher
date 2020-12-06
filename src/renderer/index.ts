import Vue from 'vue'
import VueRouter from 'vue-router'

import BaseLayout from './assets/components/BaseLayout.vue'
import Login from './scenes/Login.vue'
import Test from './scenes/Test.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/test', component: Test }
]

Vue.use(VueRouter)
new Vue({
    el: '#app',
    router: new VueRouter({ routes }),
    render: h => h(BaseLayout)
})
