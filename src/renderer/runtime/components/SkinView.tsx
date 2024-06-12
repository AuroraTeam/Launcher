import { MutableRefObject, useEffect, useRef } from 'react';
import { IdleAnimation, SkinViewer } from 'skinview3d';

import defaultSkin from '../assets/images/steve.png';

export default function SkinView() {
    const skinCanvas = useRef() as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        const skinViewer = new SkinViewer({
            canvas: skinCanvas.current,
            width: 220,
            height: 440,
        });

        skinViewer.camera.position.x = -20;
        skinViewer.camera.position.y = 20;
        skinViewer.zoom = 0.8;
        skinViewer.controls.enableZoom = false;
    

        skinViewer.animation = new IdleAnimation();

        // Поддержка загрузки и отображения скина
        const { skinUrl, capeUrl, isAlex } = JSON.parse(
            localStorage.getItem('userData') || '{}',
        );
        if (skinUrl) {
            skinViewer.loadSkin(skinUrl);
        } else {
            // Fuck skinview (race condition moment)
            skinViewer.loadSkin(defaultSkin);
        }
        if (capeUrl) skinViewer.loadCape(capeUrl);
        if (isAlex) skinViewer.playerObject.skin.modelType = 'slim';
    }, []);

    return <canvas ref={skinCanvas} />;
}
