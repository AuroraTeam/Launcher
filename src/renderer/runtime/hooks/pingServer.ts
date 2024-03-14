import { Server } from '@aurora-launcher/core';
import { useEffect, useState } from 'react';

export function usePingServer(server?: Server) {
    const [players, setPlayers] = useState({ online: 0, max: 0 });

    useEffect(() => {
        if (!server) return;

        launcherAPI.scenes.serversList
            .pingServer(server)
            .then(({ players, maxPlayers }) => {
                // Можно также передать инфу online сервер или нет
                setPlayers({ online: players || 0, max: maxPlayers || 0 });
            });
    }, [server]);

    return players;
}
