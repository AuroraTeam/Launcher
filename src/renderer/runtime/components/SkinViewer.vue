<template>
    <canvas ref="skinContainer"></canvas>
</template>

<script lang="ts">
import Vue from 'vue';
import { SkinViewer, WalkingAnimation, createOrbitControls } from 'skinview3d';
import defaultSkin from '../assets/images/steve.png';

export default Vue.extend({
    props: ['url'],
    mounted() {
        const skinViewer = new SkinViewer({
            canvas: <HTMLCanvasElement>this.$refs.skinContainer,
            width: 180,
            height: 360,
            skin: this.url || defaultSkin,
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
