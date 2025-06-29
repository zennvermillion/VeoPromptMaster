// preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  generatePrompt: ({ sub }) => ipcRenderer.invoke("generate-prompt", { sub }),
  saveApiKey: (key) => ipcRenderer.send('save-api-key', key),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  generateMetadata: (videoPrompt) => ipcRenderer.invoke('generate-metadata', videoPrompt),
  saveCsv: (csvData) => ipcRenderer.invoke('save-csv', csvData),
  getUserNiches: () => ipcRenderer.invoke('get-user-niches'),
  saveUserNiches: (niches) => ipcRenderer.send('save-user-niches', niches),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});