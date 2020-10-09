<template>
    <div>
        <TitleBar/>
        <h1>Aurora Launcher Test</h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleBar from './assets/components/TitleBar.vue'

export default Vue.extend({
    components: {
        TitleBar: TitleBar
    }
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap');

body {
    background-image: url('./assets/images/background.png');
    font-family: 'Comfortaa', cursive;
    color: #fff;
    margin: 0;
}
</style>

<style scoped>
h1 {
    text-align: center;
}
</style>