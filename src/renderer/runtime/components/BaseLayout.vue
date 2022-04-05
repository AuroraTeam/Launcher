<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TitleBar from './TitleBar.vue';

import '../assets/sass/main.sass';
import Swal from 'sweetalert2';

const inactive = ref(true);

// TODO Доработать
onMounted(async () => {
    switch (await launcherAPI.api.getStatus()) {
        case 'connected':
            inactive.value = false;
            break;
        case 'connecting':
            break;
        case 'failure':
            console.log('apiConnectError');
            Swal.fire({
                title: 'Ошибка подключения!',
                text: 'Сервер не доступен',
                icon: 'error',
            });
    }
});
</script>

<template>
    <main>
        <TitleBar />
        <div class="main">
            <router-view :class="`${inactive ? 'inactive' : ''}`" />
        </div>
    </main>
</template>

<style lang="sass" scoped>
.inactive
    pointer-events: none
</style>
