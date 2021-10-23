<template>
    <div id="app">
        <title-bar />
        <router-view :class="`main ${inactive ? 'inactive' : ''}`" />
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
    data() {
        return {
            inactive: true,
        };
    },
    // TODO Доработать
    async mounted() {
        switch (await launcherAPI.api.getStatus()) {
            case 'connected':
                this.inactive = false;
                break;
            case 'connecting':
                break;
            case 'failure':
                console.log('apiConnectError');
                this.$swal({
                    title: 'Ошибка подключения!',
                    text: 'Сервер не доступен',
                    icon: 'error',
                });
        }
    },
});
</script>
