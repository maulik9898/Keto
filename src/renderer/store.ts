import { ipcRenderer } from 'electron';
import { FilterType } from './cantool/DbcType';

export const getPath = (
  key:
    | 'home'
    | 'appData'
    | 'userData'
    | 'sessionData'
    | 'temp'
    | 'exe'
    | 'module'
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
    | 'recent'
    | 'logs'
    | 'crashDumps'
) => ipcRenderer.sendSync('electron-path', key);

export const getLogPath = () => ipcRenderer.sendSync('electron-log-path');

export const storeSet = (key: string, value: any) =>
  ipcRenderer.send('electron-store-set', key, value);

export const storeGet = (key: string) =>
  ipcRenderer.sendSync('electron-store-get', key);

export const storeClear = () => ipcRenderer.send('electron-store-clear');

export const storeDelete = () => ipcRenderer.send('electron-store-delete');

export const storeSetDbc = (dbc: string) => {
  storeSet('dbc', dbc);
  storeSet('isDbcSaved', true);
};

export const storeGetDbc = () => storeGet('dbc');

export const storeGetSaved = () => storeGet('isDbcSaved');

export const storeGetFilter = () => storeGet('filter') as FilterType;

export const storeSetFilter = (filter: FilterType) =>
  storeSet('filter', filter);
