import { existsSync, lstatSync } from 'fs';

export const isDirectoryPath = (path: string): boolean => existsSync(path) && lstatSync(path).isDirectory();
