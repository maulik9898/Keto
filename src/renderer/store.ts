import { ipcRenderer } from 'electron';

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
//CAN ID: 1806e5f2  DBCID : 2550588914 DATA: 01 81 02 26 02 26