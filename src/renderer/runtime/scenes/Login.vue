<template>
    <div class="block">
        <img class="logo" src="../assets/images/logo.png" />
        <div>Aurora Launcher</div>
        <p>
            Введите логин и пароль,<br />
            чтобы продолжить
        </p>
        <form @submit.prevent="auth()">
            <input type="text" placeholder="Логин" v-model="login" />
            <input type="password" placeholder="Пароль" v-model="password" />
            <button>Войти</button>
        </form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

interface AuthResult {
    error: string;
    username: string;
    userUUID: string;
    accessToken: string;
}

export default Vue.extend({
    data() {
        return {
            login: '',
            password: '',
        };
    },
    methods: {
        async auth() {
            // Валидацию можно делать как хошш))
            if (this.login.length < 4)
                return this.showError(
                    'Логин должен быть не менее 4-ёх символов'
                );
            if (this.password.length < 8)
                return this.showError(
                    'Пароль должен быть не менее 8-ми символов'
                );

            const auth: AuthResult = await launcherAPI.auth(
                this.login,
                this.password
            );
            if (auth.error !== undefined) {
                this.showError(auth.error);
            } else {
                this.$root.$emit('setUser', auth.username);
                this.$root.$emit('showUser');
                localStorage.setItem('username', auth.username); // @deprecated
                localStorage.setItem('userUUID', auth.userUUID); // @deprecated
                localStorage.setItem('accessToken', auth.accessToken); // @deprecated
                this.$router.push('server-list');
            }
        },
        showError(message: string) {
            this.$swal({
                title: 'Error!',
                text: message,
                icon: 'error',
            });
        },
    },
});
</script>

<style lang="sass" scoped>
h1
    text-align: center
.block
    width: 300px
    height: 450px
    background-color: #454BDFdf
    border-radius: 10px
    position: absolute
    top: 50px
    right: 50px
    box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
    display: flex
    flex-direction: column
    align-items: center
    img
        height: 90px
        margin-top: 35px
        border-radius: 50%
        filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))
    div
        font-size: 24px
        margin-top: 20px
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25)
    p
        margin: 25px 0 30px
        font-size: 14px
        line-height: 17px
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25)
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
        &::placeholder
            color: #fff
        &:hover, &:focus
            &::placeholder
                color: #ddd
    button
        width: 194px
        height: 35px
        margin-top: 15px
        border: 0
        border-radius: 17px
        background: linear-gradient(88.14deg, #7F47DD 0%, #2575FC 100%)
        font-size: 16px
        outline: 0
        color: #fff
        box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
        &:hover
            box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25)
</style>
