import { createApp } from 'vue';
import VueSweetalert2 from 'vue-sweetalert2';

import '@sweetalert2/theme-dark';

import BaseLayout from './runtime/components/BaseLayout.vue';
import Login from './runtime/scenes/Login.vue';
// import ServersList from './runtime/scenes/ServersList.vue';
// import ServerPanel from './runtime/scenes/ServerPanel.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', component: Login },
    // { path: '/server-list', component: ServersList },
    // { path: '/server-panel', component: ServerPanel },
];

const app = createApp(BaseLayout);

const router = createRouter({
    // history: createWebHashHistory(),
    history: createWebHistory(),
    routes,
});
app.use(VueSweetalert2);
app.use(router);
app.mount('#app');
