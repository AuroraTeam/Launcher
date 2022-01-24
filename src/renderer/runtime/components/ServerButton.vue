<template>
    <button @click="onClick()">
        <span class="title">{{ server.title }}</span>
        <span class="online"
            >{{ server.online.current }} / {{ server.online.maximum }}</span
        >
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
        <progress
            :value="server.online.current"
            :max="server.online.maximum"
        ></progress>
    </button>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    props: ['onClick', 'server'],
});
</script>

<style lang="sass" scoped>
button
    background: rgba(41, 41, 41, 0.9)
    // filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.4))
    // box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.4)
    border-radius: 5px
    border: 0
    color: #fff
    width: 350px
    height: 60px
    margin: 0 12px 25px auto
    padding: 16px
    display: flex
    align-items: center
    position: relative
    overflow: hidden
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
progress
    position: absolute
    bottom: 0
    left: 0
    width: 100%
    height: 5px
    border: 0
    &::-webkit-progress-bar
        background-color: #6A6A6A
    &::-webkit-progress-value
        background-color: #23B129
</style>
