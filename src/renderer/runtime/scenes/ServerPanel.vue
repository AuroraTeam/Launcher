<template>
    <div class="block-center">
        <h1>Привет {{ username }}</h1>
        <h2>Выбранный сервер: {{ selectedServer.title }}</h2>
        <button @click="startGame" :disabled="gameStarted">Играть</button>
        <div class="progress" v-show="showProgress">
            <div class="progress-line"></div>
        </div>
        <div class="info" v-show="showProgress"></div>
        <pre v-show="console.length > 0" class="console">{{ console }}</pre>
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
        height: 250px
        padding: 10px
        margin: auto
        border-radius: 3px
        background-color: rgba(41, 41, 41, 0.9)
    .progress
        width: 500px
        height: 15px
        background-color: rgba(8, 8, 8, 0.5)
        border-radius: 10px
        overflow: hidden
        margin-bottom: 10px
    .progress-line
        width: 0
        height: 100%
        background-color: #2575FC
        transition-duration: .5s
</style>

<script lang="ts">
import Vue from "vue"
import Game from "@scripts/Game"
import ServerPanel from "@scripts/ServerPanel"
import { Launcher } from "@Launcher"

export default Vue.extend({
    data() {
        return {
            console: "",
            showProgress: false,
            selectedServer: JSON.parse(
                localStorage.getItem("selectedProfile") as string
            ),
            selectedProfile: {},
            username: localStorage.getItem("username"),
            gameStarted: false
        }
    },
    methods: {
        startGame() {
            this.gameStarted = true
            Game.start(
                this.selectedProfile,
                this.textToConsole,
                this.progress,
                () => (this.gameStarted = false)
            )
        },
        textToConsole(string: string) {
            this.console += string
            const consoleEl = document.querySelector(".console")!
            // Если не оборачивать в setImmediate, то оно прокручивает не до конца
            setImmediate(() => {
                consoleEl.scrollTop = consoleEl.scrollHeight
            })
        },
        progress(data: any) {
            const progressEl = document.querySelector(
                ".progress-line"
            ) as HTMLElement
            const total = data.total
            const loaded = data.loaded
            const percent = (loaded / total) * 100

            progressEl.style.width = percent + "%"
            this.showProgress = percent < 100

            const infoEl = document.querySelector(".info") as HTMLElement
            infoEl.innerHTML = `Загружено ${bytesToSize(
                loaded
            )} из ${bytesToSize(total)}`
        }
    },
    async mounted() {
        this.selectedProfile = JSON.parse(
            await ServerPanel.getProfile(this.selectedServer.profileUUID)
        )
        Launcher.$emit("showHistoryBackBtn")
    }
})

function bytesToSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB"]
    if (bytes === 0) return "n/a"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    if (i === 0) return `${bytes} ${sizes[i]})`
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}
</script>
