// ===== 数据与状态 =====
const categories = ["全部", "餐厅", "购物", "交通", "机场", "酒店", "医疗", "商务", "社交", "通用"];
let currentCategory = "全部";
const defaultPhrases = [
    { id: 1, type: "餐厅", en: "A table for two, please.", cn: "请给我一个两人的座位。", level: 0 },
    { id: 2, type: "购物", en: "How much is this?", cn: "这个多少钱？", level: 0 },
    { id: 3, type: "商务", en: "Let's touch base later this afternoon.", cn: "我们今天下午晚点联系。", level: 0 }
];

let phrases = JSON.parse(localStorage.getItem('oral_ai_v6_data')) || defaultPhrases;
let currentTheme = localStorage.getItem('oral_ai_theme') || 'light';
let currentStyle = localStorage.getItem('oral_ai_style') || 'modern';
let currentFont = localStorage.getItem('oral_ai_font') || 'inherit';
let currentFontSize = localStorage.getItem('oral_ai_font_size') || '100';
let apiKey = localStorage.getItem('oral_ai_apiKey') || "";
let currentVoice = localStorage.getItem('oral_ai_voice') || '0';
let currentRate = localStorage.getItem('oral_ai_rate') || '1';
let currentPitch = localStorage.getItem('oral_ai_pitch') || '1';

let isAutoPlaying = false;
let isRecording = false;
let currentIndex = -1;
let synth = window.speechSynthesis;
let recognition = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
}

// ===== 工具函数 =====
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getFilteredPhrases() {
    const filterText = document.getElementById('searchInput').value.toLowerCase();
    return phrases.filter(p =>
        (currentCategory === "全部" || p.type === currentCategory) &&
        (p.en.toLowerCase().includes(filterText) || p.cn.includes(filterText))
    );
}

function saveAndSync() {
    localStorage.setItem('oral_ai_v6_data', JSON.stringify(phrases));
    renderStudyList();
    renderManageList();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateIndicator(active) {
    const ind = document.getElementById('statusIndicator');
    const txt = document.getElementById('statusText');
    if (active) {
        ind.classList.replace('bg-green-500', 'bg-red-500');
        ind.classList.add('animate-ping');
        txt.innerText = "播放中";
    } else {
        ind.classList.replace('bg-red-500', 'bg-green-500');
        ind.classList.remove('animate-ping');
        txt.innerText = "系统就绪";
    }
}

// ===== 初始化 =====
function init() {
    applyTheme();
    applyStyle(currentStyle);
    applyVisualSettings();
    restoreVoiceSettings();
    populateSelects();
    renderCategoryChips();
    renderStudyList();
    renderManageList();
    loadVoices();
    lucide.createIcons();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function restoreVoiceSettings() {
    const rateRange = document.getElementById('rateRange');
    const pitchRange = document.getElementById('pitchRange');
    const rateVal = document.getElementById('rateVal');
    const pitchVal = document.getElementById('pitchVal');
    if (rateRange) { rateRange.value = currentRate; }
    if (pitchRange) { pitchRange.value = currentPitch; }
    if (rateVal) { rateVal.innerText = currentRate; }
    if (pitchVal) { pitchVal.innerText = currentPitch; }
}

// ===== 主题与视觉 =====
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('oral_ai_theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.setAttribute('data-lucide', currentTheme === 'light' ? 'moon' : 'sun');
        lucide.createIcons();
    }
    renderCategoryChips();
}

function applyStyle(style) {
    currentStyle = style;
    localStorage.setItem('oral_ai_style', style);
    document.documentElement.setAttribute('data-style', style);

    const styles = ['modern', 'github', 'retro', 'academic', 'cyber'];
    styles.forEach(s => {
        const btn = document.getElementById(`style-${s}`);
        if (btn) {
            btn.style.borderColor = (s === style) ? 'var(--primary)' : 'var(--border-color)';
            btn.style.opacity = (s === style) ? '1' : '0.8';
        }
    });

    applyVisualSettings();
    renderStudyList();
    renderManageList();
    renderCategoryChips();
}

function updateVisualSettings() {
    const fontSelect = document.getElementById('fontSelect');
    const fontSizeRange = document.getElementById('fontSizeRange');
    if (fontSelect) currentFont = fontSelect.value;
    if (fontSizeRange) currentFontSize = fontSizeRange.value;
    localStorage.setItem('oral_ai_font', currentFont);
    localStorage.setItem('oral_ai_font_size', currentFontSize);
    applyVisualSettings();
}

function applyVisualSettings() {
    document.documentElement.style.setProperty('--base-font-size', currentFontSize + '%');
    const fontSizeVal = document.getElementById('fontSizeVal');
    const fontSizeRange = document.getElementById('fontSizeRange');
    if (fontSizeVal) fontSizeVal.innerText = currentFontSize + '%';
    if (fontSizeRange) fontSizeRange.value = currentFontSize;

    let finalFont = currentFont;
    if (currentFont === 'inherit') {
        const style = getComputedStyle(document.documentElement).getPropertyValue('--font-style-default');
        finalFont = style || "'Inter', sans-serif";
    }
    document.documentElement.style.setProperty('--user-font-family', finalFont);
}

// ===== 导航 =====
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`content-${tab}`).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-btn-active'));
    document.getElementById(`tab-${tab}`).classList.add('tab-btn-active');
    lucide.createIcons();
}

