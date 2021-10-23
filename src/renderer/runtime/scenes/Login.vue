<template>
    <div>
        <div class="block">
            <img src="../assets/images/logo.png" />
            <strong>Aurora Launcher</strong>
            <p>
                Введите логин и пароль,<br />
                чтобы продолжить
            </p>
            <form @submit.prevent="auth()">
                <input type="text" placeholder="Логин" v-model="login" />
                <input
                    type="password"
                    placeholder="Пароль"
                    v-model="password"
                />
                <button>Войти</button>
            </form>
        </div>
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
                localStorage.setItem('username', auth.username);
                localStorage.setItem('userUUID', auth.userUUID);
                localStorage.setItem('accessToken', auth.accessToken);
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
    background-color: #454BDF
    border-radius: 10px
    position: absolute
    top: 50px
    right: 50px
    box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
    display: flex
    flex-direction: column
    align-items: center
    img
        height: 160px
    strong
        font-size: 24px
        margin-top: 10px
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25)
    p
        margin: 20px 0
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
        outline: 0
        color: #fff
        box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25)
</style>
