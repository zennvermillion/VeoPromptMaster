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
    
    // --- Deklarasi Elemen ---
    const getEl = (id) => document.getElementById(id);
    const mainNicheSelect=getEl("mainNiche"), subNicheSelect=getEl("subNiche"), generateBtn=getEl("generateBtn"), output=getEl("output"), copyBtn=getEl("copyBtn"), favBtn=getEl("favBtn"), historyListEl=getEl("historyList"), favoriteListEl=getEl("favoriteList"), notif=getEl("notif"), startSessionBtn=getEl("startSessionBtn"), manageNichesBtn=getEl("manageNichesBtn"), nicheModal=getEl("nicheModal"), closeNicheModal=getEl("closeNicheModal"), newMainNicheInput=getEl("newMainNicheInput"), addMainNicheBtn=getEl("addMainNicheBtn"), mainNicheSelectForNewSub=getEl("mainNicheSelectForNewSub"), newSubNicheInput=getEl("newSubNicheInput"), addSubNicheBtn=getEl("addSubNicheBtn"), nicheManagementList=getEl("nicheManagementList"), appVersionEl=getEl("appVersion"), modalNotif=getEl("modalNotif"), exportCounter=getEl("exportCounter"), progressBar=getEl("progressBar"), exportCsvBtn=getEl("exportCsvBtn"), clearBatchBtn=getEl("clearBatchBtn"), selectFolderBtn = getEl("selectFolderBtn"), watchedFolderPathEl = getEl("watchedFolderPath"), productionQueueEl = getEl("productionQueue"), activePromptDisplay = getEl("activePromptDisplay"), negativePromptSection = getEl("negativePromptSection"), negativePromptOutput = getEl("negativePromptOutput"), copyNegativeBtn = getEl("copyNegativeBtn");
    const generateBatchBtn = getEl("generateBatchBtn"), batchCountInput = getEl("batchCount"), batchResultList = getEl("batchResultList"), exportBatchResultsBtn = getEl("exportBatchResultsBtn");
    const tabButtons = document.querySelectorAll(".main-tab-button"), tabContents = document.querySelectorAll(".tab-content");
    const updateNotification = getEl('update-notification'), updateVersionInfo = getEl('update-version-info'), updateAvailableInfo = getEl('update-available-info'), laterBtn = getEl('later-btn'), downloadBtn = getEl('download-btn');
    const downloadProgressInfo = getEl('download-progress-info'), downloadPercent = getEl('download-percent'), downloadProgressBar = getEl('download-progress-bar');
    const updateInstallingInfo = getEl('update-installing-info'), restartBtn = getEl('restart-btn');
    const manageApiKeysBtn=getEl("manageApiKeysBtn"), apiKeyModal=getEl("apiKeyModal"), closeApiKeyModal=getEl("closeApiKeyModal"), newApiKeyInput=getEl("newApiKeyInput"), addApiKeyBtn=getEl("addApiKeyBtn"), apiKeyManagementList=getEl("apiKeyManagementList");

    // --- State Aplikasi ---
    let activePrompt = "", currentPrompt = "", negativePromptText = "", currentBatchResults = [];
    let historyData = [], favoriteData = [], metadataBatch = [], niches = {}, apiKeys = []; // Tambahkan state apiKeys
    const BATCH_GOAL = 25;
    const defaultNiches = { "💫 Abstract & Motion": ["Glowing particle symphony"], "🌿 Nature & Landscape": ["Fog rolling over mountain ridge at dawn"]};
    
    // --- FUNGSI BANTUAN (LENGKAP) ---
    function showNotification(text) { if(notif) { notif.textContent = text; notif.classList.add('show'); setTimeout(() => notif.classList.remove('show'), 2500); } }
    function setButtonsState(isLoading) { if (generateBtn) generateBtn.disabled = isLoading; if (generateBatchBtn) generateBatchBtn.disabled = isLoading; }
    function applyMode(theme) { 
    document.documentElement.setAttribute("data-theme", theme); }
    async function loadAppVersion() { if (appVersionEl) { const version = await window.api.getAppVersion(); appVersionEl.textContent = `v${version}`; } }
    async function loadInitialApiKey() { const savedKey = await window.api.getApiKey(); if (apiKeyInput && savedKey) { apiKeyInput.value = savedKey; } }
    async function saveNiches() { await window.api.saveUserNiches(niches); }
    function setActivePrompt(prompt) { activePrompt = prompt; if(activePromptDisplay) { activePromptDisplay.innerHTML = `Sesi Aktif: <span class="prompt-text">${prompt.substring(0, 70)}...</span>`; activePromptDisplay.hidden = false; } showNotification("Prompt Aktif ditetapkan. Pindah ke Production Queue."); }
    function updateExportUI() { if(!exportCounter || !progressBar || !exportCsvBtn || !clearBatchBtn) return; const count = metadataBatch.length; const BATCH_GOAL = 25; exportCounter.textContent = `${count}/${BATCH_GOAL}`; progressBar.style.width = `${(count / BATCH_GOAL) * 100}%`; exportCsvBtn.disabled = count === 0; clearBatchBtn.disabled = count === 0; }
    function renderList(tab, data) { const listContainer = getEl(`${tab}List`); if (!listContainer) return; listContainer.innerHTML = ''; if (data.length === 0) { listContainer.innerHTML = `<div class="list-item"><span class="prompt-text">Belum ada data.</span></div>`; return; } data.slice().reverse().forEach(item => { const promptText = (typeof item === 'object') ? item.prompt : item; if(!promptText) return; const div = document.createElement("div"); div.className = 'list-item'; const textSpan = document.createElement('span'); textSpan.className = 'prompt-text'; textSpan.textContent = promptText; textSpan.title = promptText; textSpan.addEventListener("click", () => { output.textContent = promptText; currentPrompt = promptText; copyBtn.disabled = false; favBtn.disabled = favoriteData.includes(promptText); negativePromptSection.hidden = true; }); const actionsDiv = document.createElement('div'); actionsDiv.className = 'action-icons'; const reuseBtn = document.createElement('button'); reuseBtn.className = 'icon-button'; reuseBtn.title = 'Reuse Prompt'; reuseBtn.innerHTML = ICONS.reuse; reuseBtn.addEventListener('click', () => { setActivePrompt(promptText); const queueTabBtn = document.querySelector('.main-tab-button[data-tab="production-queue"]'); if (queueTabBtn) queueTabBtn.click(); }); actionsDiv.appendChild(reuseBtn); if (tab === 'history') { const favBtnIcon = document.createElement('button'); favBtnIcon.className = 'icon-button'; favBtnIcon.title = 'Tambah ke Favorite'; favBtnIcon.innerHTML = ICONS.favorite; favBtnIcon.addEventListener('click', () => addToFavorite(promptText)); actionsDiv.appendChild(favBtnIcon); } else { const delBtn = document.createElement("button"); delBtn.className = 'icon-button'; delBtn.title = "Hapus dari Favorite"; delBtn.innerHTML = ICONS.trash; delBtn.addEventListener('click', () => removeFavorite(promptText)); actionsDiv.appendChild(delBtn); } div.appendChild(textSpan); div.appendChild(actionsDiv); listContainer.appendChild(div); });}
    function addToHistory(historyObject) { if (!historyObject || !historyObject.prompt) return; if (historyData.some(item => item.prompt === historyObject.prompt)) return; historyData.push(historyObject); if (historyData.length > 50) historyData.shift(); localStorage.setItem("veoPromptHistory_v3", JSON.stringify(historyData)); }
    function addToFavorite(prompt) { if (!prompt || favoriteData.includes(prompt)) return; favoriteData.push(prompt); localStorage.setItem("veoPromptFavorites_v2", JSON.stringify(favoriteData)); showNotification("Ditambahkan ke favorit!"); renderList('favorite', favoriteData); if (favBtn) favBtn.disabled = true; }
    function removeFavorite(prompt) { favoriteData = favoriteData.filter(fav => fav !== prompt); localStorage.setItem("veoPromptFavorites_v2", JSON.stringify(favoriteData)); showNotification("Dihapus dari favorit."); renderList('favorite', favoriteData); }
    function populateMainNiche() { if (!mainNicheSelect) return; const currentValue = mainNicheSelect.value; mainNicheSelect.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>'; Object.keys(niches).sort().forEach(niche => { const opt = document.createElement("option"); opt.value = niche; opt.textContent = niche; mainNicheSelect.appendChild(opt); }); mainNicheSelect.value = currentValue; }
    function populateSubNiche(main) { if (!subNicheSelect) return; const currentValue = subNicheSelect.value; subNicheSelect.innerHTML = '<option value="" disabled selected>Pilih Sub-Kategori...</option>'; subNicheSelect.disabled = true; generateBtn.disabled = true; generateBatchBtn.disabled = true; if (main && niches[main]) { [...niches[main]].sort().forEach(sub => { const opt = document.createElement("option"); opt.value = sub; opt.textContent = sub; subNicheSelect.appendChild(opt); }); subNicheSelect.disabled = false; subNicheSelect.value = currentValue; if(subNicheSelect.value) {generateBtn.disabled = false; generateBatchBtn.disabled = false;} } }
    function populateNicheModalDropdown() { if (!mainNicheSelectForNewSub) return; const currentValue = mainNicheSelectForNewSub.value; mainNicheSelectForNewSub.innerHTML = ''; Object.keys(niches).sort().forEach(niche => { const opt = document.createElement("option"); opt.value = niche; opt.textContent = niche; mainNicheSelectForNewSub.appendChild(opt); }); mainNicheSelectForNewSub.value = currentValue || Object.keys(niches).sort()[0]; }
    function renderNicheManagementList() { if (!nicheManagementList) return; nicheManagementList.innerHTML = ''; Object.keys(niches).sort().forEach(mainNiche => { const mainDiv = document.createElement('div'); mainDiv.className = 'niche-item'; mainDiv.innerHTML = `<span>${mainNiche}</span><button class="delete-niche-btn" data-main-niche="${mainNiche}">&times;</button>`; nicheManagementList.appendChild(mainDiv); if (niches[mainNiche]?.length > 0) { niches[mainNiche].sort().forEach(subNiche => { const subDiv = document.createElement('div'); subDiv.className = 'sub-niche-item'; subDiv.innerHTML = `<span><span class="sub-niche-icon">↳</span>${subNiche}</span><button class="delete-niche-btn" data-main-niche="${mainNiche}" data-sub-niche="${subNiche}">&times;</button>`; nicheManagementList.appendChild(subDiv); }); } }); }
    function showModalNotification(text) { if (!modalNotif) return; modalNotif.textContent = text; modalNotif.classList.add('show'); setTimeout(() => modalNotif.classList.remove('show'), 2000); }
    function renderApiKeyList() {
        if (!apiKeyManagementList) return;
        apiKeyManagementList.innerHTML = '';
        if (apiKeys.length === 0) {
            apiKeyManagementList.innerHTML = '<div class="niche-item"><span>Belum ada API key.</span></div>';
            return;
        }
        apiKeys.forEach((key, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'niche-item';
            
            // Samarkan key untuk keamanan
            const maskedKey = `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
            
            itemDiv.innerHTML = `
                <span>Key ${index + 1}: ${maskedKey}</span>
                <button class="delete-niche-btn" data-key-index="${index}">&times;</button>
            `;
            apiKeyManagementList.appendChild(itemDiv);
        });
    }

    // --- Fungsi Inti ---
    async function generateSinglePrompt(sub) { try { setButtonsState(true); const result = await window.api.generatePrompt({ sub }); if (result.error) throw new Error(result.error); if(result.success) { currentPrompt = result.prompt; negativePromptText = Array.isArray(result.negative_prompt) ? result.negative_prompt.join(', ') : ''; output.textContent = currentPrompt; negativePromptOutput.textContent = negativePromptText; negativePromptSection.hidden = false; startSessionBtn.hidden = false; copyBtn.disabled = false; favBtn.disabled = favoriteData.includes(currentPrompt); addToHistory({ subNiche: sub, prompt: currentPrompt, negative_prompt: result.negative_prompt }); } else { throw new Error("Respons AI tidak valid."); } } catch (err) { output.textContent = `Error: ${err.message}`; } finally { setButtonsState(false); } }
    function displayBatchResults(prompts) {
        if (!batchResultList) return;
        currentBatchResults = prompts;
        batchResultList.innerHTML = '';
        if (!prompts || prompts.length === 0) {
            batchResultList.innerHTML = `<div class="empty-queue">Tidak ada hasil.</div>`;
            exportBatchResultsBtn.disabled = true;
            return;
        }
        exportBatchResultsBtn.disabled = false;
        prompts.forEach(item => {
            // Kita tidak perlu merakit prompt lagi, langsung ambil dari 'item.prompt'
            const promptText = item.prompt;

            const div = document.createElement("div");
            div.className = 'list-item';
            const textSpan = document.createElement('span');
            textSpan.className = 'prompt-text';
            textSpan.textContent = promptText;
            textSpan.title = promptText;
            textSpan.addEventListener("click", () => {
                output.textContent = promptText;
                currentPrompt = promptText;
                negativePromptText = Array.isArray(item.negative_prompt) ? item.negative_prompt.join(', ') : '';
                negativePromptOutput.textContent = negativePromptText;
                negativePromptSection.hidden = false;
                startSessionBtn.hidden = false;
                copyBtn.disabled = false;
                favBtn.disabled = favoriteData.includes(promptText);
                const generatorTabBtn = document.querySelector('.main-tab-button[data-tab="generator"]');
                if(generatorTabBtn) generatorTabBtn.click();
                showNotification("Prompt dimuat ke generator.");
            });

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-icons';
            const copyBtnIcon = document.createElement('button');
            copyBtnIcon.className = 'icon-button';
            copyBtnIcon.title = 'Salin';
            copyBtnIcon.innerHTML = ICONS.copy;
            copyBtnIcon.addEventListener('click', () => {
                navigator.clipboard.writeText(promptText).then(() => showNotification("Prompt disalin!"));
            });
            const favBtnIcon = document.createElement('button');
            favBtnIcon.className = 'icon-button';
            favBtnIcon.title = 'Tambah ke Favorite';
            favBtnIcon.innerHTML = ICONS.favorite;
            favBtnIcon.addEventListener('click', () => addToFavorite(promptText));

            actionsDiv.appendChild(copyBtnIcon);
            actionsDiv.appendChild(favBtnIcon);
            div.appendChild(textSpan);
            div.appendChild(actionsDiv);
            batchResultList.appendChild(div);
        });
    }
    
    // --- Inisialisasi ---
    async function initializeApp() {
        await loadAppVersion();
        niches = await window.api.getUserNiches() || defaultNiches;
        if (Object.keys(niches).length === 0) { niches = defaultNiches; await window.api.saveUserNiches(niches); }
        populateMainNiche();
        apiKeys = await window.api.getApiKeys();
        historyData = JSON.parse(localStorage.getItem("veoPromptHistory_v3") || "[]");
        favoriteData = JSON.parse(localStorage.getItem("veoPromptFavorites_v2") || "[]");
        metadataBatch = JSON.parse(localStorage.getItem("veoMetadataBatch_v2") || "[]");
        renderList('history', historyData);
        renderList('favorite', favoriteData);
        updateExportUI();
        const initialPath = await window.api.getWatchedFolderPath();
        if(initialPath && watchedFolderPathEl) watchedFolderPathEl.textContent = initialPath;
    }

    // --- EVENT LISTENERS (LENGKAP) ---
    if (mainNicheSelect) mainNicheSelect.addEventListener("change", (e) => populateSubNiche(e.target.value));
    if (subNicheSelect) subNicheSelect.addEventListener("change", () => { const hasValue = !!subNicheSelect.value; generateBtn.disabled = !hasValue; generateBatchBtn.disabled = !hasValue; });
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Nonaktifkan semua tombol dan konten tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 2. Aktifkan tombol yang diklik dan konten yang sesuai
            button.classList.add('active');
            const targetContentId = `${button.dataset.tab}View`;
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // 3. Render ulang daftar untuk tab History & Favorite
            if (button.dataset.tab === 'history' || button.dataset.tab === 'favorite') {
                renderList(button.dataset.tab, button.dataset.tab === 'history' ? historyData : favoriteData);
            }
        });
    });
    if (generateBtn) { generateBtn.addEventListener("click", () => { if (!subNicheSelect.value) return; output.textContent = "Generating..."; generateSinglePrompt(subNicheSelect.value); }); }
    if (generateBatchBtn) { generateBatchBtn.addEventListener('click', async () => { const sub = subNicheSelect.value; const count = parseInt(batchCountInput.value, 10); if (!sub || !count) { showNotification("Pilih sub-kategori dan tentukan jumlah."); return; } setButtonsState(true); showNotification(`Meminta ${count} prompt...`); const batchTabBtn = document.querySelector('.main-tab-button[data-tab="batch-results"]'); if (batchResultList) { batchResultList.innerHTML = `<div class="empty-queue">Meminta ${count} prompt ke AI...</div>`; if(exportBatchResultsBtn) exportBatchResultsBtn.disabled = true; if (batchTabBtn) batchTabBtn.click(); } const result = await window.api.generateBatchPrompts({ sub, count }); setButtonsState(false); if (result.error) { showNotification(`Error: ${result.error}`); if (batchResultList) batchResultList.innerHTML = `<div class="empty-queue">Error: ${result.error}</div>`; } else if (result.success) { displayBatchResults(result.prompts); } }); }
    if (exportBatchResultsBtn) {
        exportBatchResultsBtn.addEventListener('click', async () => {
            if(currentBatchResults.length === 0) { /* ... */ return; }
            const result = await window.api.saveBatchPromptsCsv(currentBatchResults);
            if (result.success) {
                showNotification("File CSV berhasil disimpan!");
                window.api.clearUsedSubjects(); // <-- TAMBAHKAN BARIS INI
            } else if (!result.canceled) {
                showNotification(`Error saat menyimpan: ${result.error}`);
            }
        });
    }
    if (clearBatchBtn) {
            clearBatchBtn.addEventListener('click', () => {
                if (metadataBatch.length === 0) return;
                if (confirm('Anda yakin ingin membersihkan batch ekspor?')) {
                    metadataBatch = [];
                    localStorage.setItem('veoMetadataBatch_v2', JSON.stringify(metadataBatch));
                    updateExportUI();
                    showNotification('Batch ekspor dibersihkan!');
                }
            });
        }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', async () => {
            if (metadataBatch.length === 0) {
                showNotification('Tidak ada data untuk diekspor.');
                return;
            }
            // Header diubah sesuai permintaan
            const header = 'Filename,Title,Description,Keywords\n';
            
            // Urutan data diubah agar sesuai dengan header
            const rows = metadataBatch.map(item => {
                const filename = `"${(item.sourceFilename || '').replace(/"/g, '""')}"`;
                const title = `"${(item.title || '').replace(/"/g, '""')}"`;
                const description = `"${(item.description || '').replace(/"/g, '""')}"`;
                const keywords = `"${(item.keywords || '').replace(/"/g, '""')}"`;
                return `${filename},${title},${description},${keywords}`;
            }).join('\n');
            
            const csvData = header + rows;
            const result = await window.api.saveCsv(csvData);
            if (result.success) {
                showNotification('File CSV berhasil disimpan!');
                metadataBatch = [];
            localStorage.setItem('veoMetadataBatch_v2', JSON.stringify(metadataBatch));
            updateExportUI();
            } else if (!result.canceled) {
                showNotification(`Gagal menyimpan CSV: ${result.error}`);
            }
        });
    }

    if (manageApiKeysBtn) {
        manageApiKeysBtn.addEventListener('click', () => {
            renderApiKeyList();
            if (apiKeyModal) apiKeyModal.showModal();
        });
    }

    if (closeApiKeyModal) {
        closeApiKeyModal.addEventListener('click', () => {
            if (apiKeyModal) apiKeyModal.close();
        });
    }

    if (addApiKeyBtn) {
        addApiKeyBtn.addEventListener('click', async () => {
            const newKey = newApiKeyInput.value.trim();
            if (newKey && !apiKeys.includes(newKey)) {
                apiKeys.push(newKey);
                await window.api.saveApiKeys(apiKeys);
                newApiKeyInput.value = '';
                renderApiKeyList();
                showNotification("API Key baru berhasil ditambahkan!");
            } else if (!newKey) {
                showNotification("Input tidak boleh kosong.", "error");
            } else {
                showNotification("API Key tersebut sudah ada.", "error");
            }
        });
    }

    if (apiKeyManagementList) {
        apiKeyManagementList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-niche-btn')) {
                const indexToDelete = parseInt(e.target.dataset.keyIndex, 10);
                if (confirm('Yakin ingin menghapus API key ini?')) {
                    apiKeys.splice(indexToDelete, 1);
                    await window.api.saveApiKeys(apiKeys);
                    renderApiKeyList();
                    showNotification("API Key berhasil dihapus.");
                }
            }
        });
    }
    if (copyBtn) { copyBtn.addEventListener("click", () => { if (!currentPrompt) return; navigator.clipboard.writeText(currentPrompt).then(() => showNotification("Prompt disalin!")); }); }
    if (copyNegativeBtn) { copyNegativeBtn.addEventListener('click', () => { if (!negativePromptText) return; navigator.clipboard.writeText(negativePromptText).then(() => showNotification("Negative prompt disalin!")); }); }
    if (favBtn) { favBtn.addEventListener("click", () => { if (!currentPrompt || currentPrompt.startsWith('Error:')) return; addToFavorite(currentPrompt); }); }
    if (selectFolderBtn) { selectFolderBtn.addEventListener("click", async () => { const path = await window.api.selectFolder(); if(path && watchedFolderPathEl) { watchedFolderPathEl.textContent = path; } }); }
    if (startSessionBtn) { startSessionBtn.addEventListener("click", () => { if (output && output.textContent && !output.textContent.startsWith("Hasil prompt")) { setActivePrompt(output.textContent); const queueTabBtn = document.querySelector('.main-tab-button[data-tab="production-queue"]'); if (queueTabBtn) queueTabBtn.click(); } else { showNotification("Generate sebuah prompt terlebih dahulu."); } }); }
    
    // Listener Kelola Niche
    const handleNicheUpdate = async () => { await window.api.saveUserNiches(niches); requestAnimationFrame(() => { const currentMain = mainNicheSelect.value; const currentSub = subNicheSelect.value; populateMainNiche(); mainNicheSelect.value = currentMain; populateSubNiche(currentMain); if(niches[currentMain]?.includes(currentSub)) { subNicheSelect.value = currentSub; } else { generateBtn.disabled = true; generateBatchBtn.disabled = true; } renderNicheManagementList(); populateNicheModalDropdown(); }); };
    if (manageNichesBtn) { manageNichesBtn.addEventListener('click', () => { populateNicheModalDropdown(); renderNicheManagementList(); nicheModal.showModal(); }); }
    if (closeNicheModal) { closeNicheModal.addEventListener('click', () => nicheModal.close()); }
    if (nicheModal) { nicheModal.addEventListener('click', (e) => { const rect = nicheModal.getBoundingClientRect(); if (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right) { nicheModal.close(); } }); }
    if (addMainNicheBtn) { addMainNicheBtn.addEventListener('click', () => { const newNiche = newMainNicheInput.value.trim(); if (newNiche && !niches[newNiche]) { niches[newNiche] = []; newMainNicheInput.value = ''; showModalNotification("Kategori utama ditambahkan!"); handleNicheUpdate(); } }); }
    if (addSubNicheBtn) { addSubNicheBtn.addEventListener('click', () => { const selectedMain = mainNicheSelectForNewSub.value; const newSub = newSubNicheInput.value.trim(); if (selectedMain && newSub && !niches[selectedMain].includes(newSub)) { niches[selectedMain].push(newSub); newSubNicheInput.value = ''; showModalNotification("Sub-kategori ditambahkan!"); handleNicheUpdate(); } }); }
    if (nicheManagementList) { nicheManagementList.addEventListener('click', (e) => { if (e.target.classList.contains('delete-niche-btn')) { if (confirm('Yakin ingin menghapus item ini?')) { const main = e.target.dataset.mainNiche; const sub = e.target.dataset.subNiche; if (main && sub) { const index = niches[main].indexOf(sub); if (index > -1) niches[main].splice(index, 1); } else if (main) { delete niches[main]; } handleNicheUpdate(); } } }); }
    
    // Listener Auto-Update
    
    window.api.onUpdateAvailable((info) => { if(updateNotification) updateNotification.classList.add('active'); if(updateVersionInfo) updateVersionInfo.textContent = `Update v${info.version} tersedia!`; if(updateAvailableInfo) updateAvailableInfo.hidden = false; if(downloadProgressInfo) downloadProgressInfo.hidden = true; if(updateInstallingInfo) updateInstallingInfo.hidden = true; });
    window.api.onDownloadProgress((percent) => { if(downloadProgressBar) downloadProgressBar.style.width = `${Math.round(percent)}%`; if(downloadPercent) downloadPercent.textContent = `${Math.round(percent)}%`; });
    window.api.onUpdateDownloaded(() => { if(updateAvailableInfo) updateAvailableInfo.hidden = true; if(downloadProgressInfo) downloadProgressInfo.hidden = true; if(updateInstallingInfo) updateInstallingInfo.hidden = false; });
    window.api.onSetTheme((theme) => {
    applyMode(theme);
    });
    window.api.onNewVideo((file) => {
        if (!productionQueueEl) return;

        // Hapus pesan "Belum ada video baru..." jika ada
        const emptyEl = productionQueueEl.querySelector('.empty-queue');
        if (emptyEl) emptyEl.remove();

        const itemEl = document.createElement('div');
        itemEl.className = 'queue-item';

        // Membuat elemen HTML untuk setiap item di antrean
        itemEl.innerHTML = `
            <div class="queue-item-icon">${ICONS.video}</div>
            <div class="queue-item-info">
                <div class="filename">${file.name}</div>
                <div class="status">Siap untuk diproses</div>
            </div>
            <button class="generate-meta-queue-btn primary">Generate Metadata</button>
        `;
        productionQueueEl.appendChild(itemEl);

        const generateBtn = itemEl.querySelector('.generate-meta-queue-btn');
        // Menambahkan event listener ke tombol "Generate Metadata"
        generateBtn.addEventListener('click', async () => {
            if (!activePrompt) {
                showNotification('Harap tetapkan "Prompt Aktif" dari tab Generator terlebih dahulu.');
                return;
            }
            generateBtn.textContent = 'Memproses...';
            generateBtn.disabled = true;

            const result = await window.api.generateMetadataAndCsv({
                videoFilename: file.name,
                activePrompt: activePrompt
            });

            const statusEl = itemEl.querySelector('.status');
            if (result.success) {
                statusEl.textContent = 'Metadata berhasil dibuat!';
                generateBtn.textContent = 'Selesai';
                generateBtn.innerHTML = ICONS.processed + ' Selesai';
                generateBtn.classList.remove('primary');
                generateBtn.classList.add('processed');

                // Menambahkan hasil ke batch untuk diekspor
                metadataBatch.push({ ...result, sourceFilename: file.name });
                localStorage.setItem('veoMetadataBatch_v2', JSON.stringify(metadataBatch));
                updateExportUI(); // Memperbarui UI progress bar
            } else {
                statusEl.textContent = `Error: ${result.error}`;
                generateBtn.textContent = 'Coba Lagi';
                generateBtn.disabled = false;
            }
        });
    });
    if(downloadBtn) { downloadBtn.addEventListener('click', () => { if(updateAvailableInfo) updateAvailableInfo.hidden = true; if(downloadProgressInfo) downloadProgressInfo.hidden = false; window.api.startDownload(); }); }
    if(laterBtn) { laterBtn.addEventListener('click', () => { if(updateNotification) updateNotification.classList.remove('active'); }); }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            restartBtn.textContent = 'Restarting...';
            restartBtn.disabled = true;
            // Kirim pesan untuk restart melalui jembatan yang baru dibuat
            window.api.restartApp();
        });
    }

    initializeApp();
});