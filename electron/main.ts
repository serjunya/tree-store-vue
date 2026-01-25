// electron/main.js
import { app, BrowserWindow } from 'electron';
import path from 'node:path';

// Проверка: работаем ли мы в режиме разработки
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            // Подключаем скрипт предзагрузки, если нужен
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // В продакшене загружаем билд
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(createWindow);
