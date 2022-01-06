<template>
    <div class="window">
        <div class="info">
            <div class="server">
                <div class="title">{{ selectedServer.title }}</div>
                <div class="buttons">
                    <button @click="startGame" :disabled="gameStarted">
                        Играть
                    </button>
                    <button>Настройки</button>
                    <button class="round">
                        <svg
                            width="4"
                            height="16"
                            viewBox="0 0 4 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2 12C2.53043 12 3.03914 12.2107 3.41421 12.5858C3.78929 12.9609 4 13.4696 4 14C4 14.5304 3.78929 15.0391 3.41421 15.4142C3.03914 15.7893 2.53043 16 2 16C1.46957 16 0.96086 15.7893 0.585787 15.4142C0.210714 15.0391 0 14.5304 0 14C0 13.4696 0.210714 12.9609 0.585787 12.5858C0.96086 12.2107 1.46957 12 2 12ZM2 6C2.53043 6 3.03914 6.21071 3.41421 6.58579C3.78929 6.96086 4 7.46957 4 8C4 8.53043 3.78929 9.03914 3.41421 9.41421C3.03914 9.78929 2.53043 10 2 10C1.46957 10 0.96086 9.78929 0.585787 9.41421C0.210714 9.03914 0 8.53043 0 8C0 7.46957 0.210714 6.96086 0.585787 6.58579C0.96086 6.21071 1.46957 6 2 6ZM2 0C2.53043 0 3.03914 0.210714 3.41421 0.585786C3.78929 0.960859 4 1.46957 4 2C4 2.53043 3.78929 3.03914 3.41421 3.41421C3.03914 3.78929 2.53043 4 2 4C1.46957 4 0.96086 3.78929 0.585787 3.41421C0.210714 3.03914 0 2.53043 0 2C0 1.46957 0.210714 0.960859 0.585787 0.585786C0.96086 0.210714 1.46957 0 2 0Z"
                                fill="#E8E9F3"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="status">
                <div class="gamers">
                    Игроков<br />
                    онлайн
                </div>
                <div class="line"></div>
                <div class="count">
                    10
                    <div class="total">из 100</div>
                </div>
            </div>
        </div>
        <div class="progress" v-show="showProgress">
            <div class="progress-line"></div>
        </div>
        <div class="progress-info" v-show="showProgress"></div>
        <pre v-show="console.length > 0" class="console">{{ console }}</pre>
    </div>
</template>

<style lang="sass" scoped>
.window
    &::after // Костыльненько
        content: ''
        position: absolute
        top: 0
        bottom: 0
        left: 0
        right: 0
        z-index: -1
        background-image: url('../assets/images/server-background.png')
    .info
        display: flex
        justify-content: space-between
        padding: 20px
        .server
            .title
                margin-top: 24px
                font-size: 72px
            .buttons
                display: flex
                button
                    cursor: pointer
                    height: 30px
                    padding: 7px 19px
                    border: 2px solid #2575FC
                    border-radius: 15px
                    font-size: 14px
                    font-family: 'Comfortaa', cursive
                    outline: 0
                    color: #fff
                    box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
                    &:not(:last-child)
                        margin-right: 18px
                    &.round
                        display: flex
                        align-items: center
                        justify-content: center
                        width: 30px
                        padding: 0
        .status
            display: flex
            align-items: center
            text-align: right
            font-weight: bold
            color: #f2f2f2
            margin: 42px 0px
            .gamers
                font-size: 30px
            .line
                margin: 0 16px
                height: 80%
                width: 1px
                background-color: #E8E9F3
            .count
                font-size: 48px
                .total
                    font-size: 18px
                    color: #bdbdbd

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
        border-radius: 7px
        overflow: hidden
        margin: auto
        margin-bottom: 10px
    .progress-line
        width: 0
        height: 100%
        background-color: #2575FC
        transition-duration: .5s
    .progress-info
        text-align: center
        margin-bottom: 10px
</style>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data() {
        return {
            console: '',
            showProgress: false,
            selectedServer: JSON.parse(
                localStorage.getItem('selectedProfile') as string
            ),
            selectedProfile: {},
            username: localStorage.getItem('username'),
            gameStarted: false,
        };
    },
    methods: {
        startGame() {
            this.gameStarted = true;
            launcherAPI.game.start(
                this.selectedProfile,
                this.textToConsole,
                this.progress,
                () => (this.gameStarted = false)
            );
        },
        textToConsole(string: string) {
            this.console += string;
            const consoleEl = document.querySelector('.console')!;
            // Если не оборачивать в setTimeout, то оно прокручивает не до конца
            setTimeout(() => {
                consoleEl.scrollTop = consoleEl.scrollHeight;
            }, 1);
        },
        progress(data: any) {
            const progressEl = document.querySelector(
                '.progress-line'
            ) as HTMLElement;
            const total = data.total;
            const loaded = data.loaded;
            const percent = (loaded / total) * 100;

            progressEl.style.width = percent + '%';
            this.showProgress = percent < 100;

            const infoEl = document.querySelector(
                '.progress-info'
            ) as HTMLElement;
            infoEl.innerHTML = `Загружено ${bytesToSize(
                loaded
            )} из ${bytesToSize(total)}`;
        },
    },
    async mounted() {
        this.selectedProfile = JSON.parse(
            await launcherAPI.api.getProfile(this.selectedServer.profileUUID)
        );
        this.$root.$emit('showHistoryBackBtn');
    },
});

function bytesToSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB'];
    if (bytes === 0) return 'n/a';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i === 0) return `${bytes} ${sizes[i]})`;
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}
</script>
