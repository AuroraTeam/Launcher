import { Server } from '@aurora-launcher/core';
import classes from './index.module.sass';
import { usePingServer } from '../../hooks/pingServer';

interface ServerButtonProps {
    onClick: () => void;
    server: Server;
}

export function ServerButton({ onClick, server }: ServerButtonProps) {
    const players = usePingServer(server);

    return (
        <button className={classes.button} onClick={onClick}>
            <span className={classes.title}>{server.title}</span>
            <span className={classes.online}>
                {players.online || 0} / {players.max || 10}
            </span>
            <div className={classes.next}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.16 9.08V7.08H12.16L6.66 1.58L8.08 0.16L16 8.08L8.08 16L6.66 14.58L12.16 9.08H0.16Z"
                        fill="#fff"
                    />
                </svg>
            </div>
            <progress
                className={classes.progress}
                value={players.online || 0}
                max={players.max || 10}
            ></progress>
        </button>
    );
}
