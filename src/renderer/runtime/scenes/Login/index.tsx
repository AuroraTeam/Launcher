import { FormEvent, useEffect } from 'react';
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
    autoLogin: string;
}

export default function Login() {
    const { showModal } = useModal();
    const { showTitlebarSettingsBtn } = useTitlebar();
    const navigate = useNavigate();
    const { setTitlebarUserText, hideTitlebarLogoutBtn } = useTitlebar();

    useEffect(() => {
        launcherAPI.scenes.settings
            .getAllFields()
            .then((res) => {
                if (res.token!="0") launcherAPI.scenes.login.authToken().then((userData) => {
                    setUserData(userData);
                    setTitlebarUserText(userData.username);
                    showTitlebarSettingsBtn();
                    navigate('ServersList');
                })
            });
        hideTitlebarLogoutBtn();
    }, []);

    const auth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const { login, password, autoLogin } = Object.fromEntries(formData) as AuthData;
        // Пример валидации
        if (login.length < 3) {
            return showModal(
                'Ошибка ввода',
                'Логин должен быть не менее 3-ёх символов',
            );
        }

        try {
            const userData = await launcherAPI.scenes.login.auth(
                login,
                password,
            );
            if (autoLogin) launcherAPI.scenes.settings.setField('token', userData.token)
            setUserData(userData);
            setTitlebarUserText(userData.username);
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
                <label className={classes.autoLogin}>
                    <input 
                        type="checkbox"
                        name="autoLogin"
                        defaultChecked={false}
                    />Автоматическая авторизация
                </label>
            </form>
        </div>
    );
}
