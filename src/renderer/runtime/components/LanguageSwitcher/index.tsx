import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import If from '../If';
import classes from './index.module.sass';

export default function LanguageSwitcher() {
    const [open, setOpen] = useState(false);
    const { i18n } = useTranslation();

    const changeLanguage = async (lang: string) => {
        await i18n.changeLanguage(lang);
        setOpen(!open);
    };

    const languagesList = [
        {
            lang: 'en-US',
            text: 'EN',
        },
        {
            lang: 'ru-RU',
            text: 'RU',
        },
    ];

    return (
        <div>
            <button className={classes.button} onClick={() => setOpen(!open)}>
                <Languages />
            </button>
            <If state={open}>
                <nav className={classes.menu}>
                    <ul className={classes.menuList}>
                        {languagesList.map((language) => (
                            <li
                                key={language.lang}
                                className={classes.menuElement}
                                onClick={() => changeLanguage(language.lang)}
                            >
                                {language.text}
                            </li>
                        ))}
                    </ul>
                </nav>
            </If>
        </div>
    );
}
