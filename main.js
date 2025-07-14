const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const Store = require('electron-store');
const chokidar = require('chokidar');
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
// --- TEMPLATE MENU APLIKASI ---
const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Keluar',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Cek Update Aplikasi',
        click: () => {
          // Perintah ini akan memaksa pengecekan update saat menu diklik
          autoUpdater.checkForUpdates();
        }
      },
      {
        label: 'About',
        click: () => {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'About Veo Prompt Master',
                message: `Versi: ${app.getVersion()}\nAuthor: Zenn Vermillion`
            });
        }
      }
    ]
  }
];

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
autoUpdater.autoDownload = false; // PENTING: Jangan unduh otomatis

const store = new Store();
let watcher = null;
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Veo Prompt Master",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile("index.html");

    mainWindow.webContents.on('did-finish-load', () => {
        log.info('App did-finish-load, checking for updates.');
        autoUpdater.checkForUpdates();
        const watchedFolderPath = store.get('watchedFolderPath');
        if (watchedFolderPath && fs.existsSync(watchedFolderPath)) {
            startWatching(mainWindow, watchedFolderPath);
        }
    });
}

// --- Event Listener Auto-Updater (Versi Interaktif FINAL) ---
autoUpdater.on('update-available', (info) => {
    log.info('Update available.', info);
    mainWindow.webContents.send('update_available', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.', info);
  mainWindow.webContents.send('update_not_available'); // <-- Tambahkan ini
});

autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download_progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded; will install now', info);
    mainWindow.webContents.send('update_downloaded');
    setTimeout(() => {
        autoUpdater.quitAndInstall(true, true);
    }, 2000); // Beri waktu 2 detik bagi UI untuk menampilkan pesan "Restarting..."
});

ipcMain.on('start_download', () => {
    log.info('User initiated download.');
    autoUpdater.downloadUpdate();
});

