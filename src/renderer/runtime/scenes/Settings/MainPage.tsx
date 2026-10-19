import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsFormat } from '../../../../common/types';
import classes from './index.module.sass';

export default function MainPage() {
    const { t } = useTranslation('common');
    const [settings, setSettings] = useState<SettingsFormat>();
    const [error, setError] = useState('');

    useEffect(() => {
        launcherAPI.scenes.settings
            .getAllFields()
            .then(setSettings)
            .catch(() => setError(t('settings.loadError')));
    }, []);

    const setValue = <T extends keyof SettingsFormat>(
        field: T,
        value: SettingsFormat[T],
    ) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [field]: value,
        });
        launcherAPI.scenes.settings
            .setField(field, value)
            .catch(() => setError(t('settings.saveError')));
    };
    if (!settings) return <p role="status">{error || t('settings.loading')}</p>;
    return (
        <div className={classes.options}>
            {error && <p role="alert">{error}</p>}
            <label className={classes.checkbox}>
                <input
                    type="checkbox"
                    checked={settings.fullScreen}
                    onChange={(e) =>
                        setValue('fullScreen', Boolean(e.target.checked))
                    }
                />
                <span className={classes.checkboxSwitch}></span>
                {t('settings.fullscreen')}
            </label>
            <label className={classes.checkbox}>
                <input
                    type="checkbox"
                    checked={settings.startDebug}
                    onChange={(e) =>
                        setValue('startDebug', Boolean(e.target.checked))
                    }
                />
                <span className={classes.checkboxSwitch}></span>
                {t('settings.debug')}
            </label>
            <label className={classes.checkbox}>
                <input
                    type="checkbox"
                    checked={settings.autoConnect}
                    onChange={(e) =>
                        setValue('autoConnect', Boolean(e.target.checked))
                    }
                />
                <span className={classes.checkboxSwitch}></span>
                {t('settings.autoconnect')}
            </label>
            <label>{t('settings.dir')}</label>
            <br />
            <div className={classes.changeDir}>
                <button
                    className={classes.openDir}
                    onClick={() => {
                        if (!settings.dir) return;
                        launcherAPI.window.openDir(settings.dir);
                    }}
                >
                    {settings.dir}
                </button>
                <button
                    className={classes.editDir}
                    onClick={() => {
                        launcherAPI.window.editDir();
                        launcherAPI.scenes.settings
                            .getAllFields()
                            .then((res) => {
                                setSettings(res);
                            });
                    }}
                >
                    {t('settings.dirEdit')}
                </button>
            </div>
        </div>
    );
}
