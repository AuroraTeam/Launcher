import { useAtomValue } from 'jotai';
import { ArrowLeft, Minus, Settings, User, X } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import LanguageSwitcher from '../../components/LanguageSwitcher';
import If from '../If';
import classes from './index.module.sass';
import {
    titlebarBackBtn,
    titlebarSettingsBtn,
    titlebarTitle,
    titlebarUser,
} from './states';

export default function TitleBar() {
    const backBtn = useAtomValue(titlebarBackBtn);
    const title = useAtomValue(titlebarTitle);
    const settings = useAtomValue(titlebarSettingsBtn);
    const username = useAtomValue(titlebarUser);
    const navigate = useNavigate();

    useEffect(() => {
        if (title?.text) {
            launcherAPI.window.setTitle(title.text);
        }
    }, [title.text]);

    function hide() {
        launcherAPI.window.hide();
    }

    function close() {
        launcherAPI.window.close();
    }

    function goBack() {
        navigate(-1);
    }

    // function logout() {
    //     hideTitlebarSettingsBtn();
    //     setTitlebarUserText('');
    //     launcherAPI.scenes.settings.setField('token', '');
    //     navigate('/');
    // }

    function goToSettings() {
        navigate('/Settings');
    }

    return (
        <div className={classes.titlebar}>
            <div>
                <If state={backBtn.show}>
                    <button className={classes.back} onClick={goBack}>
                        <ArrowLeft />
                    </button>
                </If>
                <If state={title.show}>
                    <span className={classes.text}>{title.text}</span>
                </If>
            </div>
            <div>
                <If state={username.length > 0}>
                    <div className={classes.user}>
                        <User />
                        <div
                            className={[classes.username, classes.text].join(
                                ' ',
                            )}
                        >
                            {username}
                        </div>
                    </div>
                </If>
                <If state={settings.show}>
                    <button className={classes.settings} onClick={goToSettings}>
                        <Settings />
                    </button>
                </If>
                <LanguageSwitcher />
                <button className={classes.hide} onClick={hide}>
                    <Minus />
                </button>
                <button className={classes.close} onClick={close}>
                    <X />
                </button>
            </div>
        </div>
    );
}
