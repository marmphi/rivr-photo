import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('bridge', { invoke: (ch: string, ...a: any[]) => ipcRenderer.invoke(ch, ...a) });
declare global { interface Window { bridge: { invoke: (ch: string, ...a: any[]) => Promise<any>; }; } }