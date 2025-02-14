import classes from './index.module.sass';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsFormat } from '../../../../common/types';
import { MemoryRange } from '../../components/MemoryRange';

export default function MainPage() {
    const { t } = useTranslation('common');
    const [settings, setSettings] = useState<SettingsFormat>({});
    const [totalMemory, SetTotalMemory] = useState(0);

    useEffect(() => {
        launcherAPI.scenes.settings
            .getAllFields()
            .then((res) => setSettings(res));
        launcherAPI.scenes.settings
            .getTotalMemory()
            .then((res) => SetTotalMemory(res));
    }, []);

    const setValue = (field: string, value: any) => {
        setSettings({
            ...settings,
            [field]: value,
        });
        launcherAPI.scenes.settings.setField(field, value);
    };
    return(
        <div className={classes.options}>
            <label className={classes.checkbox}>
                <input
                    type="checkbox"
                    checked={settings.fullScreen}
                    onChange={(e) =>
                        setValue(
                            'fullScreen',
                            Boolean(e.target.checked),
                        )
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
                        setValue(
                            'startDebug',
                            Boolean(e.target.checked),
                        )
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
                        setValue(
                            'autoConnect',
                            Boolean(e.target.checked),
                        )
                    }
                />
                <span className={classes.checkboxSwitch}></span>
                {t('settings.autoconnect')}
            </label>
            <label>
                {t('settings.memory')} {settings.memory}MB
            </label>
            <br />
            <MemoryRange
                limit={totalMemory}
                onChange={(e) =>
                    setValue('memory', Number(e.target.value))
                }
                value={settings.memory}
            />
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