import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import TitleBar from '../TitleBar';

export default function Layout() {
    const [inactive, setInactive] = useState(true);

    useEffect(() => {
        launcherAPI.api.getStatus().then((status) => {
            switch (status) {
                case 'connected':
                    setInactive(false);
                    break;
                case 'connecting':
                    // TODO ?
                    break;
                case 'failure':
                    console.log('apiConnectError');
                // Swal.fire({
                //     title: 'Ошибка подключения!',
                //     text: 'Сервер не доступен',
                //     icon: 'error',
                // });
            }
        });
    }, []);

    return (
        <>
            <TitleBar />
            <main className={`${inactive ? 'inactive' : ''}`}>
                <Outlet />
            </main>
        </>
    );
}
