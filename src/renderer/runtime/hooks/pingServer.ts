import { Server } from '@aurora-launcher/core';
import { useState, useEffect } from 'react';

export function usePingServer(server: Server) {
    const [players, setPlayers] = useState({ online: 0, max: 10 });

    useEffect(() => {
        if (!server.ip) {
            return;
        }

        fetch(
            `https://api.mcstatus.io/v2/status/java/${server.ip}:${server.port}`,
        ).then((response) => {
            response.json().then((data) => {
                if (data.online) {
                    setPlayers(data.players);
                }
            });
        });
    }, [server]);

    return players;
}