function startWatching(win, folderPath) {
    if (!win) return;
    win.webContents.send('folder-path-changed', folderPath);
    if (watcher) { watcher.close(); }
    watcher = chokidar.watch(folderPath, { ignored: /(^|[\/\\])\../, persistent: true, depth: 0, ignoreInitial: true });
    watcher.on('add', (filePath) => {
        const extension = path.extname(filePath).toLowerCase();
        if (['.mp4', '.mov', '.avi'].includes(extension)) {
            win.webContents.send('new-video-found', { name: path.basename(filePath), path: filePath });
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// --- SEMUA IPC HANDLERS ---
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-api-key', () => store.get('geminiApiKey'));
ipcMain.on('save-api-key', (event, key) => store.set('geminiApiKey', key));
ipcMain.handle('get-user-niches', () => store.get('userNiches'));
ipcMain.on('save-user-niches', (event, niches) => store.set('userNiches', niches));
ipcMain.handle('get-watched-folder-path', () => store.get('watchedFolderPath'));
ipcMain.handle('select-folder', async () => { const { filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }); if (filePaths && filePaths.length > 0) { const selectedPath = filePaths[0]; store.set('watchedFolderPath', selectedPath); startWatching(mainWindow, selectedPath); return selectedPath; } return store.get('watchedFolderPath'); });
ipcMain.handle('save-csv', async (event, csvData) => { const { filePath } = await dialog.showSaveDialog({ title: 'Simpan Batch CSV', defaultPath: `veo_batch_${Date.now()}.csv`, filters: [{ name: 'CSV Files', extensions: ['csv'] }] }); if (filePath) { try { fs.writeFileSync(filePath, csvData, 'utf-8'); return { success: true }; } catch (err) { return { success: false, error: err.message }; } } return { success: false, canceled: true }; });
ipcMain.handle('save-batch-prompts-csv', async (event, prompts) => { const { filePath } = await dialog.showSaveDialog({ title: 'Simpan Hasil Batch Prompt', defaultPath: `veo_batch_prompts_${Date.now()}.csv`, filters: [{ name: 'CSV Files', extensions: ['csv'] }] }); if (filePath) { try { const header = '"prompt","negative_prompt"\n'; const rows = prompts.map(p => { const promptCsv = `"${p.prompt.replace(/"/g, '""')}"`; const negativeCsv = `"${p.negative_prompt.join(', ').replace(/"/g, '""')}"`; return `${promptCsv},${negativeCsv}`; }).join('\n'); fs.writeFileSync(filePath, header + rows, 'utf-8'); return { success: true }; } catch (err) { return { success: false, error: err.message }; } } return { success: false, canceled: true }; });
ipcMain.handle("generate-prompt", async (event, { sub }) => {
    const GEMINI_API_KEY = store.get('geminiApiKey');
    if (!GEMINI_API_KEY) return { error: "Kunci API belum diatur." };
    
    // MENGGUNAKAN KEMBALI INSTRUKSI ANDA YANG ASLI DAN LEBIH BAIK
    const promptText = `
    Based on the sub-category "${sub}", create a detailed, cinematic 8-second video prompt.
    Your response MUST be a valid JSON object with two keys:
    1. "prompt": A string containing the full, detailed video prompt in a single flowing paragraph.
    2. "negative_prompt": An array of 10-15 relevant negative keywords to avoid common AI artifacts for this specific prompt (e.g., "blurry", "deformed", "watermark", "text").
    Do not include any text outside of the JSON object.
    `;
    
    const result = await generateFromGemini(promptText, GEMINI_API_KEY, "application/json");
    if (result.error) return { error: result.error };

    try {
        const parsedResult = JSON.parse(result.text);
        return { success: true, ...parsedResult };
    } catch (e) {
        console.error("Failed to parse JSON from AI:", result.text);
        return { error: "Gagal mem-parse respons dari AI." };
    }
});
ipcMain.handle('generate-batch-prompts', async (event, { sub, count }) => {
    const GEMINI_API_KEY = store.get('geminiApiKey');
    if (!GEMINI_API_KEY) return { error: "Kunci API belum diatur." };

    // MENGGUNAKAN INSTRUKSI YANG DETAIL DAN BENAR
    const promptText = `
    Based on the sub-category "${sub}", create ${count} DIFFERENT and UNIQUE variations of detailed, cinematic 8-second video prompts.

    Your response MUST be a valid JSON object with a single key "prompts".
    The value of "prompts" MUST be an array of JSON objects.
    Each object in the array MUST have two keys:
    1. "prompt": A string containing the full, detailed video prompt in a single flowing paragraph.
    2. "negative_prompt": An array of 10-15 relevant negative keywords for that specific prompt.

    Do not include any text outside of the main JSON object.
    `;

    const result = await generateFromGemini(promptText, GEMINI_API_KEY, "application/json");
    if (result.error) return { error: result.error };

    try {
        const parsedResult = JSON.parse(result.text);
        if (parsedResult.prompts && Array.isArray(parsedResult.prompts)) {
            return { success: true, prompts: parsedResult.prompts };
        } else {
            return { error: "Format respons dari AI tidak sesuai (array 'prompts' tidak ditemukan)." };
        }
    } catch (e) {
        console.error("Failed to parse JSON from AI:", result.text);
        return { error: "Gagal mem-parse respons JSON dari AI." };
    }
});
ipcMain.handle('generate-metadata-and-csv', async (event, { videoFilename, activePrompt }) => { const GEMINI_API_KEY = store.get('geminiApiKey'); if (!GEMINI_API_KEY) return { error: "Kunci API belum diatur." }; const metaPrompt = `You are a metadata assistant for stock footage. Based on the video prompt: "${activePrompt}", generate a valid JSON object with three keys: "title" (under 200 chars, no colons), "description" (one sentence), and "keywords" (an array of 40-49 keywords, not including the title).`; const generatedMeta = await generateFromGemini(metaPrompt, GEMINI_API_KEY, "application/json"); if (generatedMeta.error) return generatedMeta; try { const metaJson = JSON.parse(generatedMeta.text); const finalTitle = (metaJson.title || "").replace(/\.$/, '').trim(); const finalKeywords = metaJson.keywords || []; const finalDescription = `${(metaJson.description || "").replace(/\.$/, '').trim()} - Generated by AI`; return { success: true, title: finalTitle, keywords: finalKeywords.join(', '), description: finalDescription }; } catch (err) { return { error: "Gagal mem-parse respons metadata dari AI." }; }});
async function generateFromGemini(promptText, apiKey, responseMimeType = "text/plain") { const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`; try { const body = { contents: [{ parts: [{ text: promptText }] }] }; if (responseMimeType === "application/json") { body.generationConfig = { response_mime_type: "application/json" }; } const response = await fetch(GEMINI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) { const err = await response.json(); return { error: err.error ? err.error.message : 'API Error' }; } const data = await response.json(); if (data.candidates && data.candidates.length > 0) { return { text: data.candidates[0].content.parts[0].text.trim() }; } return { error: "No valid response from Gemini" }; } catch (err) { return { error: err.message }; }}