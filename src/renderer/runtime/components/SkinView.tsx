import { MutableRefObject, useEffect, useRef } from 'react';
import { WalkingAnimation, SkinViewer } from 'skinview3d';

import defaultSkin from '../assets/images/steve.png';

export default function SkinView() {
    const skinCanvas = useRef() as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        const skinViewer = new SkinViewer({
            canvas: skinCanvas.current,
            width: 220,
            height: 400,
        });

        skinViewer.camera.position.x = -20;
        skinViewer.camera.position.y = 20;
        skinViewer.zoom = 0.8;

        
        skinViewer.controls.enableZoom = false; // Включает возможность масштабирования модели с помощью колесика мыши
        skinViewer.controls.enableRotate = true; // Включает возможность вращения модели с помощью мыши
        skinViewer.controls.rotateSpeed = 0.5; //  скорость вращения модели

        // Установка анимации ходьбы
        const walkingAnimation = new WalkingAnimation();
        skinViewer.animation = walkingAnimation;
        skinViewer.animation.speed = 0.3; // Настройка скорости для более плавной анимации

        // Поддержка загрузки и отображения скина
        const { skinUrl, capeUrl, isAlex } = JSON.parse(
            localStorage.getItem('userData') || '{}',
        );
        if (skinUrl) {
            skinViewer.loadSkin(skinUrl);
        } else {
            skinViewer.loadSkin(defaultSkin);
        }
        if (capeUrl) skinViewer.loadCape(capeUrl);
        if (isAlex) skinViewer.playerObject.skin.modelType = 'slim';
    }, []);

    return <canvas ref={skinCanvas} />;
}
