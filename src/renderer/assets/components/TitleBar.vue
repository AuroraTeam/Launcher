<template>
    <div class="titlebar">
        <button v-if="historyBackBtn.show" @click="historyBack">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.84 6.92V8.92H3.84L9.34 14.42L7.92 15.84L0 7.92L7.92 0L9.34 1.42L3.84 6.92H15.84Z" fill="white"/>
            </svg>
        </button>
        <div class="title" v-if="title.show">{{ title.text }}</div>
        <button class="hide" @click="hide()">
            <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H0V0H14V2Z" fill="white"/>
            </svg>
        </button>
        <button class="close" @click="close()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.46 7L14 12.54V14H12.54L7 8.46L1.46 14H0V12.54L5.54 7L0 1.46V0H1.46L7 5.54L12.54 0H14V1.46L8.46 7Z" fill="white"/>
            </svg>
        </button>
    </div>
</template>

<style lang="scss" scoped>
.titlebar {
    padding: 8px;
    display: flex;
    align-items: center;
    -webkit-app-region: drag;
    button {
        -webkit-app-region: no-drag;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background-color: transparent;
        border: 0;
        outline: 0;
        padding: 0;
        cursor: pointer;
    }
    .hide {
        margin-left: auto;
        &:hover path {
            fill: #2F80ED;
        }
    }
    .close {
        margin-left: 7px;
        &:hover path {
            fill: #EB5757;
        }
    }
    .title {
        margin-left: 13px;
    }
}
</style>

<script lang="ts">
import Vue from 'vue'
import LauncherWindow from '../../scripts/window'

export default Vue.extend({
    data() {
        return {
            historyBackBtn: {
                show: false
            },
            title: {
                show: true,
                text: 'AuroraLauncher dev build v0.0.1'
            },
            user: {
                show: false,
                username: 'Test'
            }
        }
    },
    methods: {
        hide: LauncherWindow.hideWindow,
        close: LauncherWindow.closeWindow,
        historyBack() { this.$router.back() }
    }
})
</script>