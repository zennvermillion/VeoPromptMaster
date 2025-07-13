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
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Veo Prompt Master", // <-- TAMBAHKAN BARIS INI
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

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
    
    watcher = chokidar.watch(folderPath, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        depth: 0,
        ignoreInitial: true,
    });

    watcher.on('add', (filePath) => {
        const extension = path.extname(filePath).toLowerCase();
        if (['.mp4', '.mov', '.avi'].includes(extension)) {
            win.webContents.send('new-video-found', {
                name: path.basename(filePath),
                path: filePath
            });
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
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
    return { success: false, canceled: true };
});

ipcMain.handle('save-batch-prompts-csv', async (event, prompts) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Simpan Hasil Batch Prompt',
        defaultPath: `veo_batch_prompts_${Date.now()}.csv`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (filePath) {
        try {
            const header = '"prompt","negative_prompt"\n';
            const rows = prompts.map(p => {
                const promptCsv = `"${p.prompt.replace(/"/g, '""')}"`;
                const negativeCsv = `"${p.negative_prompt.join(', ').replace(/"/g, '""')}"`;
                return `${promptCsv},${negativeCsv}`;
            }).join('\n');

            fs.writeFileSync(filePath, header + rows, 'utf-8');
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
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

ipcMain.handle('generate-batch-prompts', async (event, { sub, count }) => {
    const GEMINI_API_KEY = store.get('geminiApiKey');
    if (!GEMINI_API_KEY) return { error: "Kunci API belum diatur." };

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

// =========================================================================
// VVV HANDLER INI YANG DIPERBARUI SECARA TOTAL VVV
// =========================================================================
ipcMain.handle('generate-metadata-and-csv', async (event, { videoFilename, activePrompt }) => {
    const GEMINI_API_KEY = store.get('geminiApiKey');
    if (!GEMINI_API_KEY) return { error: "Kunci API Gemini belum diatur." };

    const metaPrompt = `
    You are a metadata assistant for stock footage. Based on the following video prompt, generate the required metadata.
    PROMPT: "${activePrompt}"

    Your response MUST be a valid JSON object with three keys: "title", "description", and "keywords".

    1.  "title": Create one specific, SEO-friendly title under 200 characters. It MUST be a complete sentence or a strong phrase. DO NOT use colons (:).
    2.  "description": Create a short, one-sentence summary of the prompt.
    3.  "keywords": Create an array of 40 to 49 relevant keywords. IMPORTANT: The keywords array SHOULD NOT include the generated title.
    `;
    
    const generatedMeta = await generateFromGemini(metaPrompt, GEMINI_API_KEY, "application/json");
    if (generatedMeta.error) return generatedMeta;

    try {
        const metaJson = JSON.parse(generatedMeta.text);
        
        const finalTitle = (metaJson.title || "").replace(/\.$/, '').trim();
        const finalKeywords = metaJson.keywords || [];
        const finalDescription = `${(metaJson.description || "").replace(/\.$/, '').trim()} - Generated by AI`;

        return { 
            success: true, 
            title: finalTitle, 
            keywords: finalKeywords.join(', '),
            description: finalDescription
        };
    } catch (err) {
        console.error("Error processing metadata:", err);
        return { error: "Gagal mem-parse respons dari AI." };
    }
});


async function generateFromGemini(promptText, apiKey, responseMimeType = "text/plain") {
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
        const body = { contents: [{ parts: [{ text: promptText }] }] };
        if (responseMimeType === "application/json") {
            body.generationConfig = { response_mime_type: "application/json" };
        }
        const response = await fetch(GEMINI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!response.ok) {
            const err = await response.json();
            return { error: err.error ? err.error.message : 'API Error' };
        }
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            return { text: data.candidates[0].content.parts[0].text.trim() };
        }
        return { error: "No valid response from Gemini" };
    } catch (err) {
        return { error: err.message };
    }
}