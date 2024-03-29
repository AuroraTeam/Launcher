import { useEffect } from 'react';

import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

export default function ServersList() {
    const { showTitlebarBackBtn, setTitlebarTitleText, hideTitlebarSettingsBtn } = useTitlebar();
    
    useEffect(() => {
        showTitlebarBackBtn();
        hideTitlebarSettingsBtn();
        setTitlebarTitleText('Настройки лаунчера');
    }, []);

    const main = true

    return (
        <div className={classes.window}>
            <div className={classes.buttonsList}>
                <div className={classes.buttons}>
                    <button disabled = {main}>
                        Основное
                    </button>
                    <button >
                        О лаунчере
                    </button>
                </div>
            </div>
            <div className={classes.options}>
                <label className={classes.checkbox}>
                    <input type="checkbox"  />
                    <span className={classes.checkboxSwitch}></span>
                    Test
                </label>
                <label className={classes.checkbox}>
                    <input type="checkbox"  />
                    <span className={classes.checkboxSwitch}></span>
                    Test2
                </label>
                <label className={classes.checkbox}>
                    <input type="checkbox"  />
                    <span className={classes.checkboxSwitch}></span>
                    Test3
                </label>
                <input className={classes.slider} type="range" list="values" />
                <datalist id="values">
                    <option value="0" />
                    <option value="25" />
                    <option value="50" />
                    <option value="75" />
                    <option value="100" />
                </datalist>
            </div>
        </div>
    );
}
