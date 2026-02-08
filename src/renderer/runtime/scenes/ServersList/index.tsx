import { Server } from '@aurora-launcher/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ServerButton } from '../../components/ServerButton';
import SkinView from '../../components/SkinView';
import { useTitlebar } from '../../components/TitleBar/hooks';
import classes from './index.module.sass';

export default function ServersList() {
    const navigate = useNavigate();
    const [servers, setServers] = useState<Server[]>([]);

    const {
        hideTitlebarBackBtn,
        showTitlebarSettingsBtn,
        resetTitlebarTitleText,
    } = useTitlebar();

    useEffect(() => {
        hideTitlebarBackBtn();
        showTitlebarSettingsBtn();
        resetTitlebarTitleText();

        launcherAPI.scenes.serversList
            .getServers()
            .then(setServers)
            .catch(console.error);

        launcherAPI.rpc.updateActivity('default');
    }, []);

    async function selectServer(server: Server) {
        await launcherAPI.scenes.serversList.selectServer(server);
        navigate('/ServerPanel');
    }

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
