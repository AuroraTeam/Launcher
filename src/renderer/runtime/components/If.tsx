import { ReactNode } from 'react';

interface IfProps {
    state: boolean;
    children: ReactNode;
}

export default function If({ state = false, children }: IfProps) {
    return state ? children : null;
}
