<template>
    <div class="window">
        <div class="skinView">
            <canvas ref="skinContainer"></canvas>
        </div>
        <div class="serverList">
            <ServerButton
                v-for="(server, i) in servers"
                :key="i"
                :onClick="() => selectProfile(server)"
                :server="server"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SkinViewer, WalkingAnimation, createOrbitControls } from 'skinview3d';
import ServerButton from '../components/ServerButton.vue';

export default Vue.extend({
    components: {
        ServerButton,
    },
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
        this.servers = await launcherAPI.api.getServers();
        // TEMP
        this.servers = this.servers.map((server) => ({
            ...server,
            online: {
                current: 50,
                maximum: 100,
            },
        }));

        const skinViewer = new SkinViewer({
            canvas: <HTMLCanvasElement>this.$refs.skinContainer,
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

<style lang="sass" scoped>
.window
    display: flex
    align-items: center
    &>div
        width: 50%
.skinView
    display: flex
    justify-content: center
    canvas:focus
        outline: 0
.serverList
    height: 400px
    margin: 36px 48px 74px 0
    overflow: auto
</style>
