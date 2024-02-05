import { MutableRefObject, useEffect, useRef } from 'react';
import { IdleAnimation, SkinViewer, createOrbitControls } from 'skinview3d';

import defaultSkin from '../assets/images/steve.png';

export default function SkinView() {
    const skinCanvas = useRef() as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        const skinViewer = new SkinViewer({
            canvas: skinCanvas.current,
            width: 220,
            height: 440,
            skin: defaultSkin,
        });

        skinViewer.camera.position.x = -20;
        skinViewer.camera.position.y = 20;
        skinViewer.zoom = 0.8;

        skinViewer.animations.add(IdleAnimation);

        const control = createOrbitControls(skinViewer);
        control.enableZoom = false;

        // Поддержка загрузки и отображения скина
        // const uuid = localStorage.getItem('userUUID');
        // if (uuid) {
        //     fetch(`http://api.local.host/users/skin/${uuid}`)
        //         .then((res) => res.json())
        //         .then(({ skinUrl, capeUrl, isAlex }) => {
        //             if (skinUrl) skinViewer.loadSkin(skinUrl);
        //             if (capeUrl) skinViewer.loadCape(capeUrl);
        //             if (isAlex) skinViewer.playerObject.skin.modelType = 'slim';
        //         });
        // }
    }, []);

    return <canvas ref={skinCanvas} />;
}
