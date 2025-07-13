const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  saveApiKey: (key) => ipcRenderer.send('save-api-key', key),
  getUserNiches: () => ipcRenderer.invoke('get-user-niches'),
  saveUserNiches: (niches) => ipcRenderer.send('save-user-niches', niches),
  getWatchedFolderPath: () => ipcRenderer.invoke('get-watched-folder-path'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  generatePrompt: ({ sub }) => ipcRenderer.invoke("generate-prompt", { sub }),
  onNewVideo: (callback) => ipcRenderer.on('new-video-found', (_event, value) => callback(value)),
  generateMetadataAndCsv: (payload) => ipcRenderer.invoke('generate-metadata-and-csv', payload),
  saveCsv: (csvData) => ipcRenderer.invoke('save-csv', csvData),
  generateBatchPrompts: (payload) => ipcRenderer.invoke('generate-batch-prompts', payload),
  saveBatchPromptsCsv: (data) => ipcRenderer.invoke('save-batch-prompts-csv', data),

  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', (_event) => callback()),
  onUpdateDownloadStart: (callback) => ipcRenderer.on('update_download_start', (_event) => callback()),
  onDownloadProgress: (callback) => ipcRenderer.on('download_progress', (_event, value) => callback(value)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', (_event) => callback()),
  restartApp: () => ipcRenderer.send('restart_app'),
});