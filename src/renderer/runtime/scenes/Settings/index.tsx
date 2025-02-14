import { useEffect, useState } from 'react';

import If from '../../components/If';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';
import { useTranslation } from 'react-i18next';
import MainPage from './MainPage';
import InfoPage from './InfoPage';

export default function Settings() {
    const { t } = useTranslation('common');
    const {
        showTitlebarBackBtn,
        setTitlebarTitleText,
        hideTitlebarSettingsBtn,
        hideTitlebarLogoutBtn,
    } = useTitlebar();

    useEffect(() => {
        hideTitlebarLogoutBtn();
        showTitlebarBackBtn();
        hideTitlebarSettingsBtn();
        setTitlebarTitleText(t('settings.title'));
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
                <MainPage/>
            </If>
            <If state={info}>
                <InfoPage/>
            </If>
        </div>
    );
}
