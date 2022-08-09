<template>
    <div class="window">
        <div class="skinView">
            <SkinViewer />
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
import ServerButton from '../components/ServerButton.vue';
import SkinViewer from '../components/SkinViewer.vue';

export default Vue.extend({
    components: {
        ServerButton,
        SkinViewer,
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
.serverList
    height: 400px
    margin: 36px 48px 74px 0
    overflow: auto
</style>
