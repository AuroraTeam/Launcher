import Vue from 'vue'
import VueRouter from 'vue-router'

import BaseLayout from './runtime/components/BaseLayout.vue'
import Login from './runtime/scenes/Login.vue'
import Test from './runtime/scenes/Test.vue'

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
