import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import If from '../If';
import SkinView from '../SkinView';
import classes from './index.module.sass';
import {
    titlebarBackBtn,
    titlebarSettingsBtn,
    titlebarTitle,
    titlebarUser,
} from './states';
import { SkinView2d } from '../SkinView2d'

export default function TitleBar() {
    const backBtn = useRecoilValue(titlebarBackBtn);
    const title = useRecoilValue(titlebarTitle);
    const settings = useRecoilValue(titlebarSettingsBtn);
    const navigate = useNavigate();
    const username = useRecoilValue(titlebarUser);

    function hide() {
        launcherAPI.window.hide();
    }
    function close() {
        launcherAPI.window.close();
    }
    function historyBack() {
        navigate(-1);
    }
    function toSettings() {
        navigate('/Settings');
    }

    return (
        <div className={classes.titlebar}>
            <div>
                <If state={backBtn.show}>
                    <button className={classes.back} onClick={historyBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path
                                d="M18.84 10.92V12.92H6.84L12.34 18.42L10.92 19.84L3 11.92L10.92 4L12.34 5.42L6.84 10.92H18.84Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </If>
                <If state={title.show}>
                    <span className={classes.text}>{title.text}</span>
                </If>
            </div>
            <div>
                <If state={username.length > 0}>
                    <div className={classes.user}>
                        <SkinView2d width={25} height={25} />
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
                    <button className={classes.settings} onClick={toSettings}>
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path
                                d="M9.99996 6C11.0608 6 12.0782 6.42143 12.8284 7.17157C13.5785 7.92172 14 8.93913 14 10C14 11.0609 13.5785 12.0783 12.8284 12.8284C12.0782 13.5786 11.0608 14 9.99996 14C8.9391 14 7.92168 13.5786 7.17153 12.8284C6.42139 12.0783 5.99996 11.0609 5.99996 10C5.99996 8.93913 6.42139 7.92172 7.17153 7.17157C7.92168 6.42143 8.9391 6 9.99996 6ZM9.99996 8C9.46953 8 8.96082 8.21071 8.58575 8.58579C8.21068 8.96086 7.99996 9.46957 7.99996 10C7.99996 10.5304 8.21068 11.0391 8.58575 11.4142C8.96082 11.7893 9.46953 12 9.99996 12C10.5304 12 11.0391 11.7893 11.4142 11.4142C11.7892 11.0391 12 10.5304 12 10C12 9.46957 11.7892 8.96086 11.4142 8.58579C11.0391 8.21071 10.5304 8 9.99996 8ZM7.99996 20C7.74996 20 7.53996 19.82 7.49996 19.58L7.12996 16.93C6.49996 16.68 5.95996 16.34 5.43996 15.94L2.94996 16.95C2.72996 17.03 2.45996 16.95 2.33996 16.73L0.339961 13.27C0.209961 13.05 0.269962 12.78 0.459962 12.63L2.56996 10.97L2.49996 10L2.56996 9L0.459962 7.37C0.269962 7.22 0.209961 6.95 0.339961 6.73L2.33996 3.27C2.45996 3.05 2.72996 2.96 2.94996 3.05L5.43996 4.05C5.95996 3.66 6.49996 3.32 7.12996 3.07L7.49996 0.42C7.53996 0.18 7.74996 0 7.99996 0H12C12.25 0 12.46 0.18 12.5 0.42L12.87 3.07C13.5 3.32 14.04 3.66 14.56 4.05L17.05 3.05C17.27 2.96 17.54 3.05 17.66 3.27L19.66 6.73C19.79 6.95 19.73 7.22 19.54 7.37L17.43 9L17.5 10L17.43 11L19.54 12.63C19.73 12.78 19.79 13.05 19.66 13.27L17.66 16.73C17.54 16.95 17.27 17.04 17.05 16.95L14.56 15.95C14.04 16.34 13.5 16.68 12.87 16.93L12.5 19.58C12.46 19.82 12.25 20 12 20H7.99996ZM9.24996 2L8.87996 4.61C7.67996 4.86 6.61996 5.5 5.84996 6.39L3.43996 5.35L2.68996 6.65L4.79996 8.2C4.39996 9.37 4.39996 10.64 4.79996 11.8L2.67996 13.36L3.42996 14.66L5.85996 13.62C6.62996 14.5 7.67996 15.14 8.86996 15.38L9.23996 18H10.76L11.13 15.39C12.32 15.14 13.37 14.5 14.14 13.62L16.57 14.66L17.32 13.36L15.2 11.81C15.6 10.64 15.6 9.37 15.2 8.2L17.31 6.65L16.56 5.35L14.15 6.39C13.38 5.5 12.32 4.86 11.12 4.62L10.75 2H9.24996Z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </If>
                <button className={classes.hide} onClick={hide}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M19 13H5V11H19V13Z" fill="white" />
                    </svg>
                </button>
                <button className={classes.close} onClick={close}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path
                            d="M13.46 12L19 17.54V19H17.54L12 13.46L6.46 19H5V17.54L10.54 12L5 6.46V5H6.46L12 10.54L17.54 5H19V6.46L13.46 12Z"
                            fill="white"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
