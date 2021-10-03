<template>
    <div class="window">
        <div class="skinView">
            <canvas id="skinContainer"></canvas>
        </div>
        <div class="serverList">
            <button
                v-for="(el, i) in servers"
                :key="i"
                @click="selectProfile(el)"
            >
                <span class="title">{{ el.title }}</span>
                <span class="online">10 / 100</span>
                <div class="next">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0.16 9.08V7.08H12.16L6.66 1.58L8.08 0.16L16 8.08L8.08 16L6.66 14.58L12.16 9.08H0.16Z"
                            fill="#fff"
                        />
                    </svg>
                </div>
            </button>
        </div>
    </div>
</template>

<style lang="sass" scoped>
.window
    display: flex
    align-items: center
    &>div
        width: 50%
.skinView
    display: flex
    justify-content: center
#skinContainer:focus
    outline: 0
.serverList
    height: 400px
    margin: 36px 48px 74px 0
    overflow: auto
    display: flex
    flex-direction: column
    button
        background: rgba(41, 41, 41, 0.9)
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4)
        border-radius: 7px
        border: 0
        color: #fff
        width: 350px
        height: 60px
        margin: 0 12px 25px auto
        padding: 16px
        display: flex
        align-items: center
        &:last-child
            margin-bottom: 0
    .title
        font-weight: bold
        font-size: 24px
        margin-right: auto
        max-width: 200px
        white-space: nowrap
        text-overflow: ellipsis
        overflow: hidden
    .online
        font-size: 18px
        margin: 0 10px
        width: 74px
    .next
        width: 24px
        height: 24px
        display: flex
        align-items: center
        justify-content: center
</style>

<script lang="ts">
import Vue from 'vue';
import { SkinViewer, WalkingAnimation, createOrbitControls } from 'skinview3d';

export default Vue.extend({
    data() {
        return {
            servers: [] as any[],
        };
    },
    methods: {
        selectProfile(profile: object) {
            localStorage.setItem('selectedProfile', JSON.stringify(profile));
            this.$router.push('server-panel');
        },
    },
    async mounted() {
        this.servers = await window.launcherAPI.api.getServers();

        const skinViewer = new SkinViewer({
            canvas: <HTMLCanvasElement>document.getElementById('skinContainer'),
            width: 180,
            height: 360,
            skin: 'runtime/assets/images/steve.png',
        });

        skinViewer.camera.position.x = -25;
        skinViewer.camera.position.y = 18;
        skinViewer.camera.position.z = 46;

        let run = skinViewer.animations.add(WalkingAnimation);
        run.speed = 0.75;

        const control = createOrbitControls(skinViewer);
        control.enableRotate = false;
        control.enableZoom = false;
    },
});
</script>
