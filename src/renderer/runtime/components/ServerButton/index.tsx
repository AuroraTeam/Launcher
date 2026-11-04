import { Server } from "@aurora-launcher/core";

import { usePingServer } from "../../hooks/pingServer";

import classes from "./index.module.sass";

interface ServerButtonProps {
    onClick: () => void;
    server: Server;
}

export function ServerButton({ onClick, server }: ServerButtonProps) {
    const { online, max } = usePingServer(server);

    return (
        <button className={classes.button} onClick={onClick}>
            <div className={classes.overlay}>
                <div className={classes.info}>
                    <span className={classes.title}>{server.title}</span>
                    <span className={classes.online}>
                        {online} / {max}
                    </span>
                </div>
                <div className={classes.progress}>
                    <div
                        className={classes.progressLine}
                        style={{ width: `${(online / max) * 100}%` }}
                    ></div>
                </div>
            </div>
        </button>
    );
}
