// ===== 存储键常量 (参考 command-hub 持久化模式) =====
const STORAGE_KEYS = {
    PHRASES:   'oral_ai_v6_data',
    THEME:     'oral_ai_theme',
    STYLE:     'oral_ai_style',
    FONT:      'oral_ai_font',
    FONT_SIZE: 'oral_ai_font_size',
    API_KEY:   'oral_ai_apiKey',
    VOICE:     'oral_ai_voice',
    RATE:      'oral_ai_rate',
    PITCH:     'oral_ai_pitch'
};

// ===== 持久化抽象层 =====
const Storage = {
    load(key, fallback = '') {
        try { return localStorage.getItem(key) ?? fallback; }
        catch { return fallback; }
    },
    loadJSON(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch { return fallback; }
    },
    save(key, value) {
        try { localStorage.setItem(key, value); }
        catch (e) { console.error('Storage save failed:', e); }
    },
    saveJSON(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch (e) { console.error('Storage saveJSON failed:', e); }
    },
    clearAll() {
        localStorage.clear();
    }
};

// ===== 数据与状态 =====
const categories = ["全部", "餐厅", "购物", "交通", "机场", "酒店", "医疗", "商务", "社交", "通用"];
let currentCategory = "全部";
const defaultPhrases = [
    // ===== 餐厅 (12条) =====
    { id: 1, type: "餐厅", en: "A table for two, please.", cn: "请给我一个两人的座位。", level: 0 },
    { id: 2, type: "餐厅", en: "Could I see the menu, please?", cn: "请给我看一下菜单好吗？", level: 0 },
    { id: 3, type: "餐厅", en: "I'd like to order the steak, medium rare.", cn: "我想点一份牛排，五分熟。", level: 0 },
    { id: 4, type: "餐厅", en: "Do you have any vegetarian options?", cn: "你们有素食选项吗？", level: 0 },
    { id: 5, type: "餐厅", en: "Could we get the check, please?", cn: "请给我们结账好吗？", level: 0 },
    { id: 6, type: "餐厅", en: "I'm allergic to peanuts. Does this contain any?", cn: "我对花生过敏。这道菜含花生吗？", level: 0 },
    { id: 7, type: "餐厅", en: "What do you recommend?", cn: "你有什么推荐的吗？", level: 0 },
    { id: 8, type: "餐厅", en: "Can I have a glass of water, please?", cn: "请给我一杯水好吗？", level: 0 },
    { id: 9, type: "餐厅", en: "Is the tip included in the bill?", cn: "账单里包含小费了吗？", level: 0 },
    { id: 10, type: "餐厅", en: "We'd like to split the bill, please.", cn: "我们想分开结账。", level: 0 },
    { id: 11, type: "餐厅", en: "Could you make it less spicy?", cn: "能做得不那么辣吗？", level: 0 },
    { id: 12, type: "餐厅", en: "I'd like to make a reservation for tonight at 7.", cn: "我想预订今晚7点的位子。", level: 0 },

    // ===== 购物 (12条) =====
    { id: 13, type: "购物", en: "How much is this?", cn: "这个多少钱？", level: 0 },
    { id: 14, type: "购物", en: "Do you have this in a smaller size?", cn: "这个有小一号的吗？", level: 0 },
    { id: 15, type: "购物", en: "Can I try this on?", cn: "我可以试穿一下吗？", level: 0 },
    { id: 16, type: "购物", en: "Where is the fitting room?", cn: "试衣间在哪里？", level: 0 },
    { id: 17, type: "购物", en: "Do you accept credit cards?", cn: "你们接受信用卡吗？", level: 0 },
    { id: 18, type: "购物", en: "Is this on sale?", cn: "这个在打折吗？", level: 0 },
    { id: 19, type: "购物", en: "Can I get a refund if it doesn't fit?", cn: "如果不合适可以退款吗？", level: 0 },
    { id: 20, type: "购物", en: "I'm just looking, thanks.", cn: "我只是看看，谢谢。", level: 0 },
    { id: 21, type: "购物", en: "Could you give me a discount?", cn: "能给我打个折吗？", level: 0 },
    { id: 22, type: "购物", en: "Do you have this in another color?", cn: "这个有其他颜色吗？", level: 0 },
    { id: 23, type: "购物", en: "Where can I find the electronics section?", cn: "电子产品区在哪里？", level: 0 },
    { id: 24, type: "购物", en: "I'll take this one. Could you wrap it up?", cn: "我要这个，能帮我包起来吗？", level: 0 },

    // ===== 交通 (12条) =====
    { id: 25, type: "交通", en: "How do I get to the nearest subway station?", cn: "最近的地铁站怎么走？", level: 0 },
    { id: 26, type: "交通", en: "Could you take me to this address, please?", cn: "请送我到这个地址。", level: 0 },
    { id: 27, type: "交通", en: "How long does it take to get there?", cn: "到那里需要多长时间？", level: 0 },
    { id: 28, type: "交通", en: "Is this the right bus to downtown?", cn: "这是去市中心的公交车吗？", level: 0 },
    { id: 29, type: "交通", en: "Where can I buy a transit pass?", cn: "在哪里能买到交通卡？", level: 0 },
    { id: 30, type: "交通", en: "Please stop here. How much do I owe you?", cn: "请在这里停车。多少钱？", level: 0 },
    { id: 31, type: "交通", en: "Which platform does the train leave from?", cn: "火车从哪个站台出发？", level: 0 },
    { id: 32, type: "交通", en: "I'd like to rent a car for three days.", cn: "我想租一辆车，租三天。", level: 0 },
    { id: 33, type: "交通", en: "Does this train go to Central Station?", cn: "这趟火车到中央车站吗？", level: 0 },
    { id: 34, type: "交通", en: "Excuse me, is this seat taken?", cn: "请问这个座位有人吗？", level: 0 },
    { id: 35, type: "交通", en: "What time is the last bus?", cn: "末班车是几点？", level: 0 },
    { id: 36, type: "交通", en: "Could you call a taxi for me?", cn: "能帮我叫一辆出租车吗？", level: 0 },

    // ===== 机场 (12条) =====
    { id: 37, type: "机场", en: "Where is the check-in counter for Flight CA981?", cn: "CA981航班的值机柜台在哪？", level: 0 },
    { id: 38, type: "机场", en: "I'd like a window seat, please.", cn: "请给我一个靠窗的座位。", level: 0 },
    { id: 39, type: "机场", en: "How many bags can I check in?", cn: "我可以托运几件行李？", level: 0 },
    { id: 40, type: "机场", en: "Where is the departure gate?", cn: "登机口在哪里？", level: 0 },
    { id: 41, type: "机场", en: "My flight has been delayed. When is the next one?", cn: "我的航班延误了。下一班是什么时候？", level: 0 },
    { id: 42, type: "机场", en: "I have nothing to declare.", cn: "我没有需要申报的物品。", level: 0 },
    { id: 43, type: "机场", en: "Where can I pick up my luggage?", cn: "我在哪里取行李？", level: 0 },
    { id: 44, type: "机场", en: "Is there free Wi-Fi in the airport?", cn: "机场有免费 Wi-Fi 吗？", level: 0 },
    { id: 45, type: "机场", en: "I'd like to change my seat assignment.", cn: "我想换一下座位。", level: 0 },
    { id: 46, type: "机场", en: "What is the boarding time?", cn: "登机时间是几点？", level: 0 },
    { id: 47, type: "机场", en: "My luggage is missing. Can you help me find it?", cn: "我的行李丢了，能帮我找一下吗？", level: 0 },
    { id: 48, type: "机场", en: "Where is the currency exchange?", cn: "货币兑换处在哪里？", level: 0 },

    // ===== 酒店 (12条) =====
    { id: 49, type: "酒店", en: "I have a reservation under the name Zhang.", cn: "我有一个张姓的预订。", level: 0 },
    { id: 50, type: "酒店", en: "What time is check-out?", cn: "退房时间是几点？", level: 0 },
    { id: 51, type: "酒店", en: "Could I have a late check-out?", cn: "可以延迟退房吗？", level: 0 },
    { id: 52, type: "酒店", en: "Is breakfast included?", cn: "包含早餐吗？", level: 0 },
    { id: 53, type: "酒店", en: "The air conditioning in my room isn't working.", cn: "我房间的空调坏了。", level: 0 },
    { id: 54, type: "酒店", en: "Could I get some extra towels?", cn: "能多给我几条毛巾吗？", level: 0 },
    { id: 55, type: "酒店", en: "What's the Wi-Fi password?", cn: "Wi-Fi 密码是什么？", level: 0 },
    { id: 56, type: "酒店", en: "I'd like to book a room for two nights.", cn: "我想订一间房，住两晚。", level: 0 },
    { id: 57, type: "酒店", en: "Is there a gym or swimming pool?", cn: "酒店有健身房或游泳池吗？", level: 0 },
    { id: 58, type: "酒店", en: "Could you recommend a good restaurant nearby?", cn: "能推荐附近的好餐厅吗？", level: 0 },
    { id: 59, type: "酒店", en: "I'd like to request a room change.", cn: "我想换一间房。", level: 0 },
    { id: 60, type: "酒店", en: "Can I leave my luggage here after check-out?", cn: "退房后可以把行李寄存在这里吗？", level: 0 },

    // ===== 医疗 (12条) =====
    { id: 61, type: "医疗", en: "I need to see a doctor. It's urgent.", cn: "我需要看医生，很紧急。", level: 0 },
    { id: 62, type: "医疗", en: "I have a terrible headache.", cn: "我头疼得厉害。", level: 0 },
    { id: 63, type: "医疗", en: "I'm allergic to penicillin.", cn: "我对青霉素过敏。", level: 0 },
    { id: 64, type: "医疗", en: "Where is the nearest pharmacy?", cn: "最近的药店在哪里？", level: 0 },
    { id: 65, type: "医疗", en: "I've been feeling dizzy since this morning.", cn: "我从今早开始一直头晕。", level: 0 },
    { id: 66, type: "医疗", en: "Do I need a prescription for this medicine?", cn: "这个药需要处方吗？", level: 0 },
    { id: 67, type: "医疗", en: "I have a fever and a sore throat.", cn: "我发烧了，嗓子也疼。", level: 0 },
    { id: 68, type: "医疗", en: "How often should I take this medication?", cn: "这个药多久吃一次？", level: 0 },
    { id: 69, type: "医疗", en: "I think I sprained my ankle.", cn: "我觉得我扭到脚踝了。", level: 0 },
    { id: 70, type: "医疗", en: "Is this covered by my travel insurance?", cn: "这个在我的旅行保险范围内吗？", level: 0 },
    { id: 71, type: "医疗", en: "I need to fill this prescription.", cn: "我需要按这个处方配药。", level: 0 },
    { id: 72, type: "医疗", en: "Could you explain the diagnosis to me?", cn: "能给我解释一下诊断结果吗？", level: 0 },

    // ===== 商务 (12条) =====
    { id: 73, type: "商务", en: "Let's touch base later this afternoon.", cn: "我们今天下午晚点联系。", level: 0 },
    { id: 74, type: "商务", en: "Could we schedule a meeting for next Monday?", cn: "我们能把会议安排在下周一吗？", level: 0 },
    { id: 75, type: "商务", en: "I'd like to go over the quarterly report.", cn: "我想过一下季度报告。", level: 0 },
    { id: 76, type: "商务", en: "Let me walk you through the proposal.", cn: "让我带你过一遍这个方案。", level: 0 },
    { id: 77, type: "商务", en: "We need to circle back on this issue.", cn: "我们需要回头再讨论这个问题。", level: 0 },
    { id: 78, type: "商务", en: "I'll send you the follow-up email by end of day.", cn: "我会在今天下班前给你发后续邮件。", level: 0 },
    { id: 79, type: "商务", en: "What's the timeline for this project?", cn: "这个项目的时间线是怎样的？", level: 0 },
    { id: 80, type: "商务", en: "Let's take this offline and discuss it later.", cn: "我们线下再讨论这件事吧。", level: 0 },
    { id: 81, type: "商务", en: "Could you share the slides before the meeting?", cn: "能在会议前分享一下幻灯片吗？", level: 0 },
    { id: 82, type: "商务", en: "I think we're on the same page.", cn: "我觉得我们的想法一致。", level: 0 },
    { id: 83, type: "商务", en: "Let's keep the momentum going on this.", cn: "让我们在这件事上保持势头。", level: 0 },
    { id: 84, type: "商务", en: "I'll loop in the marketing team on this.", cn: "我会把市场团队拉进来一起讨论。", level: 0 },

    // ===== 社交 (12条) =====
    { id: 85, type: "社交", en: "It's so nice to meet you!", cn: "很高兴认识你！", level: 0 },
    { id: 86, type: "社交", en: "What do you do for a living?", cn: "你是做什么工作的？", level: 0 },
    { id: 87, type: "社交", en: "Where are you from originally?", cn: "你老家是哪里的？", level: 0 },
    { id: 88, type: "社交", en: "Would you like to grab a coffee sometime?", cn: "有空一起喝杯咖啡吗？", level: 0 },
    { id: 89, type: "社交", en: "I had a great time tonight. Thanks for having me!", cn: "今晚很开心，谢谢你的招待！", level: 0 },
    { id: 90, type: "社交", en: "Let me introduce you to my friend.", cn: "让我给你介绍一下我的朋友。", level: 0 },
    { id: 91, type: "社交", en: "How have you been? It's been ages!", cn: "你最近怎么样？好久不见了！", level: 0 },
    { id: 92, type: "社交", en: "That sounds amazing! Tell me more about it.", cn: "听起来太棒了！跟我多说说。", level: 0 },
    { id: 93, type: "社交", en: "Do you have any plans for the weekend?", cn: "周末有什么安排吗？", level: 0 },
    { id: 94, type: "社交", en: "I'm sorry, I didn't catch your name.", cn: "抱歉，我没听清你的名字。", level: 0 },
    { id: 95, type: "社交", en: "Feel free to reach out anytime.", cn: "随时联系我。", level: 0 },
    { id: 96, type: "社交", en: "It was lovely chatting with you. Let's keep in touch!", cn: "和你聊天很愉快，保持联系！", level: 0 },

    // ===== 通用 (12条) =====
    { id: 97, type: "通用", en: "Excuse me, could you help me with something?", cn: "不好意思，能帮我一下吗？", level: 0 },
    { id: 98, type: "通用", en: "I'm sorry, I don't understand. Could you repeat that?", cn: "抱歉我没听懂，能再说一遍吗？", level: 0 },
    { id: 99, type: "通用", en: "Could you speak a little more slowly, please?", cn: "能说慢一点吗？", level: 0 },
    { id: 100, type: "通用", en: "Where is the restroom?", cn: "洗手间在哪里？", level: 0 },
    { id: 101, type: "通用", en: "Thank you so much for your help!", cn: "非常感谢你的帮助！", level: 0 },
    { id: 102, type: "通用", en: "I'm sorry, my English is not very good.", cn: "不好意思，我的英语不太好。", level: 0 },
    { id: 103, type: "通用", en: "Could you write that down for me?", cn: "能把那个写下来给我吗？", level: 0 },
    { id: 104, type: "通用", en: "What does this word mean?", cn: "这个词是什么意思？", level: 0 },
    { id: 105, type: "通用", en: "How do you say this in English?", cn: "这个用英语怎么说？", level: 0 },
    { id: 106, type: "通用", en: "Is there someone here who speaks Chinese?", cn: "这里有人会说中文吗？", level: 0 },
    { id: 107, type: "通用", en: "I appreciate your patience.", cn: "感谢你的耐心。", level: 0 },
    { id: 108, type: "通用", en: "Could you point me in the right direction?", cn: "能给我指一下方向吗？", level: 0 }
];

