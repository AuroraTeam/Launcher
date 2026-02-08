import { atom } from 'jotai';
import { ReactNode } from 'react';

export const modalShow = atom(false);

export const modalTitle = atom('Modal title');

export const modalContent = atom(<ReactNode>'Modal content');
