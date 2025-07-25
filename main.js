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
        id: 'toggle-theme', // Beri ID agar mudah diakses
        label: 'Mode Terang',
        type: 'checkbox',
        checked: false, // Nilai awal
        click: (menuItem, browserWindow) => {
          const newTheme = menuItem.checked ? 'light' : 'dark';
          // Kirim pesan ke renderer untuk mengubah tema
          browserWindow.webContents.send('set-theme', newTheme);
          // Simpan pilihan ke store
          store.set('theme', newTheme);
        }
      },
      { type: 'separator' }, // Garis pemisah
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
        log.info('User triggered manual update check from menu.');
        isManualCheck = true;
        // Langsung jalankan pengecekan tanpa dialog awal
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
let apiKeyIndex = 0;
let usedSubjects = [];
let isManualCheck = false;

// Fungsi untuk mendapatkan API key berikutnya secara bergiliran
function getNextApiKey() {
    const keys = store.get('geminiApiKeys', []); // Ambil array keys
    if (!keys || keys.length === 0) {
        return null; // Tidak ada key yang tersedia
    }
    const key = keys[apiKeyIndex];
    apiKeyIndex = (apiKeyIndex + 1) % keys.length; // Pindah ke index berikutnya, kembali ke 0 jika sudah di akhir
    return key;
}

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
    log.info('App did-finish-load, starting automatic update check.');
    // Tandai bahwa ini adalah pengecekan otomatis (senyap)
    isManualCheck = false;
    autoUpdater.checkForUpdates();
        mainWindow.webContents.send('set-theme', store.get('theme', 'dark'));
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
  log.info('Update not available.');
  // Hanya tampilkan dialog jika pengecekan manual
  if (isManualCheck) {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Pengecekan Update',
        message: 'Anda sudah menggunakan versi terbaru.'
    });
  }
});

autoUpdater.on('error', (err) => {
    const errorMessage = err ? (err.message || err) : 'Unknown error';
    log.error('Auto-updater error:', errorMessage);
    mainWindow.webContents.send('download_error', errorMessage);
    if (isManualCheck) {
        dialog.showErrorBox('Update Error', `Gagal memeriksa pembaruan: ${errorMessage}`);
    }
});

autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('download_progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded. Waiting for user to restart.');
    // Hanya kirim pesan ke UI, jangan paksa restart
    mainWindow.webContents.send('update_downloaded', info);
});

ipcMain.on('start_download', () => {
    log.info('User initiated download.');
    autoUpdater.downloadUpdate();
});

