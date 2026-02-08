import { useEffect, useRef } from 'react';

import { getUserData } from '../../../utils';
import defaultSkin from '../../assets/images/steve.png';
import { SkinViewer2D } from '../../libs/skinview2d/viewer';

interface SkinView2dProps {
    width: number;
    height: number;
}

export const SkinView2d = ({ width = 64, height = 64 }: SkinView2dProps) => {
    const skinHeadRef = useRef<HTMLDivElement>(null);

    const { skinUrl } = getUserData();

    useEffect(() => {
        renderSkinViewer();
    }, [width, height]);

    const renderSkinViewer = () => {
        if (!skinHeadRef.current) return;
        new SkinViewer2D({
            domElement: skinHeadRef.current,
            skinUrl: skinUrl ?? defaultSkin,
            width: width,
            height: height,
        });
    };

    return (
        <div
            ref={skinHeadRef}
            style={{ maxWidth: `${width}px`, maxHeight: `${height}px` }}
        />
    );
};
