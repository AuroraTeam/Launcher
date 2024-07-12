import { MutableRefObject, useEffect, useRef } from 'react';

import defaultSkin from '../../assets/images/steve.png';
import { SkinViewer2D } from '../../libs/skinview2d/viewer';
import { getUserData } from '../../../utils';
interface SkinView2dProps {
    width: number;
    height: number;
}
export const SkinView2d = ({
    width = 64,
    height = 64,
}: SkinView2dProps) => {
    const skinHeadRef = useRef() as MutableRefObject<HTMLDivElement>;

		const { skinUrl } = getUserData();

    useEffect(() => {
        renderSkinViewer();
    }, [width, height]);

    const renderSkinViewer = () => {
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
