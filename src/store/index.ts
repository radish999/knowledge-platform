import { atom } from 'jotai';

export const darkModeAtom = atom(false);

export interface User {
  name: string;
  role: 'admin' | 'user';
}

export const userAtom = atom<User | null>(null);
