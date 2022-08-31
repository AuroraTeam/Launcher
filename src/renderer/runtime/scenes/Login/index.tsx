import { FormEvent } from 'react';

import logo from '../../assets/images/logo.png';
import classes from './index.module.sass';

interface AuthResult {
    error: string;
    username: string;
    userUUID: string;
    accessToken: string;
}

export default function Login() {
    async function auth(event: FormEvent) {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);
        const { login, password } = Object.fromEntries(formData) as Record<
            string,
            string
        >;

        console.log({ login, password });

        // Валидацию можно делать как хошш))
        // if (login.length < 4)
        //     return showError('Логин должен быть не менее 4-ёх символов');
        // if (password.length < 8)
        //     return showError('Пароль должен быть не менее 8-ми символов');
        // const auth: AuthResult = await launcherAPI.auth(login, password);
        // if (auth.error !== undefined) {
        //     showError(auth.error);
        // } else {
        //     // this.$root.$emit('setUser', auth.username);
        //     // this.$root.$emit('showUser');
        //     localStorage.setItem('username', auth.username); // @deprecated
        //     localStorage.setItem('userUUID', auth.userUUID); // @deprecated
        //     localStorage.setItem('accessToken', auth.accessToken); // @deprecated
        //     // this.$router.push('server-list');
        // }
    }

    // function showError(message: string) {
    //     Swal.fire({
    //         title: 'Error!',
    //         text: message,
    //         icon: 'error',
    //     });
    // }

    return (
        <div className={classes.block}>
            <img src={logo} />
            <div>Aurora Launcher</div>
            <p>
                Введите логин и пароль,
                <br />
                чтобы продолжить
            </p>
            <form onSubmit={auth}>
                <input type="text" placeholder="Логин" name="login" />
                <input type="password" placeholder="Пароль" name="password" />
                <button>Войти</button>
            </form>
        </div>
    );
}
