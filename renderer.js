document.addEventListener('DOMContentLoaded', () => {

    const ICONS = {
        sun: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> Light Mode`,
        moon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> Dark Mode`,
        video: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`,
        processed: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
        reuse: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
        favorite: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        copy: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`
    };
    
    const getEl = (id) => document.getElementById(id);
    const mainNicheSelect=getEl("mainNiche"), subNicheSelect=getEl("subNiche"), generateBtn=getEl("generateBtn"), randomBtn=getEl("randomBtn"), output=getEl("output"), copyBtn=getEl("copyBtn"), favBtn=getEl("favBtn"), historyListEl=getEl("historyList"), favoriteListEl=getEl("favoriteList"), modeToggle=getEl("modeToggle"), notif=getEl("notif"), apiKeyInput=getEl("apiKeyInput"), saveApiKeyBtn=getEl("saveApiKeyBtn"), metadataSection=getEl("metadataSection"), startSessionBtn=getEl("startSessionBtn"), manageNichesBtn=getEl("manageNichesBtn"), nicheModal=getEl("nicheModal"), closeNicheModal=getEl("closeNicheModal"), newMainNicheInput=getEl("newMainNicheInput"), addMainNicheBtn=getEl("addMainNicheBtn"), mainNicheSelectForNewSub=getEl("mainNicheSelectForNewSub"), newSubNicheInput=getEl("newSubNicheInput"), addSubNicheBtn=getEl("addSubNicheBtn"), nicheManagementList=getEl("nicheManagementList"), appVersionEl=getEl("appVersion"), modalNotif=getEl("modalNotif"), exportCounter=getEl("exportCounter"), progressBar=getEl("progressBar"), exportCsvBtn=getEl("exportCsvBtn"), clearBatchBtn=getEl("clearBatchBtn");
    const tabButtons = document.querySelectorAll(".main-tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
    const selectFolderBtn = getEl("selectFolderBtn");
    const watchedFolderPathEl = getEl("watchedFolderPath");
    const productionQueueEl = getEl("productionQueue");
    const activePromptDisplay = getEl("activePromptDisplay");
    const negativePromptSection = getEl("negativePromptSection"), negativePromptOutput = getEl("negativePromptOutput"), copyNegativeBtn = getEl("copyNegativeBtn");

    let activePrompt = "", currentPrompt = "", negativePromptText = "", currentHistoryTab = "history";
    let historyData = [], favoriteData = [], metadataBatch = [], niches = {};
    const BATCH_GOAL = 25;
    const defaultNiches = { "💫 Abstract & Motion": ["Glowing particle symphony", "Liquid ink explosion in space"], "💼 Business & Office": ["Startup team brainstorming in glass office", "Late-night coder in modern workspace"], "🍜 Food & Culinary": ["Street vendor grilling satay at sunset", "Slow motion of soup being poured into bowl"], "🌿 Nature & Landscape": ["Fog rolling over mountain ridge at dawn", "Sunlight through ancient forest canopy"], "🎉 Seasonal & Event": ["New Year fireworks over city skyline", "Winter snow festival with glowing lanterns"], "🤖 Tech & Futuristic": ["Humanoid robot exploring neon-lit lab", "Futuristic city skyline with flying cars"], "🌀 Surreal & Dreamscape": ["Floating islands over cloud ocean", "Dreamlike glowing forest with bioluminescence"], "😂 Humor & Levity": ["Office chair race in slow motion", "Dog wearing glasses working on laptop", "Cat knocking things off table"], "🌆 Retro Futurism": ["1980s neon cityscape with VHS glitch", "Cyberpunk computer lab with retro monitors"], "🎥 Immersive Cinematics": ["Walking through glowing tunnel with depth", "Cinematic drone shot over misty valley at sunrise"]};
    
    function showNotification(text) { if(notif) { notif.textContent = text; notif.classList.add('show'); setTimeout(() => notif.classList.remove('show'), 2500); } }
    function showModalNotification(message) { if(modalNotif) { modalNotif.textContent = message; modalNotif.classList.add('show'); setTimeout(() => modalNotif.classList.remove('show'), 2200); } }
    function setButtonsState(isLoading) { if (generateBtn) generateBtn.disabled = isLoading; if (randomBtn) randomBtn.disabled = isLoading; }
    function applyMode(theme) { document.documentElement.setAttribute("data-theme", theme); if (modeToggle) { modeToggle.innerHTML = theme === 'light' ? ICONS.moon : ICONS.sun; } }
    async function loadAppVersion() { if (appVersionEl) { const version = await window.api.getAppVersion(); appVersionEl.textContent = `v${version}`; } }
    async function loadInitialApiKey() { const savedKey = await window.api.getApiKey(); if (apiKeyInput && savedKey) { apiKeyInput.value = savedKey; } }
    function populateMainNiche() { if (!mainNicheSelect) return; mainNicheSelect.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>'; Object.keys(niches).sort().forEach(niche => { const opt = document.createElement("option"); opt.value = niche; opt.textContent = niche; mainNicheSelect.appendChild(opt); }); }
    function populateSubNiche(main) { if (!subNicheSelect) return; subNicheSelect.innerHTML = '<option value="" disabled selected>Pilih Sub-Kategori...</option>'; subNicheSelect.disabled = true; if (generateBtn) generateBtn.disabled = true; if (main && niches[main]) { [...niches[main]].sort().forEach(sub => { const opt = document.createElement("option"); opt.value = sub; opt.textContent = sub; subNicheSelect.appendChild(opt); }); subNicheSelect.disabled = false; } }
    async function saveNiches() { await window.api.saveUserNiches(niches); populateMainNiche(); renderNicheManagementList(); populateNicheModalDropdown(); }
    function setActivePrompt(prompt) { activePrompt = prompt; if(activePromptDisplay) { activePromptDisplay.innerHTML = `Sesi Aktif: <span class="prompt-text">${prompt.substring(0, 70)}...</span>`; activePromptDisplay.hidden = false; } showNotification("Prompt Aktif ditetapkan. Pindah ke Production Queue."); }
    function createQueueItem(file) {
    const { name, path } = file;
    if (!productionQueueEl) return;
    const emptyQueueEl = productionQueueEl.querySelector('.empty-queue');
    if (emptyQueueEl) emptyQueueEl.remove();
    const uniqueId = `queue-item-${name.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (document.getElementById(uniqueId)) return;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'queue-item';
    itemDiv.id = uniqueId;
    itemDiv.innerHTML = `<div class="queue-item-icon">${ICONS.video}</div><div class="queue-item-info"><div class="filename" title="${name}">${name}</div><div class="status">Menunggu diproses...</div></div><div class="queue-item-action"><button class="primary generate-meta-queue-btn">Generate Metadata</button></div>`;
    productionQueueEl.appendChild(itemDiv);
    
    const processBtn = itemDiv.querySelector('.generate-meta-queue-btn');
    processBtn.addEventListener('click', async () => {
        if (!activePrompt) {
            showNotification("Error: Tidak ada 'Prompt Aktif'. Buat atau pilih prompt di Tab Generator.");
            return;
        }
        processBtn.disabled = true;
        processBtn.textContent = "Memproses...";
        const statusEl = itemDiv.querySelector('.status');
        if(statusEl) statusEl.textContent = 'Menghubungi AI...';

        const result = await window.api.generateMetadataAndCsv({ videoFilename: name, videoFilepath: path, activePrompt: activePrompt });

        if (result.error) {
            if(statusEl) statusEl.textContent = `Gagal: ${result.error}`;
            processBtn.textContent = "Coba Lagi";
            processBtn.disabled = false;
        } else {
            if(statusEl) statusEl.textContent = `Selesai! Metadata ditambahkan ke batch.`;
            processBtn.innerHTML = `${ICONS.processed} Selesai`;
            processBtn.classList.add('processed');
            
            // Simpan data LENGKAP ke batch, termasuk deskripsi baru
            const metadataItem = {
                Filename: name,
                Title: result.title,
                Keywords: result.keywords,
                Description: result.description // <-- MENYIMPAN DESKRIPSI
            };
            metadataBatch.push(metadataItem);
            localStorage.setItem("veoMetadataBatch_v2", JSON.stringify(metadataBatch));
            updateExportUI();
        }
    });
}

    function renderList(tab) { const listContainer = getEl(`${tab}List`); if (!listContainer) return; listContainer.innerHTML = ''; const data = tab === 'history' ? historyData : favoriteData; if (data.length === 0) { listContainer.innerHTML = `<div class="list-item"><span class="prompt-text">Belum ada data.</span></div>`; return; } data.slice().reverse().forEach(item => { if(!item) return; const promptText = (typeof item === 'object') ? item.prompt : item; if(!promptText) return; const div = document.createElement("div"); div.className = 'list-item'; const textSpan = document.createElement('span'); textSpan.className = 'prompt-text'; textSpan.textContent = promptText; textSpan.title = promptText; textSpan.addEventListener("click", () => { if (output) output.textContent = promptText; currentPrompt = promptText; if(copyBtn) copyBtn.disabled = false; if(favBtn) favBtn.disabled = favoriteData.includes(promptText); if(metadataSection) metadataSection.hidden = false; }); const actionsDiv = document.createElement('div'); actionsDiv.className = 'action-icons'; const reuseBtn = document.createElement('button'); reuseBtn.className = 'icon-button'; reuseBtn.title = 'Reuse Prompt'; reuseBtn.innerHTML = ICONS.reuse; reuseBtn.addEventListener('click', () => { setActivePrompt(promptText); const queueTabBtn = document.querySelector('.main-tab-button[data-tab="production-queue"]'); if (queueTabBtn) queueTabBtn.click(); }); actionsDiv.appendChild(reuseBtn); if (tab === 'history') { const favBtnIcon = document.createElement('button'); favBtnIcon.className = 'icon-button'; favBtnIcon.title = 'Tambah ke Favorite'; favBtnIcon.innerHTML = ICONS.favorite; favBtnIcon.addEventListener('click', () => addToFavorite(promptText)); actionsDiv.appendChild(favBtnIcon); } else { const copyBtnIcon = document.createElement('button'); copyBtnIcon.className = 'icon-button'; copyBtnIcon.title = 'Salin'; copyBtnIcon.innerHTML = ICONS.copy; copyBtnIcon.addEventListener('click', () => { navigator.clipboard.writeText(promptText).then(() => showNotification("Prompt disalin!")); }); const delBtn = document.createElement("button"); delBtn.className = 'icon-button'; delBtn.title = "Hapus dari Favorite"; delBtn.innerHTML = ICONS.trash; delBtn.addEventListener('click', () => removeFavorite(promptText)); actionsDiv.appendChild(copyBtnIcon); actionsDiv.appendChild(delBtn); } div.appendChild(textSpan); div.appendChild(actionsDiv); listContainer.appendChild(div); });}
    function addToHistory(historyObject) { if (!historyObject || !historyObject.prompt) return; if (historyData.some(item => item.prompt === historyObject.prompt)) return; historyData.push(historyObject); if (historyData.length > 25) historyData.shift(); localStorage.setItem("veoPromptHistory_v3", JSON.stringify(historyData)); renderList('history'); }
    function addToFavorite(prompt) { if (!prompt || favoriteData.includes(prompt)) return; favoriteData.push(prompt); localStorage.setItem("veoPromptFavorites_v2", JSON.stringify(favoriteData)); showNotification("Ditambahkan ke favorit!"); renderList('favorite'); if (favBtn) favBtn.disabled = true; }
    function removeFavorite(prompt) { favoriteData = favoriteData.filter(fav => fav !== prompt); localStorage.setItem("veoPromptFavorites_v2", JSON.stringify(favoriteData)); showNotification("Dihapus dari favorit."); renderList('favorite'); }
    async function generateSinglePrompt(sub) { 
        try { 
            const result = await window.api.generatePrompt({ sub }); 
            if (result.error) { throw new Error(result.error); } 
            
            if(result.success) {
                const promptText = result.prompt;
                negativePromptText = Array.isArray(result.negative_prompt) ? result.negative_prompt.join(', ') : '';

                if (output) output.textContent = promptText;
                if (negativePromptOutput) negativePromptOutput.textContent = negativePromptText;
                
                currentPrompt = promptText;
                if (copyBtn) copyBtn.disabled = false;
                if (favBtn) favBtn.disabled = favoriteData.includes(promptText);
                if (metadataSection) metadataSection.hidden = false;
                if (negativePromptSection) negativePromptSection.hidden = false;

                addToHistory({ subNiche: sub, prompt: promptText });
            } else {
                throw new Error("Respons dari AI tidak valid.");
            }
        } catch (err) { 
            console.error(err); 
            if(output) output.textContent = `Error: ${err.message}`; 
            if(negativePromptSection) negativePromptSection.hidden = true;
        } 
    }
    
    function updateExportUI() { if (!exportCounter || !progressBar || !exportCsvBtn) return; const count = metadataBatch.length; exportCounter.textContent = `${count}/${BATCH_GOAL}`; const progressPercentage = Math.min((count / BATCH_GOAL) * 100, 100); progressBar.style.width = `${progressPercentage}%`; exportCsvBtn.disabled = count === 0; }
    function convertToCSV(data) {
    const header = '"Filename","Title","Description","Keywords"\n';
    const rows = data.map(item => {
        const cleanTitle = (item.Title || '').replace(/"/g, '""');
        const cleanDescription = (item.Description || '').replace(/"/g, '""'); 
        const cleanKeywords = (item.Keywords || '').replace(/"/g, '""');
        // Urutan diubah agar sesuai header
        return `"${item.Filename}","${cleanTitle}","${cleanDescription}","${cleanKeywords}"`;
    });
    return header + rows.join('\n');
}
    function renderNicheManagementList() { if (!nicheManagementList) return; nicheManagementList.innerHTML = ''; Object.keys(niches).sort().forEach(mainNiche => { const mainItem = document.createElement('div'); mainItem.className = 'niche-item'; mainItem.innerHTML = `<span>${mainNiche}</span><button class="delete-niche-btn" data-main-niche="${mainNiche}">&times;</button>`; nicheManagementList.appendChild(mainItem); if (niches[mainNiche] && niches[mainNiche].length > 0) { [...niches[mainNiche]].sort().forEach(subNiche => { const subItem = document.createElement('div'); subItem.className = 'sub-niche-item'; subItem.innerHTML = `<span><span class="sub-niche-icon">›</span>${subNiche}</span><button class="delete-niche-btn" data-main-niche="${mainNiche}" data-sub-niche="${subNiche}">&times;</button>`; nicheManagementList.appendChild(subItem); }); } }); }
    function populateNicheModalDropdown() { if (!mainNicheSelectForNewSub) return; mainNicheSelectForNewSub.innerHTML = '<option value="" disabled selected>Pilih Kategori Utama...</option>'; Object.keys(niches).sort().forEach(niche => { const opt = document.createElement("option"); opt.value = niche; opt.textContent = niche; mainNicheSelectForNewSub.appendChild(opt); }); }
    
    async function initializeApp() {
        await loadAppVersion();
        let storedNiches = await window.api.getUserNiches();
        if (!storedNiches || Object.keys(storedNiches).length === 0) { niches = defaultNiches; await saveNiches(); } 
        else { niches = storedNiches; }
        populateMainNiche();
        const savedMode = localStorage.getItem("themeMode") || "dark";
        applyMode(savedMode);
        await loadInitialApiKey();
        historyData = JSON.parse(localStorage.getItem("veoPromptHistory_v3") || "[]");
        favoriteData = JSON.parse(localStorage.getItem("veoPromptFavorites_v2") || "[]");
        metadataBatch = JSON.parse(localStorage.getItem("veoMetadataBatch_v2") || "[]");
        renderList('history');
        renderList('favorite');
        updateExportUI();
        const initialPath = await window.api.getWatchedFolderPath();
        if(initialPath && watchedFolderPathEl){ watchedFolderPathEl.textContent = initialPath; }
    }
    
    // --- Event Listeners ---
    if (mainNicheSelect) { mainNicheSelect.addEventListener("change", (e) => { populateSubNiche(e.target.value); }); }
    if (subNicheSelect) { subNicheSelect.addEventListener("change", () => { if (generateBtn) { generateBtn.disabled = !subNicheSelect.value; } }); }
    tabButtons.forEach(button => { button.addEventListener('click', () => { tabButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); const targetId = `${button.dataset.tab}View`; tabContents.forEach(content => { content.classList.toggle('active', content.id === targetId); }); if (button.dataset.tab === 'history' || button.dataset.tab === 'favorite') { currentHistoryTab = button.dataset.tab; renderList(currentHistoryTab); } }); });
    if (selectFolderBtn) { selectFolderBtn.addEventListener('click', async () => { const selectedPath = await window.api.selectFolder(); if (selectedPath && watchedFolderPathEl) { watchedFolderPathEl.textContent = selectedPath; } }); }
    window.api.onNewVideo((file) => { createQueueItem(file); });
    if (generateBtn) { generateBtn.addEventListener("click", async () => { if (!subNicheSelect || !subNicheSelect.value) return; if (output) output.textContent = "Generating..."; setButtonsState(true); await generateSinglePrompt(subNicheSelect.value); setButtonsState(false); }); }
    if (randomBtn) { randomBtn.addEventListener("click", async () => { if (output) output.textContent = "Generating..."; setButtonsState(true); const mains = Object.keys(niches); const main = mains[Math.floor(Math.random() * mains.length)]; const subs = niches[main]; const sub = subs[Math.floor(Math.random() * subs.length)]; await generateSinglePrompt(sub); setButtonsState(false); }); }
    if (startSessionBtn) { startSessionBtn.addEventListener("click", () => { if (output && output.textContent && !output.textContent.startsWith("Hasil prompt")) { setActivePrompt(output.textContent); const screeningTabBtn = document.querySelector('.main-tab-button[data-tab="production-queue"]'); if (screeningTabBtn) screeningTabBtn.click(); } else { showNotification("Generate sebuah prompt terlebih dahulu."); } }); }
    if (copyBtn) { copyBtn.addEventListener("click", () => { if (!currentPrompt) return; navigator.clipboard.writeText(currentPrompt).then(() => showNotification("Prompt disalin!")); }); }
    if (copyNegativeBtn) { copyNegativeBtn.addEventListener('click', () => { if (!negativePromptText) return; navigator.clipboard.writeText(negativePromptText).then(() => showNotification("Negative prompt disalin!")); }); }
    if (favBtn) { favBtn.addEventListener("click", () => { if (!currentPrompt || currentPrompt.startsWith('Error:')) return; addToFavorite(currentPrompt); }); }
    if (saveApiKeyBtn && apiKeyInput) { saveApiKeyBtn.addEventListener('click', () => { const key = apiKeyInput.value.trim(); if (key) { window.api.saveApiKey(key); showNotification("API Key berhasil disimpan!"); } else { showNotification("Harap masukkan API Key."); } }); }
    if (manageNichesBtn) { manageNichesBtn.addEventListener('click', () => { populateNicheModalDropdown(); renderNicheManagementList(); if (nicheModal) nicheModal.showModal(); }); }
    if (closeNicheModal) { closeNicheModal.addEventListener('click', () => nicheModal.close()); }
    if (addMainNicheBtn) { addMainNicheBtn.addEventListener('click', async () => { const newNiche = newMainNicheInput.value.trim(); if (newNiche && !niches[newNiche]) { niches[newNiche] = []; await saveNiches(); newMainNicheInput.value = ''; showModalNotification("Kategori utama ditambahkan!"); } }); }
    if (addSubNicheBtn) { addSubNicheBtn.addEventListener('click', async () => { const selectedMain = mainNicheSelectForNewSub.value; const newSub = newSubNicheInput.value.trim(); if (selectedMain && newSub && !niches[selectedMain].includes(newSub)) { niches[selectedMain].push(newSub); await saveNiches(); newSubNicheInput.value = ''; showModalNotification("Sub-kategori ditambahkan!"); } }); }
    if (nicheManagementList) { nicheManagementList.addEventListener('click', async (e) => { if (e.target.classList.contains('delete-niche-btn')) { const main = e.target.dataset.mainNiche; const sub = e.target.dataset.subNiche; if (main && sub) { if (confirm(`Yakin ingin menghapus sub-niche "${sub}"?`)) { const index = niches[main].indexOf(sub); if (index > -1) niches[main].splice(index, 1); } } else if (main) { if (confirm(`Yakin ingin menghapus kategori utama "${main}" beserta semua isinya?`)) { delete niches[main]; } } await saveNiches(); } }); }
    if (exportCsvBtn) { exportCsvBtn.addEventListener('click', async () => { if (metadataBatch.length === 0) { return showNotification(`Batch kosong.`); } const csvData = convertToCSV(metadataBatch); const result = await window.api.saveCsv(csvData); if (result.success) { showNotification(`File berhasil disimpan!`); metadataBatch = []; localStorage.setItem("veoMetadataBatch_v2", JSON.stringify(metadataBatch)); updateExportUI(); } else if (!result.canceled) { showNotification(`Error: Gagal menyimpan file. ${result.error}`); } }); }
    if (clearBatchBtn) { clearBatchBtn.addEventListener('click', () => { if (metadataBatch.length > 0 && confirm("Apakah Anda yakin ingin mengosongkan batch yang sudah terkumpul?")) { metadataBatch = []; localStorage.setItem("veoMetadataBatch_v2", JSON.stringify(metadataBatch)); updateExportUI(); showNotification("Batch berhasil dikosongkan."); } }); }
    if (modeToggle) { modeToggle.addEventListener("click", () => { const newTheme = (document.documentElement.getAttribute("data-theme") || "dark") === "dark" ? "light" : "dark"; localStorage.setItem("themeMode", newTheme); applyMode(newTheme); }); }
    
    initializeApp();
});