import { useTranslation } from "react-i18next";
import classes from './index.module.sass'
import If from "../If";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = async (lang: "en-US" | "ru-RU") => {
    await i18n.changeLanguage(lang);
    setOpen(!open)
  };

  const [open, setOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 17 17">
            <path
              d="M4 0H6V2H10V4H8.86807C8.57073 5.66996 7.78574 7.17117 6.6656 8.35112C7.46567 8.73941 8.35737 8.96842 9.29948 8.99697L10.2735 6H12.7265L15.9765 16H13.8735L13.2235 14H9.77647L9.12647 16H7.0235L8.66176 10.9592C7.32639 10.8285 6.08165 10.3888 4.99999 9.71246C3.69496 10.5284 2.15255 11 0.5 11H0V9H0.5C1.5161 9 2.47775 8.76685 3.33437 8.35112C2.68381 7.66582 2.14629 6.87215 1.75171 6H4.02179C4.30023 6.43491 4.62904 6.83446 4.99999 7.19044C5.88743 6.33881 6.53369 5.23777 6.82607 4H0V2H4V0ZM12.5735 12L11.5 8.69688L10.4265 12H12.5735Z"
              fill="#ffff"
            >
            </path>
          </svg>
      </button>
      <If state={open}>
        <nav className={classes.menu}>
          <ul className={classes.menuList}>
            <li className={classes.menuElement}
              onClick={() => changeLanguage("ru-RU")}>
              RU
            </li>
            <li className={classes.menuElement}
              onClick={() => changeLanguage("en-US")}>
              EN
            </li>
          </ul>
        </nav>
      </If>
    </div>
  );
}