ipcMain.on('restart_app', () => {
    log.info('User initiated restart from renderer.');
    autoUpdater.quitAndInstall();
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
    const savedTheme = store.get('theme', 'dark'); // Default ke dark
    
    // Set status centang pada menu
    const menu = Menu.buildFromTemplate(menuTemplate);
    const toggleThemeItem = menu.getMenuItemById('toggle-theme');
    if (toggleThemeItem) {
        toggleThemeItem.checked = savedTheme === 'light';
    }

    Menu.setApplicationMenu(menu);
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// --- SEMUA IPC HANDLERS ---
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-api-keys', () => store.get('geminiApiKeys', []));
ipcMain.on('save-api-keys', (event, keys) => {
    store.set('geminiApiKeys', keys);
    apiKeyIndex = 0; // Reset index saat daftar key diubah
});
ipcMain.handle('get-user-niches', () => store.get('userNiches'));
ipcMain.on('save-user-niches', (event, niches) => store.set('userNiches', niches));
ipcMain.handle('get-watched-folder-path', () => store.get('watchedFolderPath'));
ipcMain.handle('select-folder', async () => { const { filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] }); if (filePaths && filePaths.length > 0) { const selectedPath = filePaths[0]; store.set('watchedFolderPath', selectedPath); startWatching(mainWindow, selectedPath); return selectedPath; } return store.get('watchedFolderPath'); });
ipcMain.handle('save-csv', async (event, csvData) => { const { filePath } = await dialog.showSaveDialog({ title: 'Simpan Batch CSV', defaultPath: `veo_batch_${Date.now()}.csv`, filters: [{ name: 'CSV Files', extensions: ['csv'] }] }); if (filePath) { try { fs.writeFileSync(filePath, csvData, 'utf-8'); return { success: true }; } catch (err) { return { success: false, error: err.message }; } } return { success: false, canceled: true }; });
ipcMain.handle('save-batch-prompts-csv', async (event, prompts) => { const { filePath } = await dialog.showSaveDialog({ title: 'Simpan Hasil Batch Prompt', defaultPath: `veo_batch_prompts_${Date.now()}.csv`, filters: [{ name: 'CSV Files', extensions: ['csv'] }] }); if (filePath) { try { const header = '"prompt","negative_prompt"\n'; const rows = prompts.map(p => { const promptCsv = `"${p.prompt.replace(/"/g, '""')}"`; const negativeCsv = `"${p.negative_prompt.join(', ').replace(/"/g, '""')}"`; return `${promptCsv},${negativeCsv}`; }).join('\n'); fs.writeFileSync(filePath, header + rows, 'utf-8'); return { success: true }; } catch (err) { return { success: false, error: err.message }; } } return { success: false, canceled: true }; });
ipcMain.handle("generate-prompt", async (event, { sub }) => {
    const GEMINI_API_KEY = getNextApiKey();
    if (!GEMINI_API_KEY) return { error: "Tidak ada Kunci API yang tersimpan." };
    
    const promptText = `
    Based on the sub-category "${sub}", create a single, detailed, and highly cinematic 8-second video prompt.

    Apply these critical principles:
    1.  **Rich and Flowing Action**: This is the most important part. Describe the subject's action with rich, detailed, and flowing language. The action must imply a micro-story or a clear emotional state, not just a simple movement. For example, instead of "a chef cooks," describe "a focused chef meticulously plates a dessert, using tweezers to place a single flower petal, steam gently rising from the dish."
    2.  **Structure**: Follow a 'One Subject, One Scene' structure. Describe the subject (must be unique and not from this exclusion list: [${usedSubjects.join(', ')}]), the detailed environment, camera details, lighting, mood, and color grading.

    Your response MUST be a valid JSON object with THREE keys:
    1.  "subject": A very short (1-3 words) description of the main subject for uniqueness tracking.
    2.  "prompt": The full, detailed video prompt paragraph you assembled based on all the principles above.
    3.  "negative_prompt": An array of 10-15 relevant negative keywords.
    
    Do not include any text outside of the JSON object.
    `;
    
    const result = await generateFromGemini(promptText, GEMINI_API_KEY, "application/json");
    if (result.error) return { error: result.error };

    try {
        const parsedResult = JSON.parse(result.text);
        
        // 1. Subjek yang dihasilkan AI ditambahkan ke 'memori'
        if (parsedResult.subject) {
            usedSubjects.push(parsedResult.subject);
        }

        // 2. Hanya prompt dan negative_prompt yang dikirim ke UI,
        //    sesuai dengan struktur yang Anda inginkan.
        return { 
            success: true, 
            prompt: parsedResult.prompt, 
            negative_prompt: parsedResult.negative_prompt 
        };

    } catch (e) {
        console.error("Failed to parse JSON from AI:", result.text);
        return { error: "Gagal mem-parse respons dari AI." };
    }
});
ipcMain.handle('generate-batch-prompts', async (event, { sub, count }) => {
    const GEMINI_API_KEY = getNextApiKey();
    if (!GEMINI_API_KEY) return { error: "Tidak ada Kunci API." };

     const promptText = `
    Based on the sub-category "${sub}", create ${count} DIFFERENT and UNIQUE cinematic 8-second video prompts.
    
    CRITICAL RULES:
    1.  **Rich and Flowing Action**: The subject's action must be the centerpiece. Describe it with rich, detailed, and flowing language. The action should imply a micro-story or a clear emotional state, not just a simple movement. For instance, instead of "a knight stands," describe "a weary knight slowly kneels, planting their greatsword into the cracked earth, head bowed in exhaustion."
    2.  **Assemble a Detailed Paragraph**: For each prompt, you MUST combine the action with all the following elements into a single, detailed paragraph for the "prompt" key:
        - A unique subject (not from the exclusion list: [${usedSubjects.join(', ')}])
        - A detailed environment/scene.
        - Cinematic details (camera shot, camera movement, lighting).
        - A specific mood and atmosphere.
        - A cinematic color grading style.
    3.  **Uniqueness**: Each of the ${count} new prompts must have a unique subject from each other and from the exclusion list.

    Your response MUST be a valid JSON object with a single key "prompts".
    The value of "prompts" MUST be an array of JSON objects.
    Each object in the array MUST have THREE keys:
    1.  "subject": A very short (1-3 words) description of the main subject for uniqueness tracking.
    2.  "prompt": The full, detailed video prompt paragraph you assembled based on the rules above.
    3.  "negative_prompt": An array of 10-15 relevant negative keywords.
    `;

    const result = await generateFromGemini(promptText, GEMINI_API_KEY, "application/json");
    if (result.error) return { error: result.error };

    try {
        const parsedResult = JSON.parse(result.text);
        if (parsedResult.prompts && Array.isArray(parsedResult.prompts)) {
            const newSubjects = parsedResult.prompts.map(p => p.subject).filter(s => s);
            usedSubjects.push(...newSubjects);
            
            return { success: true, prompts: parsedResult.prompts };
        } else {
            return { error: "Format respons dari AI tidak sesuai." };
        }
    } catch (e) {
        return { error: "Gagal mem-parse respons JSON dari AI." };
    }
});
ipcMain.handle('generate-metadata-and-csv', async (event, { videoFilename, activePrompt }) => {
    const GEMINI_API_KEY = getNextApiKey();
    if (!GEMINI_API_KEY) return { error: "Tidak ada Kunci API yang tersimpan." };
    
    // Prompt diperbarui sesuai permintaan Anda
    const metaPrompt = `
    You are a metadata assistant for stock footage. Based on the video prompt: "${activePrompt}", 
    generate a valid JSON object with three keys: 
    1. "title": An SEO-friendly title between 50 and 200 characters. Do not use colons.
    2. "description": A brief, single sentence describing the video.
    3. "keywords": An array of 40-49 relevant keywords (not including words from the title).
    `;

    const generatedMeta = await generateFromGemini(metaPrompt, GEMINI_API_KEY, "application/json");
    if (generatedMeta.error) return generatedMeta; 
    
    try {
        const metaJson = JSON.parse(generatedMeta.text);
        
        const finalTitle = (metaJson.title || "").replace(/\.$/, '').trim();
        const finalKeywords = metaJson.keywords || [];
        // Menghapus label "Generated by AI"
        const finalDescription = (metaJson.description || "").replace(/\.$/, '').trim();
        
        return { success: true, title: finalTitle, keywords: finalKeywords.join(', '), description: finalDescription };
    } catch (err) {
        return { error: "Gagal mem-parse respons metadata dari AI." };
    }
});
async function generateFromGemini(promptText, apiKey, responseMimeType = "text/plain") {
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
        const body = {
            contents: [{
                parts: [{
                    text: promptText
                }]
            }]
        };
        if (responseMimeType === "application/json") {
            body.generationConfig = {
                response_mime_type: "application/json"
            };
        }
        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const err = await response.json();
            return {
                error: err.error ? err.error.message : 'API Error'
            };
        }
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            return {
                text: data.candidates[0].content.parts[0].text.trim()
            };
        }
        return {
            error: "No valid response from Gemini"
        };
    } catch (err) {
        return {
            error: err.message
        };
    }
}