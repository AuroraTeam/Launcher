<template>
    <div id="app">
        <title-bar/>
        <!-- <router-view class="main inactive"/> -->
        <router-view class="main"/>
        <video class="bgv" autoplay loop src="../assets/test.mp4"></video>
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

<style lang="sass" scoped>
.bgv
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: -1
    object-fit: none
</style>