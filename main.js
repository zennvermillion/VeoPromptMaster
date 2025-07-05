const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const fetch = require('node-fetch');
const Store = require('electron-store');
const chokidar = require('chokidar');

const store = new Store();
let watcher = null;
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ width: 1280, height: 800, webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false } });
    mainWindow.loadFile("index.html");
    mainWindow.webContents.on('did-finish-load', () => {
        const watchedFolderPath = store.get('watchedFolderPath');
        if (watchedFolderPath && fs.existsSync(watchedFolderPath)) {
            startWatching(mainWindow, watchedFolderPath);
        }
    });
}

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

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// --- IPC Handlers ---
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-api-key', () => store.get('geminiApiKey'));
ipcMain.on('save-api-key', (event, key) => store.set('geminiApiKey', key));
ipcMain.handle('get-user-niches', () => store.get('userNiches'));
ipcMain.on('save-user-niches', (event, niches) => store.set('userNiches', niches));
ipcMain.handle('get-watched-folder-path', () => store.get('watchedFolderPath'));
ipcMain.handle('select-folder', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    if (filePaths && filePaths.length > 0) {
        const selectedPath = filePaths[0];
        store.set('watchedFolderPath', selectedPath);
        startWatching(mainWindow, selectedPath);
        return selectedPath;
    }
    return store.get('watchedFolderPath');
});
ipcMain.handle('save-csv', async (event, csvData) => {
    const { filePath } = await dialog.showSaveDialog({ title: 'Simpan Batch CSV', defaultPath: `veo_batch_${Date.now()}.csv`, filters: [{ name: 'CSV Files', extensions: ['csv'] }] });
    if (filePath) {
        try {
            fs.writeFileSync(filePath, csvData, 'utf-8');
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    }
    return { success: false, canceled: true };
});

ipcMain.handle("generate-prompt", async (event, { sub }) => {
    const GEMINI_API_KEY = store.get('geminiApiKey');
    if (!GEMINI_API_KEY) return { error: "Kunci API belum diatur." };

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

// NAMA HANDLER DIPERBAIKI DI SINI
ipcMain.handle('generate-metadata-and-csv', async (event, { videoFilename, videoFilepath, activePrompt }) => {
    const GEMINI_API_KEY = store.get('geminiApiKey');
    if (!GEMINI_API_KEY) return { error: "Kunci API Gemini belum diatur." };
    
    // 1. Tetap generate Judul dan Keywords seperti biasa
    const metaPrompt = `Based on the video prompt: "${activePrompt}" and filename: "${videoFilename}", generate metadata. Your response MUST be a valid JSON object with two keys: "title" (a single, complete, flowing sentence without a period at the end) and "keywords" (an array of 40 to 49 relevant keywords).`;
    
    const generatedMeta = await generateFromGemini(metaPrompt, GEMINI_API_KEY, "application/json");
    if (generatedMeta.error) return generatedMeta;

    try {
        const metaJson = JSON.parse(generatedMeta.text);
        
        // 2. Lakukan panggilan API KEDUA khusus untuk membuat ringkasan deskripsi
        const summaryPrompt = `Summarize the following video prompt into a single, concise sentence in English, suitable for a stock media description: "${activePrompt}"`;
        const summaryResult = await generateFromGemini(summaryPrompt, GEMINI_API_KEY);
        
        // 3. Gabungkan ringkasan dengan label
        const finalDescription = summaryResult.error 
            ? "Generated by AI" // Fallback jika ringkasan gagal
            : `${summaryResult.text.replace(/\.$/, '')} - Generated by AI`; // Hapus titik jika ada

        return { 
            success: true, 
            title: metaJson.title || "", 
            keywords: (metaJson.keywords || []).join(', '),
            description: finalDescription // Kembalikan deskripsi yang sudah diringkas
        };

    } catch (err) {
        console.error("Error processing metadata:", err);
        return { error: "Failed to parse AI response or create summary." };
    }
});


async function generateFromGemini(promptText, apiKey, responseMimeType = "text/plain") {
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
        const body = { contents: [{ parts: [{ text: promptText }] }] };
        if (responseMimeType === "application/json") { body.generationConfig = { response_mime_type: "application/json" }; }
        const response = await fetch(GEMINI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!response.ok) { const err = await response.json(); return { error: err.error ? err.error.message : 'API Error' }; }
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) return { text: data.candidates[0].content.parts[0].text.trim() };
        return { error: "No valid response from Gemini" };
    } catch (err) { return { error: err.message }; }
}