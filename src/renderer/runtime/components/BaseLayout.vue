<template>
    <div id="app">
        <title-bar/>
        <!-- <router-view class="main inactive"/> -->
        <router-view class="main"/>
    </div>
</template>

<style lang="sass" scoped>
.inactive
    pointer-events: none
</style>

<script lang="ts">
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import TitleBar from './TitleBar.vue'

import '../assets/sass/main.sass'

export default Vue.extend({
    components: {
        TitleBar
    },
    mounted() {
        ipcRenderer.on('apiConnectSuccess', (_e, message: string) => {
            // document.querySelector('.inactive')?.classList.remove('inactive')
        })
        ipcRenderer.on('apiConnectError', (_e, message: string) => {
            this.$swal({
                title: 'Error!',
                text: message,
                icon: 'error'
            })
        })
    }
})
</script>