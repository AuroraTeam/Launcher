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
    }, []);

    return <canvas ref={skinCanvas} />;
}
