<template>
    <div id="app">
        <title-bar />
        <router-view class="main" />
    </div>
</template>

<style lang="sass" scoped>
.inactive
    pointer-events: none
</style>

<script lang="ts">
import Vue from 'vue';
import TitleBar from './TitleBar.vue';

import '../assets/sass/main.sass';

export default Vue.extend({
    components: {
        TitleBar,
    },
    // TODO Придумать как нормально реализовать проверку подключения к апи
    // mounted() {
    //     window.launcherAPI.ipc.on('apiConnectSuccess', (_e) => {
    //         console.log('apiConnectSuccess');
    //     });
    //     window.launcherAPI.ipc.on('apiConnectError', (_e, message: string) => {
    //         console.log('apiConnectError');
    //         this.$swal({
    //             title: 'Error!',
    //             text: message,
    //             icon: 'error',
    //         });
    //     });
    // },
});
</script>
