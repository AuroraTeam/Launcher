<template>
    <div>
        <div class="block">
            <strong>Aurora Launcher</strong>
            <p>Введите логин и пароль,<br> чтобы продолжить</p>
            <form @submit.prevent="auth()">
                <input type="text" placeholder="Логин" v-model="login">
                <input type="password" placeholder="Пароль" v-model="password">
                <button>Войти</button>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import LauncherAuth from '../../scripts/LauncherAuth'

interface AuthResult {
    code: number,
    message: string,
    login: string
}

export default Vue.extend({
    data() {
        return {
            login: '',
            password: ''
        }
    },
    methods: {
        async auth() {
            const auth: AuthResult = await LauncherAuth.auth(this.login, this.password)
            if (auth.code !== undefined) {
                this.$swal({
                    title: 'Error!',
                    text: auth.message,
                    icon: 'error'
                })
            } else {
                localStorage.setItem('username', auth.login)
                this.$router.push('test')
            }
        }
    }
})
</script>

<style lang="sass" scoped>
h1
    text-align: center
.block
    width: 300px
    height: 450px
    background-color: #454BDF
    border-radius: 10px
    position: absolute
    top: 50px
    right: 50px
    box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
    display: flex
    flex-direction: column
    align-items: center
    strong
        font-size: 24px
        margin-top: 140px
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25)
    p
        margin: 33px 0
        font-size: 13px
        line-height: 16px
        text-align: center
        font-family: 'Roboto', sans-serif
    form
        display: flex
        flex-direction: column
        align-items: center
    input
        width: 194px
        height: 35px
        margin-bottom: 15px
        border: 2px solid #666BE3
        border-radius: 17px
        background-color: transparent
        text-align: center
        font-size: 13px
        font-family: 'Roboto', sans-serif
        outline: 0
        color: #fff
    input::placeholder
        color: #fff
    button
        width: 194px
        height: 35px
        margin-top: 15px
        border: 0
        border-radius: 17px
        background: linear-gradient(88.14deg, #7F47DD 0%, #2575FC 100%)
        font-size: 16px
        font-family: 'Comfortaa', cursive
        outline: 0
        color: #fff
        box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
</style>