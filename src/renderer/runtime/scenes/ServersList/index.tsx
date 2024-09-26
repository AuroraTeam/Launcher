import { Server } from '@aurora-launcher/proto';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ServerButton } from '../../components/ServerButton';
import SkinView from '../../components/SkinView';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

export default function ServersList() {
    const {
        hideTitlebarBackBtn,
        showTitlebarSettingsBtn,
        resetTitlebarTitleText,
        showTitlebarLogoutBtn,
    } = useTitlebar();

    const [servers, setServers] = useState<Server[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        hideTitlebarBackBtn();
        showTitlebarLogoutBtn();
        showTitlebarSettingsBtn();
        resetTitlebarTitleText();
        launcherAPI.scenes.serversList.getServers().then(servers => setServers(servers.servers));
        launcherAPI.rpc.updateActivity('default');
    }, []);

    const selectServer = async (server: Server) => {
        await launcherAPI.scenes.serversList.selectServer(server);
        navigate('/ServerPanel');
    };

    return (
        <div className={classes.window}>
            <div className={classes.skinView}>
                <SkinView />
            </div>
            <div className={classes.serverList}>
                {servers.map((server, i) => (
                    <ServerButton
                        key={i}
                        server={server}
                        onClick={() => selectServer(server)}
                    />
                ))}
            </div>
        </div>
    );
}
