import { useEffect, useState } from 'react';

import { ServerButton } from '../../components/ServerButton';
import SkinView from '../../components/SkinView';
import classes from './index.module.sass';

interface ServerInfo {
    [key: string]: any;
}

export default function ServersList() {
    const [servers, setServers] = useState<ServerInfo[]>([]);

    useEffect(() => {
        launcherAPI.api.getServers().then(setServers);
    }, []);

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
                        onClick={() => {
                            //
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
