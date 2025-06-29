// main.js - VERSI FINAL DENGAN PERMINTAAN 1 JUDUL

const { app, BrowserWindow, ipcMain, dialog } = require("electron"); // <-- Tambahkan 'dialog'
const path = require("path");
const fs = require("fs"); // <-- Tambahkan 'fs' (File System)
const fetch = require('node-fetch');
const Store = require('electron-store');

const store = new Store();

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Handler untuk menyimpan & mengambil API Key
ipcMain.on('save-api-key', (event, key) => { store.set('geminiApiKey', key); });
ipcMain.handle('get-api-key', () => { return store.get('geminiApiKey'); });

// Handler untuk membuat PROMPT VIDEO UTAMA
ipcMain.handle("generate-prompt", async (event, { sub }) => {
  const GEMINI_API_KEY = store.get('geminiApiKey');
  if (!GEMINI_API_KEY) { return "Error: Kunci API Gemini belum diatur. Silakan masukkan di sidebar."; }
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  try {
    const promptText = `Create a detailed, cinematic 8-second video prompt about "${sub}". Describe the scene in a single, flowing paragraph. Weave together the environment, camera movements, lighting, and overall mood to form a cohesive, narrative description suitable for an AI video generator. Do not use labels or bullet points like 'Environment:' or 'Camera Movement:'.`;
    const response = await fetch(GEMINI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }), });
    if (!response.ok) { const err = await response.json(); const errorMessage = err.error ? err.error.message : 'Terjadi kesalahan pada API'; throw new Error(`API error: ${errorMessage}`); }
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) { return data.candidates[0].content.parts[0].text.trim(); } 
    else { return "Error: Tidak ada respons valid dari Gemini API."; }
  } catch (err) { console.error("Kesalahan saat generate prompt:", err); return `Error: ${err.message}`; }
});


// Fungsi baru untuk menyunting satu judul
async function rewriteTitleAsSentence(titleToRewrite, apiKey) {
  const rewritePrompt = `Rewrite the following title into a single, complete, and flowing sentence.

Original title: "${titleToRewrite}"

Rewritten sentence:`;
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(GEMINI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: rewritePrompt }] }] }), });
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) { return data.candidates[0].content.parts[0].text.trim(); }
    return titleToRewrite;
  } catch (error) { console.error(`Failed to rewrite title: ${titleToRewrite}`, error); return titleToRewrite; }
}

// Handler untuk membuat METADATA (Judul & Keywords)
ipcMain.handle('generate-metadata', async (event, videoPrompt) => {
  const GEMINI_API_KEY = store.get('geminiApiKey');
  if (!GEMINI_API_KEY) { return { error: "Kunci API Gemini belum diatur." }; }
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    // ================================================================
    // VVV PERMINTAAN JUDUL DIUBAH DARI 5 MENJADI 1 VVV
    const metaPrompt = `
    Based on the following cinematic video prompt: "${videoPrompt}"

    Your response MUST be a valid JSON object with two keys:
    1. "titles": an array containing exactly 1 creative and SEO-friendly title idea.
    2. "keywords": an array of 40 to 49 relevant, specific, and trending keywords.
    
    Do not include any text outside of the JSON object.`;
    // ^^^ PERUBAHAN SELESAI ^^^
    // ================================================================
    
    const initialResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: metaPrompt }] }], generationConfig: { response_mime_type: "application/json" } }),
    });

    if (!initialResponse.ok) { throw new Error('API request for initial metadata failed'); }
    const initialData = await initialResponse.json();
    if (!initialData.candidates || initialData.candidates.length === 0) { return { error: "Tidak ada respons valid dari Gemini API untuk metadata." }; }
    
    const resultJson = JSON.parse(initialData.candidates[0].content.parts[0].text);

    // Langkah 2: Sunting/Rewrite setiap judul menjadi kalimat utuh (sekarang hanya 1 judul)
    if (resultJson.titles && Array.isArray(resultJson.titles)) {
      const rewritePromises = resultJson.titles.map(title => rewriteTitleAsSentence(title, GEMINI_API_KEY));
      const rewrittenTitles = await Promise.all(rewritePromises);
      resultJson.titles = rewrittenTitles;
    }
    
    return resultJson;

  } catch (err) { console.error("Kesalahan saat generate metadata:", err); return { error: err.message }; }
});

ipcMain.handle('save-csv', async (event, csvData) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Simpan Metadata sebagai CSV',
    defaultPath: `veo_prompt_batch_${Date.now()}.csv`,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (!canceled && filePath) {
    try {
      fs.writeFileSync(filePath, csvData, 'utf-8');
      return { success: true, path: filePath };
    } catch (err) {
      console.error('Gagal menyimpan file CSV:', err);
      return { success: false, error: err.message };
    }
  }
  
  return { success: false, canceled: true };
});

ipcMain.handle('get-user-niches', () => {
  return store.get('userNiches');
});

ipcMain.on('save-user-niches', (event, niches) => {
  store.set('userNiches', niches);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});