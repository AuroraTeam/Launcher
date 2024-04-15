import { useEffect, useRef, useState, MutableRefObject } from 'react';
import If from '../../components/If';

import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

export default function ServersList() {
    const { showTitlebarBackBtn, setTitlebarTitleText, hideTitlebarSettingsBtn } = useTitlebar();
    
    useEffect(() => {
        showTitlebarBackBtn();
        hideTitlebarSettingsBtn();
        setTitlebarTitleText('Настройки лаунчера');
    }, []);

    const [main, EditeButtonMain] = useState(true);
    const [info, EditeButtonInfo] = useState(false);

    const RAMvalue = useRef() as MutableRefObject<HTMLLabelElement>;

    const Slader = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        RAMvalue.current.innerText = `Выделено оперативной памяти: ${value}`
    }

    const Button = (type: string) => {
        switch (type) {
            case 'main':
                EditeButtonMain(true);
                EditeButtonInfo(false);
                return
            case 'info':
                EditeButtonMain(false);
                EditeButtonInfo(true);
                return
        }
    };

    return (
        <div className={classes.window}>
            <div className={classes.buttonsList}>
                <div className={classes.buttons}>
                    <button onClick={() => Button('main')} disabled = {main}>
                        Основное
                    </button>
                    <button onClick={() => Button('info')} disabled = {info}>
                        О лаунчере
                    </button>
                </div>
            </div>
            <If state={main}>
                <div className={classes.options}>
                    <label className={classes.checkbox}>
                        <input type="checkbox"  />
                        <span className={classes.checkboxSwitch}></span>
                        Запуск игры во весь экран
                    </label>
                    <label className={classes.checkbox}>
                        <input type="checkbox"  />
                        <span className={classes.checkboxSwitch}></span>
                        Запуск игры в дебаг режиме
                    </label>
                    <label className={classes.checkbox}>
                        <input type="checkbox"  />
                        <span className={classes.checkboxSwitch}></span>
                        Автоматический вход на сервер
                    </label>
                    <label ref={RAMvalue}>Выделено оперативной памяти: 0</label><br />
                    <input className={classes.slider} type="range" list="values" defaultValue="0" onChange={e => Slader(e)}/>
                    <datalist id="values">
                        <option value="0" label="5MG"/>
                        <option value="25" label="10MG"/>
                        <option value="50" label="20MG"/>
                        <option value="75" label="30MG"/>
                        <option value="100" label="40MG"/>
                    </datalist>
                </div>
            </If>
            <If state={info}>
                <div>
                <img src="./runtime/assets/images/logo.png" alt="" />
                </div>
            </If>
        </div>
    );
}