// ===== 分类筛选 =====
function renderCategoryChips() {
    const container = document.getElementById('categoryChips');
    container.innerHTML = categories.map(cat => `
        <button onclick="selectCategory('${cat}')"
            class="px-4 py-1.5 theme-radius text-[10px] font-black uppercase whitespace-nowrap transition-all chip
            ${currentCategory === cat ? 'chip-active' : ''}">
            ${cat}
        </button>
    `).join('');
}

function selectCategory(cat) {
    currentCategory = cat;
    renderCategoryChips();
    renderStudyList();
    if (isAutoPlaying) stopAll();
}

// ===== 学习与播放 =====
function renderStudyList() {
    const container = document.getElementById('studyList');
    const data = getFilteredPhrases();

    if (data.length === 0) {
        container.innerHTML = `<div class="text-center py-20 theme-text-muted opacity-40 text-xs italic tracking-widest">目前该场景下暂无内容</div>`;
        return;
    }

    container.innerHTML = data.map((item, idx) => `
        <div class="card theme-card shadow-sm transition-all group overflow-hidden" id="scard-${idx}">
            <div class="p-5 space-y-4">
                <div class="flex justify-between items-start">
                    <div class="flex-1 cursor-pointer" onclick="handleStudyClick(${idx})">
                        <span class="text-[8px] font-black uppercase theme-text-muted px-2 py-0.5 border theme-border theme-radius mb-2 inline-block">${escapeHtml(item.type || '未分类')}</span>
                        <div class="theme-primary-text font-bold text-lg leading-tight mb-1">${escapeHtml(item.en)}</div>
                        <div class="phrase-cn theme-text-muted text-xs font-medium transition-all">${escapeHtml(item.cn)}</div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="explainSentence(${idx})" class="p-2 theme-radius bg-black/5 dark:bg-white/5 theme-text-muted hover:theme-primary-text"><i data-lucide="sparkles" class="w-4 h-4"></i></button>
                        <button onclick="startShadowing(${idx})" id="rec-${idx}" class="p-2 theme-radius bg-black/5 dark:bg-white/5 theme-text-muted hover:text-red-500"><i data-lucide="mic" class="w-4 h-4"></i></button>
                    </div>
                </div>
                <div class="flex items-center justify-between pt-3 border-t theme-border">
                    <div class="flex gap-2">
                        <button onclick="setMastery(${item.id}, 0)" class="w-6 h-6 rounded-full border theme-border flex items-center justify-center text-[8px] font-black ${item.level == 0 ? 'theme-primary-bg text-white' : 'theme-text-muted'}">未</button>
                        <button onclick="setMastery(${item.id}, 1)" class="w-6 h-6 rounded-full border theme-border flex items-center justify-center text-[8px] font-black ${item.level == 1 ? 'bg-orange-500 text-white' : 'theme-text-muted'}">疑</button>
                        <button onclick="setMastery(${item.id}, 2)" class="w-6 h-6 rounded-full border theme-border flex items-center justify-center text-[8px] font-black ${item.level == 2 ? 'bg-green-600 text-white' : 'theme-text-muted'}">熟</button>
                    </div>
                    <div id="wave-${idx}" class="wave-container opacity-0 transition-opacity">
                        <div class="wave-bar"></div><div class="wave-bar" style="animation-delay: -0.4s"></div><div class="wave-bar" style="animation-delay: -0.8s"></div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function handleStudyClick(displayIdx) {
    if (isAutoPlaying) stopAll();
    const filtered = getFilteredPhrases();
    const phrase = filtered[displayIdx];
    if (phrase) speak(phrase.en, displayIdx);
}

function speak(text, displayIdx, callback) {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices().filter(v => v.lang.includes('en'));
    const voiceSelect = document.getElementById('voiceSelect');
    const voiceIdx = voiceSelect ? voiceSelect.value : 0;
    if (voices[voiceIdx]) utter.voice = voices[voiceIdx];
    const rateRange = document.getElementById('rateRange');
    const pitchRange = document.getElementById('pitchRange');
    utter.rate = rateRange ? parseFloat(rateRange.value) : 1;
    utter.pitch = pitchRange ? parseFloat(pitchRange.value) : 1;

    document.querySelectorAll('.card').forEach(c => c.classList.remove('card-active'));
    const card = document.getElementById(`scard-${displayIdx}`);
    if (card) card.classList.add('card-active');

    updateIndicator(true);
    const wave = document.getElementById(`wave-${displayIdx}`);
    if (wave) wave.classList.remove('opacity-0');

    utter.onend = () => {
        updateIndicator(false);
        if (wave) wave.classList.add('opacity-0');
        if (callback) callback();
    };
    synth.speak(utter);
}

function toggleAutoPlay() {
    if (isAutoPlaying) {
        stopAll();
    } else {
        const data = getFilteredPhrases();
        if (data.length === 0) return;
        isAutoPlaying = true;
        currentIndex = 0;
        updatePlayBtnUI(true);
        const cycle = () => {
            if (!isAutoPlaying) return;
            if (currentIndex >= data.length) currentIndex = 0;
            speak(data[currentIndex].en, currentIndex, () => {
                currentIndex++;
                setTimeout(cycle, 1500);
            });
        };
        cycle();
    }
}

function stopAll() {
    isAutoPlaying = false;
    synth.cancel();
    updatePlayBtnUI(false);
    updateIndicator(false);
    document.querySelectorAll('.wave-container').forEach(w => w.classList.add('opacity-0'));
}

function updatePlayBtnUI(playing) {
    const text = document.getElementById('playText');
    if (text) text.innerText = playing ? "停止播放" : `顺序播放 [${currentCategory}]`;
    const icon = document.getElementById('playIcon');
    if (icon) icon.setAttribute('data-lucide', playing ? 'pause' : 'play');
    lucide.createIcons();
}

function startShadowing(displayIdx) {
    if (!recognition) return showToast("浏览器不支持语音识别");
    if (isRecording) { recognition.stop(); return; }
    const filtered = getFilteredPhrases();
    const phrase = filtered[displayIdx];
    if (!phrase) return;
    const originalText = phrase.en;
    isRecording = true;
    const btn = document.getElementById(`rec-${displayIdx}`);
    btn.classList.add('bg-red-500', 'text-white');
    showToast("请朗读原文...");
    recognition.onresult = (event) => {
        const t = event.results[0][0].transcript.toLowerCase().replace(/[.,!]/g, "");
        const o = originalText.toLowerCase().replace(/[.,!]/g, "");
        showToast(t === o ? "发音完美！" : `读成了: "${t}"`);
    };
    recognition.onend = () => { isRecording = false; btn.classList.remove('bg-red-500', 'text-white'); };
    recognition.start();
}

// ===== 管理 =====
function renderManageList() {
    const container = document.getElementById('manageList');
    document.getElementById('manageCount').innerText = phrases.length;
    container.innerHTML = phrases.map((item, index) => `
        <div class="theme-card p-4 flex justify-between items-center group shadow-sm transition-all">
            <div class="flex-1 pr-4 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[8px] px-1 bg-black/5 theme-text-muted theme-radius font-black uppercase border theme-border">${escapeHtml(item.type || '通用')}</span>
                    <span class="theme-text-main font-bold text-sm line-clamp-1">${escapeHtml(item.en)}</span>
                </div>
                <div class="theme-text-muted text-[10px] line-clamp-1">${escapeHtml(item.cn)}</div>
            </div>
            <div class="flex gap-1">
                <button onclick="movePhrase(${index}, -1)" class="p-1 theme-text-muted hover:theme-primary-text"><i data-lucide="chevron-up" class="w-4 h-4"></i></button>
                <button onclick="movePhrase(${index}, 1)" class="p-1 theme-text-muted hover:theme-primary-text"><i data-lucide="chevron-down" class="w-4 h-4"></i></button>
                <button onclick="deletePhrase(${item.id})" class="p-1 theme-text-muted hover:text-red-500"><i data-lucide="trash" class="w-4 h-4"></i></button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function addPhrase() {
    const en = document.getElementById('newEn').value.trim();
    const cn = document.getElementById('newCn').value.trim();
    const type = document.getElementById('newType').value;
    if (!en) return;
    phrases.unshift({ id: Date.now(), type, en, cn: cn || "等待解析...", level: 0 });
    saveAndSync();
    document.getElementById('newEn').value = '';
    document.getElementById('newCn').value = '';
}

// ===== 排序 =====
function movePhrase(idx, dir) {
    const tidx = idx + dir;
    if (tidx >= 0 && tidx < phrases.length) {
        [phrases[idx], phrases[tidx]] = [phrases[tidx], phrases[idx]];
        saveAndSync();
    }
}

function deletePhrase(id) {
    if (confirm("确定删除？")) {
        phrases = phrases.filter(p => p.id !== id);
        saveAndSync();
    }
}

function setMastery(id, level) {
    phrases = phrases.map(p => p.id === id ? { ...p, level } : p);
    saveAndSync();
}

// ===== 导入与导出 =====
function exportData() {
    const data = {
        version: 'oral_ai_v6',
        exportDate: new Date().toISOString(),
        count: phrases.length,
        phrases: phrases
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oral_ai_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${phrases.length} 条短语`);
}

function importData() {
    document.getElementById('importModal').classList.remove('hidden');
    document.getElementById('importJsonText').value = '';
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) fileInput.value = '';
    lucide.createIcons();
}

function closeImportModal() {
    document.getElementById('importModal').classList.add('hidden');
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('importJsonText').value = e.target.result;
        showToast('文件已加载，请确认导入');
    };
    reader.readAsText(file);
}

function processImport() {
    const text = document.getElementById('importJsonText').value.trim();
    if (!text) return showToast('请先选择文件或粘贴 JSON');

    try {
        const data = JSON.parse(text);
        let importPhrases;

        if (Array.isArray(data)) {
            importPhrases = data;
        } else if (data.phrases && Array.isArray(data.phrases)) {
            importPhrases = data.phrases;
        } else {
            return showToast('无效的 JSON 格式');
        }

        if (importPhrases.length === 0) return showToast('没有可导入的数据');

        const mode = document.getElementById('importMode').value;
        if (mode === 'replace') {
            phrases = importPhrases;
        } else {
            const maxId = phrases.reduce((max, p) => Math.max(max, p.id || 0), 0);
            importPhrases.forEach((p, i) => { p.id = maxId + i + 1; });
            phrases = [...phrases, ...importPhrases];
        }

        saveAndSync();
        closeImportModal();
        showToast(`已导入 ${importPhrases.length} 条短语 (${mode === 'replace' ? '替换' : '追加'})`);
    } catch (e) {
        showToast('JSON 解析失败：' + e.message);
    }
}

// ===== AI 解析 =====
async function explainSentence(displayIdx) {
    if (!apiKey) return showToast("请先在设置中配置 API Key");
    const filtered = getFilteredPhrases();
    const phrase = filtered[displayIdx];
    if (!phrase) return showToast("找不到该短语");
    const sentence = phrase.en;
    document.getElementById('aiModal').classList.remove('hidden');
    const content = document.getElementById('aiContent');
    content.innerHTML = `<div class='flex flex-col items-center py-10'><i data-lucide='loader' class='animate-spin theme-primary-text mb-2'></i><span>AI 分析中...</span></div>`;
    lucide.createIcons();
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `你是一位英语老师，请详细解析：'${sentence}'。包含翻译、重点词汇、语法和例句。Markdown 格式。` }] }] })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "解析失败";
        content.innerHTML = `<div class='prose prose-sm dark:prose-invert'>${text.replace(/\n/g, '<br>')}</div>`;
    } catch (e) { content.innerText = "请求失败"; }
}

function closeAiModal() {
    document.getElementById('aiModal').classList.add('hidden');
}

// ===== 设置与其他 =====
function saveApiKey() {
    apiKey = document.getElementById('apiKeyInput').value;
    localStorage.setItem('oral_ai_apiKey', apiKey);
    showToast("API Key 已保存");
}

function loadVoices() {
    const select = document.getElementById('voiceSelect');
    const v = synth.getVoices().filter(v => v.lang.includes('en'));
    if (select) {
        select.innerHTML = v.map((v, i) => `<option value="${i}">${escapeHtml(v.name)}</option>`).join('');
        select.value = currentVoice;
    }
}

function populateSelects() {
    const opts = categories.filter(c => c !== "全部").map(t => `<option value="${t}">${t}</option>`).join('');
    document.getElementById('newType').innerHTML = opts;
}

function updateSettings() {
    const rateVal = document.getElementById('rateVal');
    const pitchVal = document.getElementById('pitchVal');
    const rateRange = document.getElementById('rateRange');
    const pitchRange = document.getElementById('pitchRange');
    const voiceSelect = document.getElementById('voiceSelect');
    if (rateVal && rateRange) rateVal.innerText = rateRange.value;
    if (pitchVal && pitchRange) pitchVal.innerText = pitchRange.value;
    if (rateRange) { currentRate = rateRange.value; localStorage.setItem('oral_ai_rate', currentRate); }
    if (pitchRange) { currentPitch = pitchRange.value; localStorage.setItem('oral_ai_pitch', currentPitch); }
    if (voiceSelect) { currentVoice = voiceSelect.value; localStorage.setItem('oral_ai_voice', currentVoice); }
}

function clearData() {
    if (confirm("确定重置？")) { localStorage.clear(); location.reload(); }
}

function toggleBlur() {
    document.body.classList.toggle('hide-cn');
    const b = document.getElementById('blurToggleBtn');
    b.querySelector('span').innerText = document.body.classList.contains('hide-cn') ? "显示中文" : "隐藏中文";
}

function filterPhrases() { renderStudyList(); }

init();
