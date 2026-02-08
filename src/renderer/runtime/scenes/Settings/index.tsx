import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import If from '../../components/If';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';
import InfoPage from './InfoPage';
import MainPage from './MainPage';

export default function Settings() {
    const { t } = useTranslation('common');
    const {
        showTitlebarBackBtn,
        setTitlebarTitleText,
        hideTitlebarSettingsBtn,
        hideTitlebarLogoutBtn,
        resetTitlebarTitleText,
        hideTitlebarBackBtn,
    } = useTitlebar();

    useEffect(() => {
        hideTitlebarLogoutBtn();
        showTitlebarBackBtn();
        hideTitlebarSettingsBtn();
        setTitlebarTitleText(t('settings.title'));

        return () => {
            resetTitlebarTitleText();
            hideTitlebarBackBtn();
        };
    }, []);

    const [main, EditButtonMain] = useState(true);
    const [info, EditButtonInfo] = useState(false);

    const Button = (type: string) => {
        switch (type) {
            case 'main':
                EditButtonMain(true);
                EditButtonInfo(false);
                return;
            case 'info':
                EditButtonMain(false);
                EditButtonInfo(true);
                return;
        }
    };

    return (
        <div className={classes.window}>
            <div className={classes.buttonsList}>
                <div className={classes.buttons}>
                    <button
                        onClick={() => Button('main')}
                        className={main ? classes.active : ''}
                    >
                        {t('settings.sidebar.main')}
                    </button>
                    <button
                        onClick={() => Button('info')}
                        className={info ? classes.active : ''}
                    >
                        {t('settings.sidebar.info')}
                    </button>
                </div>
            </div>
            <If state={main}>
                <MainPage />
            </If>
            <If state={info}>
                <InfoPage />
            </If>
        </div>
    );
}
