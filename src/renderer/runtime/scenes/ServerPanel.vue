<template>
    <div class="block-center">
        <h1>Привет {{username}}</h1>
        <h2>Выбранный профиль: {{selectedProfile.title}}</h2>
        <button @click="startGame">Играть</button>
        <pre v-if="console.length > 0" class="console">{{ console }}</pre>
    </div>
</template>

<style lang="sass" scoped>
.block-center
    display: flex
    align-items: center
    flex-direction: column
    button
        width: 194px
        height: 35px
        margin-bottom: 20px
        border: 0
        border-radius: 17px
        background: linear-gradient(88.14deg, #7F47DD 0%, #2575FC 100%)
        font-size: 16px
        font-family: 'Comfortaa', cursive
        outline: 0
        color: #fff
        box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
    pre
        overflow: auto
        width: calc(100% - 20px)
        height: 280px
        padding: 10px
        margin: auto
        border-radius: 7px
        background-color: rgba(41, 41, 41, 0.9)
</style>

<script lang="ts">
import Vue from 'vue'
import Game from '@scripts/Game'

export default Vue.extend({
    data() {
        return {
            console: '',
            selectedProfile: JSON.parse(localStorage.getItem('selectedProfile') as string),
            username: localStorage.getItem('username')
        }
    },
    methods: {
        startGame() {
            Game.start(this.selectedProfile, this.textToConsole)
        },
        textToConsole(string: string) {
            this.console += string
        }
    }
})
</script>