// 集中加载所有持久化数据
let phrases     = Storage.loadJSON(STORAGE_KEYS.PHRASES, defaultPhrases);
let currentTheme    = Storage.load(STORAGE_KEYS.THEME, 'light');
let currentStyle    = Storage.load(STORAGE_KEYS.STYLE, 'modern');
let currentFont     = Storage.load(STORAGE_KEYS.FONT, 'inherit');
let currentFontSize = Storage.load(STORAGE_KEYS.FONT_SIZE, '100');
let apiKey          = Storage.load(STORAGE_KEYS.API_KEY, '');
let currentVoice    = Storage.load(STORAGE_KEYS.VOICE, '0');
let currentRate     = Storage.load(STORAGE_KEYS.RATE, '1');
let currentPitch    = Storage.load(STORAGE_KEYS.PITCH, '1');

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

// 持久化短语数据（纯存储，不触发 UI）
function savePhrases() {
    Storage.saveJSON(STORAGE_KEYS.PHRASES, phrases);
}

// 持久化 + 刷新 UI（每次数据变动后调用）
function saveAndSync() {
    savePhrases();
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
    Storage.save(STORAGE_KEYS.THEME, currentTheme);
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
    Storage.save(STORAGE_KEYS.STYLE, style);
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
    Storage.save(STORAGE_KEYS.FONT, currentFont);
    Storage.save(STORAGE_KEYS.FONT_SIZE, currentFontSize);
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
    // 延迟释放 Blob URL 以确保下载完成 (参考 command-hub)
    setTimeout(() => URL.revokeObjectURL(url), 100);
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
    Storage.save(STORAGE_KEYS.API_KEY, apiKey);
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
    if (rateRange) { currentRate = rateRange.value; Storage.save(STORAGE_KEYS.RATE, currentRate); }
    if (pitchRange) { currentPitch = pitchRange.value; Storage.save(STORAGE_KEYS.PITCH, currentPitch); }
    if (voiceSelect) { currentVoice = voiceSelect.value; Storage.save(STORAGE_KEYS.VOICE, currentVoice); }
}

// 加载默认短语库（参考 command-hub 的 loadDefaultDatabase）
function loadDefaultPhrases() {
    if (!confirm('加载默认数据会覆盖当前所有短语，确定继续吗？')) return;
    phrases = JSON.parse(JSON.stringify(defaultPhrases));
    saveAndSync();
    showToast(`已加载 ${phrases.length} 条默认短语`);
}

function clearData() {
    if (confirm("确定重置所有数据和设置？")) { Storage.clearAll(); location.reload(); }
}

function toggleBlur() {
    document.body.classList.toggle('hide-cn');
    const b = document.getElementById('blurToggleBtn');
    b.querySelector('span').innerText = document.body.classList.contains('hide-cn') ? "显示中文" : "隐藏中文";
}

function filterPhrases() { renderStudyList(); }

init();
