<template>
    <div>
        <TitleBar/>
        <div class="block">
            <strong>Aurora Launcher</strong>
            <p>Введите логин и пароль,<br> чтобы продолжить</p>
            <form action="">
                <input type="text" placeholder="Логин">
                <input type="password" placeholder="Пароль">
                <button>Войти</button>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleBar from '../assets/components/TitleBar.vue'

export default Vue.extend({
    components: {
        TitleBar: TitleBar
    }
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

body {
    background: url('../assets/images/waves.png') no-repeat, url('../assets/images/background.png');
    font-family: 'Comfortaa', cursive;
    color: #fff;
    margin: 0;
}

* {
    box-sizing: border-box;
}
</style>

<style lang="scss" scoped>
h1 {
    text-align: center;
}
.block {
    width: 300px;
    height: 450px;
    background-color: #454BDF;
    border-radius: 10px;
    position: absolute;
    top: 50px;
    right: 50px;
    box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    strong {
        font-size: 24px;
        margin-top: 140px;
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }
    p {
        margin: 33px 0;
        font-size: 14px;
        line-height: 16px;
        text-align: center;
        font-family: 'Roboto', sans-serif;
    }
    form {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    input {
        width: 194px;
        height: 35px;
        margin-bottom: 15px;
        border: 2px solid #666BE3;
        border-radius: 17px;
        background-color: transparent;
        text-align: center;
        font-size: 14px;
        font-family: 'Roboto', sans-serif;
        outline: 0;
        color: #fff;
    }
    input::placeholder {
        color: #fff;
    }
    button {
        width: 194px;
        height: 35px;
        margin-top: 15px;
        border: 0;
        border-radius: 17px;
        background: linear-gradient(88.14deg, #7F47DD 0%, #2575FC 100%);
        font-size: 16px;
        font-family: 'Comfortaa', cursive;
        outline: 0;
        color: #fff;
        box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.25);
    }
}
</style>