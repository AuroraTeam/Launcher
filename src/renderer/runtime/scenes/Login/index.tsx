import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { setUserData } from '../../../utils';
import logo from '../../assets/images/logo.png?asset';
import { useModal } from '../../components/Modal/hooks';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

interface AuthData {
    [k: string]: string;
    login: string;
    password: string;
}

export default function Login() {
    const { showModal } = useModal();
    const { showTitlebarSettingsBtn } = useTitlebar();
    const navigate = useNavigate();

    // Example for custom DiscordRPC
    // launcherAPI.rpc.updateActivity({
    //       details: "Проходит этап авторизации"
    // });

    const auth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const { login, password } = Object.fromEntries(formData) as AuthData;

        // Пример валидации
        if (login.length < 3) {
            return showModal(
                'Ошибка ввода',
                'Логин должен быть не менее 3-ёх символов',
            );
        }

        try {
            setUserData(await launcherAPI.scenes.login.auth(login, password));
        } catch (error) {
            console.error(error);
            return showModal('Ошибка авторизации', (error as Error).message);
        }

        showTitlebarSettingsBtn();
        navigate('ServersList');
    };

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
