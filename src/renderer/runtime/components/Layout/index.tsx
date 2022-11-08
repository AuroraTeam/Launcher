import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import swal from 'sweetalert';

import Modal from '../Modal';
import { useModal } from '../Modal/hooks';
import TitleBar from '../TitleBar';
import classes from './index.module.sass';

export default function Layout() {
    const [inactive, setInactive] = useState(true);
    const { showModal } = useModal();

    useEffect(() => {
        launcherAPI.api.getStatus().then((status) => {
            console.log(status);

            switch (status) {
                case 'connected':
                    setInactive(false);
                    break;
                case 'connecting':
                    // TODO ?
                    break;
                case 'failure':
                    showModal('Ошибка подключения!', 'Сервер недоступен');
                // swal({
                //     title: 'Ошибка подключения!',
                //     text: 'Сервер недоступен',
                //     icon: 'error',
                // });
            }
        });
    }, []);

    return (
        <>
            <TitleBar />
            <main className={`${inactive ? classes.inactive : ''}`}>
                <Outlet />
            </main>
            <Modal />
        </>
    );
}
