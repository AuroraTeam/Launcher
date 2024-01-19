import { Server } from '@aurora-launcher/core';
import { useState, useEffect } from 'react';

export function usePingServer(server: Server) {
    const [players, setPlayers] = useState({ online: 0, max: 10 });

    useEffect(() => {
        if (!server.ip) {
            return;
        }

        fetch(
            `https://mcapi.us/server/status?ip=${server.ip}&port=${server.port || 25565}`,
        )
            .then((res) => res.json())
            .then((res) => {
                if (!res.online) return;
                const { max, now } = res.players;
                setPlayers({ max, online: now });
            });
    }, [server]);

    return players;
}
