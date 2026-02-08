import { window } from '@config';
import { FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/images/logo.png?asset';
import { useModal } from '../../components/Modal/hooks';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

export default function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    const { showModal } = useModal();
    const { showTitlebarSettingsBtn } = useTitlebar();

    useEffect(() => {
        showTitlebarSettingsBtn();
        launcherAPI.scenes.login.initialize().then(() => {
            navigate('ServersList');
        });
    }, []);

    async function auth(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const { login, password } = Object.fromEntries(formData) as Record<
            string,
            string
        >;

        // Пример валидации
        if (login.length < 3) {
            return showModal(
                'Ошибка ввода',
                'Логин должен быть не менее 3-ёх символов',
            );
        }

        try {
            await launcherAPI.scenes.login.auth(login, password);
        } catch (error) {
            if (error instanceof Error) {
                return showModal('Ошибка авторизации', error.message);
            }

            console.error(error);
            return showModal('Неизвестная ошибка', `${error}`);
        }

        navigate('ServersList');
    }

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
                <input
                    type="text"
                    placeholder={t('login.username')}
                    name="login"
                />
                <input
                    type="password"
                    placeholder={t('login.password')}
                    name="password"
                />
                <button>{t('login.login')}</button>
            </form>
        </div>
    );
}
