import { FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { setUserData } from '../../../utils';
import logo from '../../assets/images/logo.png?asset';
import { useModal } from '../../components/Modal/hooks';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';
import { window } from '@config';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('common');

    useEffect(() => {
        launcherAPI.scenes.settings
            .getAllFields()
            .then((res) => {
                if (res.token!="") launcherAPI.scenes.login.authToken().then((userData) => {
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
            <div>{window.title}</div>
            <p>
                {t('login.description1')}
                <br />
                {t('login.description2')}
            </p>
            <form onSubmit={auth}>
                <input type="text" placeholder={t('login.username')} name="login" />
                <input type="password" placeholder={t('login.password')} name="password" />
                <button>{t('login.login')}</button>
                <label className={classes.autoLogin}>
                    <input 
                        type="checkbox"
                        name="autoLogin"
                        defaultChecked={false}
                    />{t('login.rememberMe')}
                </label>
            </form>
        </div>
    );
}
