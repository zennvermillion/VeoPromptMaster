document.addEventListener('DOMContentLoaded', () => {

    // --- Bagian 1: Definisi Ikon & Elemen DOM ---

    const ICONS = {
        sun: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> Light Mode`,
        moon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> Dark Mode`,
        reuse: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
        favorite: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
        copy: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`
    };

    // --- Ambil Elemen DOM ---
    const mainNicheSelect = document.getElementById("mainNiche");
    const subNicheSelect = document.getElementById("subNiche");
    const generateBtn = document.getElementById("generateBtn");
    const randomBtn = document.getElementById("randomBtn");
    const output = document.getElementById("output");
    const copyBtn = document.getElementById("copyBtn");
    const favBtn = document.getElementById("favBtn");
    const historyListEl = document.getElementById("historyList");
    const favoriteListEl = document.getElementById("favoriteList");
    const tabHistory = document.getElementById("tabHistory");
    const tabFavorite = document.getElementById("tabFavorite");
    const modeToggle = document.getElementById("modeToggle");
    const notif = document.getElementById("notif");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
    const metadataSection = document.getElementById("metadataSection");
    const generateMetaBtn = document.getElementById("generateMetaBtn");
    const metadataResult = document.getElementById("metadataResult");
    const titlesOutput = document.getElementById("titlesOutput");
    const keywordsOutput = document.getElementById("keywordsOutput");
    const exportCounter = document.getElementById("exportCounter");
    const progressBar = document.getElementById("progressBar");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const clearBatchBtn = document.getElementById("clearBatchBtn");
    const manageNichesBtn = document.getElementById("manageNichesBtn");
    const nicheModal = document.getElementById("nicheModal");
    const closeNicheModal = document.getElementById("closeNicheModal");
    const newMainNicheInput = document.getElementById("newMainNicheInput");
    const addMainNicheBtn = document.getElementById("addMainNicheBtn");
    const mainNicheSelectForNewSub = document.getElementById("mainNicheSelectForNewSub");
    const newSubNicheInput = document.getElementById("newSubNicheInput");
    const addSubNicheBtn = document.getElementById("addSubNicheBtn");
    const nicheManagementList = document.getElementById("nicheManagementList");
    const appVersionEl = document.getElementById("appVersion");
    const modalNotif = document.getElementById("modalNotif");

    // --- Bagian 2: State & Data Aplikasi ---

    const BATCH_GOAL = 25;
    let currentPrompt = "";
    let historyData = JSON.parse(localStorage.getItem("veoPromptHistory_v3") || "[]");
    let favoriteData = JSON.parse(localStorage.getItem("veoPromptFavorites_v2") || "[]");
    let metadataBatch = JSON.parse(localStorage.getItem("veoMetadataBatch") || "[]");
    let currentTab = "history";
    let niches = {}; 
    const defaultNiches = {
  "💫 Abstract & Motion": [ "Glowing particle symphony", "Liquid ink explosion in space", "Kinetic typography burst", "Fractal animation with neon colors", "Dynamic smoke waves", "Energy flow visualization" ],
  "💼 Business & Office": [ "Startup team brainstorming in glass office", "Late-night coder in modern workspace", "Handshake deal in corporate boardroom", "Remote work digital conference", "Busy city financial district", "Creative agency open workspace" ],
  "🍜 Food & Culinary": [ "Street vendor grilling satay at sunset", "Slow motion of soup being poured into bowl", "Steam rising from traditional bamboo steamer", "Sushi chef preparing nigiri", "Close-up of fresh vegetables washing", "Dessert plating in gourmet restaurant" ],
  "🌿 Nature & Landscape": [ "Fog rolling over mountain ridge at dawn", "Sunlight through ancient forest canopy", "Raindrops hitting tropical leaves", "Golden wheat fields waving in breeze", "Waterfall cascading into crystal lake", "Desert dunes under starry night sky" ],
  "🎉 Seasonal & Event": [ "New Year fireworks over city skyline", "Winter snow festival with glowing lanterns", "Harvest celebration in rice fields", "Autumn leaves falling in park", "Spring flower bloom time lapse", "Cultural parade with traditional costumes" ],
  "🤖 Tech & Futuristic": [ "Humanoid robot exploring neon-lit lab", "Futuristic city skyline with flying cars", "Augmented reality user interface in motion", "Cybersecurity digital shield animation", "AI brain network visualization", "Quantum computing data stream" ],
  "🌀 Surreal & Dreamscape": [ "Floating islands over cloud ocean", "Dreamlike glowing forest with bioluminescence", "Magical desert with levitating rocks", "Endless staircases disappearing into mist", "Abstract landscapes with impossible geometry", "Colorful nebula skies with flying whales" ],
  "😂 Humor & Levity": [ "Office chair race in slow motion", "Dog wearing glasses working on laptop", "Unexpected funny reactions in daily life", "Cat knocking things off table", "People slipping on banana peel gag", "Funny costume party moments" ],
  "🌆 Retro Futurism": [ "1980s neon cityscape with VHS glitch", "Cyberpunk computer lab with retro monitors", "Time-travel portal opening in retro arcade", "Pixelated digital rain on neon street", "Synthwave sunset over retro cars", "Futuristic city with flying cassette tapes" ],
  "🎥 Immersive Cinematics": [ "Walking through glowing tunnel with depth", "Cinematic drone shot over misty valley at sunrise", "Close-up slow motion rain hitting glass window", "Tracking shot through busy urban market", "Slow zoom on reflective water surface", "Dramatic lighting on a desolate highway" ]
};

function showNotification(text) {
        if (notif) {
            notif.textContent = text;
            notif.classList.add('show');
            setTimeout(() => notif.classList.remove('show'), 2500);
        }
    }

    function showModalNotification(message) {
        if (modalNotif) {
            modalNotif.textContent = message;
            modalNotif.classList.add('show');
            setTimeout(() => modalNotif.classList.remove('show'), 2200);
        }
    }

    function setButtonsState(isLoading) {
        if (generateBtn) generateBtn.disabled = isLoading;
        if (randomBtn) randomBtn.disabled = isLoading;
    }

    function applyMode(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        if (modeToggle) {
            modeToggle.innerHTML = theme === 'light' ? ICONS.moon : ICONS.sun;
        }
    }

    async function loadAppVersion() {
        if (appVersionEl) {
            const version = await window.api.getAppVersion();
            appVersionEl.textContent = `v${version}`;
        }
    }

    async function loadInitialApiKey() {
        const savedKey = await window.api.getApiKey();
        if (apiKeyInput && savedKey) {
            apiKeyInput.value = savedKey;
        }
    }

    function sortNiches(data) {
        const sortedNiches = {};
        Object.keys(data).sort((a, b) => a.localeCompare(b)).forEach(key => {
            if (Array.isArray(data[key])) {
                sortedNiches[key] = data[key].sort((a, b) => a.localeCompare(b));
            } else {
                sortedNiches[key] = data[key];
            }
        });
        return sortedNiches;
    }
    
    function populateMainNiche() {
        if (!mainNicheSelect) return;
        mainNicheSelect.innerHTML = '<option value="" disabled selected>Pilih Kategori...</option>';
        const sortedKeys = Object.keys(niches).sort((a, b) => a.localeCompare(b));
        for (const niche of sortedKeys) {
            const opt = document.createElement("option");
            opt.value = niche;
            opt.textContent = niche;
            mainNicheSelect.appendChild(opt);
        }
    }

    function populateSubNiche(main) {
        if (!subNicheSelect) return;
        subNicheSelect.innerHTML = '<option value="" disabled selected>Pilih Sub-Kategori...</option>';
        subNicheSelect.disabled = true;
        if (!main || !niches[main]) return;
        const sortedSubNiches = [...niches[main]].sort((a, b) => a.localeCompare(b));
        for (const sub of sortedSubNiches) {
            const opt = document.createElement("option");
            opt.value = sub;
            opt.textContent = sub;
            subNicheSelect.appendChild(opt);
        }
        subNicheSelect.disabled = false;
    }

    function renderNicheManagementList() {
        if (!nicheManagementList) return;
        nicheManagementList.innerHTML = '';
        const sortedMainNiches = Object.keys(niches).sort((a, b) => a.localeCompare(b));
        for (const mainNiche of sortedMainNiches) {
            const mainItem = document.createElement('div');
            mainItem.className = 'niche-item';
            mainItem.innerHTML = `<span>${mainNiche}</span><button class="delete-niche-btn" data-main-niche="${mainNiche}">&times;</button>`;
            nicheManagementList.appendChild(mainItem);

            if (niches[mainNiche] && niches[mainNiche].length > 0) {
                const sortedSubNiches = [...niches[mainNiche]].sort((a,b) => a.localeCompare(b));
                sortedSubNiches.forEach(subNiche => {
                    const subItem = document.createElement('div');
                    subItem.className = 'sub-niche-item';
                    subItem.innerHTML = `<span><span class="sub-niche-icon">›</span>${subNiche}</span><button class="delete-niche-btn" data-main-niche="${mainNiche}" data-sub-niche="${subNiche}">&times;</button>`;
                    nicheManagementList.appendChild(subItem);
                });
            }
        }
    }

    function populateNicheModalDropdown() {
        if (!mainNicheSelectForNewSub) return;
        mainNicheSelectForNewSub.innerHTML = '<option value="" disabled selected>Pilih Kategori Utama...</option>';
        const sortedKeys = Object.keys(niches).sort((a, b) => a.localeCompare(b));
        for (const niche of sortedKeys) {
            const opt = document.createElement("option");
            opt.value = niche;
            opt.textContent = niche;
            mainNicheSelectForNewSub.appendChild(opt);
        }
    }

    async function saveNiches() {
        niches = sortNiches(niches);
        await window.api.saveUserNiches(niches);
        populateMainNiche();
        populateNicheModalDropdown();
        renderNicheManagementList();
    }

    function renderList() {
        const listContainer = currentTab === 'history' ? historyListEl : favoriteListEl;
        const otherContainer = currentTab === 'history' ? favoriteListEl : historyListEl;
        if (!listContainer || !otherContainer) return;

        listContainer.innerHTML = '';
        listContainer.hidden = false;
        otherContainer.hidden = true;
        const data = currentTab === "history" ? historyData : favoriteData;

        if (data.length === 0) {
            listContainer.innerHTML = `<div class="list-item"><span class="prompt-text">Belum ada data.</span></div>`;
            return;
        }

        data.slice().reverse().forEach((item) => {
            if (!item) return;
            const isHistoryItem = currentTab === 'history' && typeof item === 'object' && item.prompt;
            const isFavoriteItem = currentTab === 'favorite' && typeof item === 'string';
            const promptText = isHistoryItem ? item.prompt : (isFavoriteItem ? item : '');
            if (!promptText) return;

            const div = document.createElement("div");
            div.className = 'list-item';
            const textSpan = document.createElement('span');
            textSpan.className = 'prompt-text';
            textSpan.textContent = promptText;
            textSpan.title = promptText;
            textSpan.addEventListener("click", () => {
                if (output) output.textContent = promptText;
                currentPrompt = promptText;
                if (copyBtn) copyBtn.disabled = false;
                if (favBtn) favBtn.disabled = favoriteData.includes(promptText);
                if (metadataSection) metadataSection.hidden = false;
                if (metadataResult) metadataResult.hidden = true;
            });
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-icons';

            if (isHistoryItem) {
                const reuseBtn = document.createElement('button');
                reuseBtn.className = 'icon-button';
                reuseBtn.title = 'Gunakan Lagi';
                reuseBtn.innerHTML = ICONS.reuse;
                reuseBtn.addEventListener('click', () => {
                    const subNicheToReuse = item.subNiche;
                    const mainNiche = Object.keys(niches).find(key => niches[key].includes(subNicheToReuse));
                    if (mainNiche) {
                        mainNicheSelect.value = mainNiche;
                        populateSubNiche(mainNiche);
                        subNicheSelect.value = subNicheToReuse;
                        if (generateBtn) generateBtn.disabled = false;
                        showNotification(`Niche "${subNicheToReuse}" dimuat ulang.`);
                    }
                });
                const favBtnIcon = document.createElement('button');
                favBtnIcon.className = 'icon-button';
                favBtnIcon.title = 'Tambah ke Favorite';
                favBtnIcon.innerHTML = ICONS.favorite;
                favBtnIcon.addEventListener('click', () => addToFavorite(promptText));
                actionsDiv.appendChild(reuseBtn);
                actionsDiv.appendChild(favBtnIcon);
            } else if (isFavoriteItem) {
                const copyBtnIcon = document.createElement('button');
                copyBtnIcon.className = 'icon-button';
                copyBtnIcon.title = 'Salin';
                copyBtnIcon.innerHTML = ICONS.copy;
                copyBtnIcon.addEventListener('click', () => { navigator.clipboard.writeText(promptText).then(() => showNotification("Prompt disalin!")); });
                const delBtn = document.createElement("button");
                delBtn.className = 'icon-button';
                delBtn.title = "Hapus dari Favorite";
                delBtn.innerHTML = ICONS.trash;
                delBtn.addEventListener('click', () => removeFavorite(promptText));
                actionsDiv.appendChild(copyBtnIcon);
                actionsDiv.appendChild(delBtn);
            }
            div.appendChild(textSpan);
            div.appendChild(actionsDiv);
            listContainer.appendChild(div);
        });
    }

    function addToHistory(historyObject) {
        if (!historyObject || !historyObject.prompt) return;
        if (historyData.some(item => item.prompt === historyObject.prompt)) return;
        historyData.push(historyObject);
        if (historyData.length > 25) historyData.shift();
        localStorage.setItem("veoPromptHistory_v3", JSON.stringify(historyData));
        if (currentTab === "history") renderList();
    }

    function addToFavorite(prompt) {
        if (!prompt || favoriteData.includes(prompt)) return;
        favoriteData.push(prompt);
        localStorage.setItem("veoPromptFavorites_v2", JSON.stringify(favoriteData));
        showNotification("Ditambahkan ke favorit!");
        if (currentTab === "favorite") renderList();
        if (favBtn) favBtn.disabled = true;
    }

    function removeFavorite(prompt) {
        favoriteData = favoriteData.filter(fav => fav !== prompt);
        localStorage.setItem("veoPromptFavorites_v2", JSON.stringify(favoriteData));
        showNotification("Dihapus dari favorit.");
        if (currentTab === "favorite") renderList();
    }

    async function generateSinglePrompt(sub) {
        try {
            const resultPrompt = await window.api.generatePrompt({ sub });
            if (resultPrompt.startsWith("Error:")) throw new Error(resultPrompt);
            addToHistory({ subNiche: sub, prompt: resultPrompt });
            if (metadataSection) metadataSection.hidden = false;
            if (metadataResult) metadataResult.hidden = true;
            return resultPrompt;
        } catch (err) {
            console.error(err);
            if (metadataSection) metadataSection.hidden = true;
            return `${err.message}`;
        }
    }

    function updateExportUI() {
        if (!exportCounter || !progressBar || !exportCsvBtn) return;
        const count = metadataBatch.length;
        exportCounter.textContent = `${count}/${BATCH_GOAL}`;
        const progressPercentage = Math.min((count / BATCH_GOAL) * 100, 100);
        progressBar.style.width = `${progressPercentage}%`;
        exportCsvBtn.disabled = count < BATCH_GOAL;
    }

    function convertToCSV(data) {
        const header = '"Prompt","Title","Keywords","Generated by AI"\n';
        const rows = data.map(item => {
            const cleanPrompt = item.prompt.replace(/"/g, '""');
            const cleanTitle = item.title.replace(/"/g, '""');
            const cleanKeywords = item.keywords.replace(/"/g, '""');
            return `"${cleanPrompt}","${cleanTitle}","${cleanKeywords}","YES"`;
        });
        return header + rows.join('\n');
    }
    
    // --- Bagian 4: Inisialisasi & Event Listeners ---
    
    async function initializeApp() {
        await loadAppVersion();
        let storedNiches = await window.api.getUserNiches();
        if (!storedNiches || Object.keys(storedNiches).length === 0) {
            niches = defaultNiches;
            await saveNiches();
        } else {
            niches = storedNiches;
        }
        populateMainNiche();
        populateNicheModalDropdown();
        const savedMode = localStorage.getItem("themeMode") || "dark";
        applyMode(savedMode);
        await loadInitialApiKey();
        renderList();
        updateExportUI();
    }
    
    // Event Listeners
    if (manageNichesBtn) manageNichesBtn.addEventListener('click', () => { renderNicheManagementList(); if (nicheModal) nicheModal.showModal(); });
    if (closeNicheModal) closeNicheModal.addEventListener('click', () => nicheModal.close());
    if (addMainNicheBtn) addMainNicheBtn.addEventListener('click', async () => { const newNiche = newMainNicheInput.value.trim(); if (newNiche && !niches[newNiche]) { niches[newNiche] = []; await saveNiches(); newMainNicheInput.value = ''; showModalNotification("Kategori utama ditambahkan!"); } });
    if (addSubNicheBtn) addSubNicheBtn.addEventListener('click', async () => { const selectedMain = mainNicheSelectForNewSub.value; const newSub = newSubNicheInput.value.trim(); if (selectedMain && newSub && !niches[selectedMain].includes(newSub)) { niches[selectedMain].push(newSub); await saveNiches(); newSubNicheInput.value = ''; showModalNotification("Sub-kategori ditambahkan!"); } });
    if (nicheManagementList) nicheManagementList.addEventListener('click', async e => { if (e.target.classList.contains('delete-niche-btn')) { const main = e.target.dataset.mainNiche; const sub = e.target.dataset.subNiche; if (main && sub) { if (confirm(`Yakin ingin menghapus sub-niche "${sub}"?`)) { const index = niches[main].indexOf(sub); if (index > -1) niches[main].splice(index, 1); } } else if (main) { if (confirm(`Yakin ingin menghapus kategori utama "${main}" beserta semua isinya?`)) { delete niches[main]; } } await saveNiches(); } });
    if (mainNicheSelect) mainNicheSelect.addEventListener("change", e => populateSubNiche(e.target.value));
    if (subNicheSelect) subNicheSelect.addEventListener("change", () => { if (generateBtn) generateBtn.disabled = !subNicheSelect.value; });
    if (generateBtn) generateBtn.addEventListener("click", async () => { if (!subNicheSelect || !subNicheSelect.value) return; if (output) output.textContent = "Generating..."; setButtonsState(true); const result = await generateSinglePrompt(subNicheSelect.value); if (output) output.textContent = result; currentPrompt = result; setButtonsState(false); if (copyBtn) copyBtn.disabled = false; if (favBtn) favBtn.disabled = favoriteData.includes(result); });
    if (randomBtn) randomBtn.addEventListener("click", async () => { if (output) output.textContent = "Generating..."; setButtonsState(true); const mains = Object.keys(niches); const main = mains[Math.floor(Math.random() * mains.length)]; const subs = niches[main]; const sub = subs[Math.floor(Math.random() * subs.length)]; const result = await generateSinglePrompt(sub); if (output) output.textContent = result; currentPrompt = result; setButtonsState(false); if (copyBtn) copyBtn.disabled = false; if (favBtn) favBtn.disabled = favoriteData.includes(result); });
    if (generateMetaBtn) generateMetaBtn.addEventListener("click", async () => { const promptText = output.textContent; if (!promptText || promptText.startsWith("Hasil prompt") || promptText.startsWith("Generating...")) { return showNotification("Harap generate prompt utama terlebih dahulu."); } generateMetaBtn.disabled = true; generateMetaBtn.textContent = "Generating Metadata..."; if (metadataResult) metadataResult.hidden = false; if (titlesOutput) titlesOutput.textContent = "Loading..."; if (keywordsOutput) keywordsOutput.textContent = "Loading..."; const result = await window.api.generateMetadata(promptText); if (result.error) { if (titlesOutput) titlesOutput.textContent = `Error: ${result.error}`; if (keywordsOutput) keywordsOutput.textContent = ''; } else { const finalTitle = result.titles.join(' / '); const finalKeywords = result.keywords.join(', '); if (titlesOutput) titlesOutput.textContent = finalTitle; if (keywordsOutput) keywordsOutput.textContent = finalKeywords; const metadataItem = { prompt: promptText, title: finalTitle, keywords: finalKeywords }; metadataBatch.push(metadataItem); localStorage.setItem("veoMetadataBatch", JSON.stringify(metadataBatch)); updateExportUI(); showNotification(`Metadata ditambahkan ke batch! (${metadataBatch.length}/${BATCH_GOAL})`); } generateMetaBtn.disabled = false; generateMetaBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5.22c-1.25 0-2.5 1.06-4 1.06-1.5 0-2.75-1.06-4-1.06A4.91 4.91 0 0 0 2 9.78c0 4.22 3 12.22 6 12.22 1.25 0 2.5-1.06 4-1.06Z"/><path d="M12 2.22c-1.25 0-2.5 1.06-4 1.06A4.91 4.91 0 0 0 2 7.78c0 4.22 3 12.22 6 12.22 1.25 0 2.5-1.06 4-1.06 1.5 0 2.75-1.06 4-1.06A4.91 4.91 0 0 0 17 5.22c-1.25 0-2.5 1.06-4 1.06Z"/></svg> Generate Titles & Keywords`; });
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', async () => { if (metadataBatch.length < BATCH_GOAL) { return showNotification(`Butuh ${BATCH_GOAL - metadataBatch.length} item lagi untuk ekspor.`); } const csvData = convertToCSV(metadataBatch); const result = await window.api.saveCsv(csvData); if (result.success) { showNotification(`File berhasil disimpan!`); metadataBatch = []; localStorage.setItem("veoMetadataBatch", JSON.stringify(metadataBatch)); updateExportUI(); } else if (!result.canceled) { showNotification(`Error: Gagal menyimpan file. ${result.error}`); } });
    if (clearBatchBtn) clearBatchBtn.addEventListener('click', () => { if (metadataBatch.length > 0 && confirm("Apakah Anda yakin ingin mengosongkan batch yang sudah terkumpul?")) { metadataBatch = []; localStorage.setItem("veoMetadataBatch", JSON.stringify(metadataBatch)); updateExportUI(); showNotification("Batch berhasil dikosongkan."); } });
    if (copyBtn) copyBtn.addEventListener("click", () => { if (!currentPrompt) return; navigator.clipboard.writeText(currentPrompt).then(() => showNotification("Prompt disalin!")); });
    if (favBtn) favBtn.addEventListener("click", () => { if (!currentPrompt || currentPrompt.startsWith('Error:')) return; addToFavorite(currentPrompt); });
    if (saveApiKeyBtn && apiKeyInput) saveApiKeyBtn.addEventListener('click', () => { const key = apiKeyInput.value.trim(); if (key) { window.api.saveApiKey(key); showNotification("API Key berhasil disimpan!"); } else { showNotification("Harap masukkan API Key."); } });
    if (tabHistory) tabHistory.addEventListener("click", () => { currentTab = "history"; tabHistory.classList.add("active"); if (tabFavorite) tabFavorite.classList.remove("active"); renderList(); });
    if (tabFavorite) tabFavorite.addEventListener("click", () => { currentTab = "favorite"; tabFavorite.classList.add("active"); if (tabHistory) tabHistory.classList.remove("active"); renderList(); });
    if (modeToggle) modeToggle.addEventListener("click", () => { const newTheme = (document.documentElement.getAttribute("data-theme") || "dark") === "dark" ? "light" : "dark"; localStorage.setItem("themeMode", newTheme); applyMode(newTheme); });
    
    initializeApp();
});