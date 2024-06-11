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
}

export default function Login() {
    const { showModal } = useModal();
    const { showTitlebarSettingsBtn } = useTitlebar();
    const navigate = useNavigate();
    const { setTitlebarUserText } = useTitlebar();

    // Load remembered credentials
    useEffect(() => {
        const savedLogin = localStorage.getItem('login');
        const savedPassword = localStorage.getItem('password');
        if (savedLogin && savedPassword) {
            (document.querySelector('input[name="login"]') as HTMLInputElement).value = savedLogin;
            (document.querySelector('input[name="password"]') as HTMLInputElement).value = savedPassword;
            (document.querySelector('input[name="rememberMe"]') as HTMLInputElement).checked = true;
        }
    }, []);

    const auth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const { login, password, rememberMe } = Object.fromEntries(formData) as AuthData & { rememberMe: string };

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
            setUserData(userData);
            setTitlebarUserText(userData.username);

            // Save credentials if "Remember me" is checked
            if (rememberMe) {
                localStorage.setItem('login', login);
                localStorage.setItem('password', password);
            } else {
                localStorage.removeItem('login');
                localStorage.removeItem('password');
            }
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
                <div className={classes.rememberMe}>
                    <input type="checkbox" name="rememberMe" id="rememberMe" />
                    <label htmlFor="rememberMe">Запомнить меня</label>
                </div>
                <button>Войти</button>
            </form>
        </div>
    );
}
