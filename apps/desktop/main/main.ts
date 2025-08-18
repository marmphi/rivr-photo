import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path'; import url from 'url';
let win: BrowserWindow | null = null;
const createWindow = async () => {
  win = new BrowserWindow({
    width: 1440, height: 900, backgroundColor: '#1a1a1a',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
    show: false
  });
  if (process.env.VITE_DEV_SERVER_URL) { await win.loadURL(process.env.VITE_DEV_SERVER_URL); win.webContents.openDevTools({mode:'detach'}); }
  else { await win.loadURL(url.pathToFileURL(path.join(__dirname, '../renderer/index.html')).href); }
  win.once('ready-to-show', () => win?.show());
};
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
ipcMain.handle('file.openImage', async () => {
  const res = await dialog.showOpenDialog({ properties:['openFile'], filters:[{name:'Images', extensions:['png','jpg','jpeg']}] });
  if (res.canceled || res.filePaths.length===0) return { filePath: null };
  return { filePath: res.filePaths[0] };
});