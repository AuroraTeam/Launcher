<template>
    <div id="#app">
        <title-bar/>
        <router-view/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleBar from './TitleBar.vue'

export default Vue.extend({
    components: {
        TitleBar
    },
})
</script>