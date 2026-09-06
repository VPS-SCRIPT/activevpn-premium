/* =========================================================
   THEME LOGIC (PANEL THEME)
========================================================= */
function initTheme() {
    const saved = localStorage.getItem("theme");
    const icon = document.getElementById("themeIcon");
    if (saved === "light") {
        document.documentElement.classList.remove("dark");
        icon.className = "fa-solid fa-sun text-lg text-amber-500";
    } else {
        document.documentElement.classList.add("dark");
        icon.className = "fa-solid fa-moon text-lg text-amber-400";
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    const icon = document.getElementById("themeIcon");
    if (html.classList.contains("dark")) {
        html.classList.remove("dark");
        localStorage.setItem("theme", "light");
        icon.className = "fa-solid fa-sun text-lg text-amber-500";
    } else {
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
        icon.className = "fa-solid fa-moon text-lg text-amber-400";
    }
    // Refresh charts with new theme colors
    setTimeout(refreshCharts, 150);
}
initTheme();

/* =========================================================
   LIGHT / DARK SLIP THEME TOGGLE
========================================================= */
let currentSlipTheme = 'dark';

function setSlipTheme(theme) {
    currentSlipTheme = theme;
    const card = document.getElementById("receiptCardToCapture");
    const darkBtn = document.getElementById("slipDarkBtn");
    const lightBtn = document.getElementById("slipLightBtn");

    if (theme === 'light') {
        card.classList.remove("dark-slip-mode");
        card.classList.add("light-slip-mode");
        lightBtn.className =
            "py-1 px-2.5 rounded-lg text-[11px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow transition";
        darkBtn.className =
            "py-1 px-2.5 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition";
    } else {
        card.classList.remove("light-slip-mode");
        card.classList.add("dark-slip-mode");
        darkBtn.className =
            "py-1 px-2.5 rounded-lg text-[11px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow transition";
        lightBtn.className =
            "py-1 px-2.5 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition";
    }
}

/* =========================================================
   DATE FORMATTING & UTILITIES
========================================================= */
function getTodayFormatted() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatDateForDisplay(value) {
    if (!value) return "—";
    if (value.includes("/")) return value;
    const p = value.split("-");
    if (p.length !== 3) return value;
    return `${p[2]}/${p[1]}/${p[0]}`;
}

function parseFormattedDateToInput(value) {
    if (!value || value === "—") return "";
    const p = value.split("/");
    if (p.length === 3) {
        return `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
    }
    return value;
}

function parseDateToMonthKey(dateStr) {
    if (!dateStr || dateStr === "—") return null;
    let d;
    if (dateStr.includes("/")) {
        const p = dateStr.split("/");
        d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    } else {
        d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* =========================================================
   REVENUE & NUMBER HELPER
========================================================= */
function parsePriceValue(rawPrice) {
    if (!rawPrice || rawPrice === "—" || rawPrice === "-") return 0;
    const cleaned = String(rawPrice).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/* =========================================================
   AVATAR GENERATOR
========================================================= */
const avatarGradients = [
    "from-blue-600 to-indigo-600 text-white",
    "from-emerald-500 to-teal-700 text-white",
    "from-purple-600 to-pink-600 text-white",
    "from-amber-500 to-orange-600 text-white",
    "from-rose-500 to-red-600 text-white",
    "from-cyan-500 to-blue-600 text-white",
    "from-indigo-500 to-purple-700 text-white",
    "from-teal-500 to-emerald-700 text-white"
];

function getAvatarInitial(name) {
    if (!name || name === "-") return "U";
    const trimmed = name.trim();
    return trimmed.substring(0, 1).toUpperCase();
}

function getAvatarGradient(name) {
    if (!name) return avatarGradients[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarGradients.length;
    return avatarGradients[index];
}

/* =========================================================
   DATE PICKER MODAL
========================================================= */
let activeDateContext = 'add';

function openDateModal(context = 'add') {
    activeDateContext = context;
    document.getElementById("datePickerModal").classList.remove("hidden");
}

function closeDateModal() {
    document.getElementById("datePickerModal").classList.add("hidden");
}

function applyDatePreset(daysToAdd) {
    const startInput = activeDateContext === 'add' ? document.getElementById("startDate") : document.getElementById(
        "editStartDate");
    const expInput = activeDateContext === 'add' ? document.getElementById("expireDate") : document.getElementById(
        "editExpireDate");

    const now = new Date();
    const startVal =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (startInput) startInput.value = startVal;

    const future = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const expVal =
        `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;

    if (expInput) expInput.value = expVal;

    closeDateModal();
}

/* =========================================================
   3-STAGE STATUS CHECK
========================================================= */
function getValidDaysAndStatus(value) {
    if (!value || value === "—") {
        return { days: 0, statusType: "offline", label: "Expired", color: "red", isOnline: false };
    }

    let date;
    if (value.includes("/")) {
        const p = value.split("/");
        date = new Date(p[2], p[1] - 1, p[0], 23, 59, 59);
    } else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) {
        return { days: 0, statusType: "offline", label: "Expired", color: "red", isOnline: false };
    }

    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);

    if (days <= 0) {
        return { days: 0, statusType: "offline", label: "Offline", color: "red", isOnline: false };
    } else if (days <= 5) {
        return { days: days, statusType: "warning", label: `${days} Days Left`, color: "yellow", isOnline: true };
    } else {
        return { days: days, statusType: "online", label: `${days} Days`, color: "green", isOnline: true };
    }
}

function formatPriceWithSymbol(rawPrice) {
    if (!rawPrice || rawPrice === "—" || rawPrice === "-") return "—";
    const str = String(rawPrice).trim();
    if (str.includes("฿")) return str;
    return `${str} ฿`;
}

/* =========================================================
   ALERT & CONFIRM
========================================================= */
function showAlert(title, message, type = "success") {
    const modal = document.getElementById("alertModal");
    document.getElementById("alertTitle").innerText = title;
    document.getElementById("alertMessage").innerText = message;
    const container = document.getElementById("alertIconContainer");
    const icon = document.getElementById("alertIcon");

    if (type === "error") {
        container.className =
            "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500/20 text-red-500";
        icon.className = "fa-solid fa-xmark text-2xl";
    } else {
        container.className =
            "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-500/20 text-emerald-500";
        icon.className = "fa-solid fa-check text-2xl";
    }
    modal.classList.remove("hidden");
}

function closeAlert() {
    document.getElementById("alertModal").classList.add("hidden");
}

let confirmCallback = null;

function showConfirm(title, message, callback) {
    confirmCallback = callback;
    document.getElementById("confirmTitle").innerText = title;
    document.getElementById("confirmMessage").innerText = message;
    document.getElementById("confirmModal").classList.remove("hidden");
}

function closeConfirm() {
    document.getElementById("confirmModal").classList.add("hidden");
    confirmCallback = null;
}

document.getElementById("confirmActionBtn").addEventListener("click", function() {
    if (confirmCallback) confirmCallback();
    closeConfirm();
});

function dismissErrorBanner() {
    document.getElementById("firebaseErrorBanner").classList.add("hidden");
}

/* =========================================================
   FIREBASE CONFIG
========================================================= */
const firebaseConfig = {
    apiKey: "AIzaSyBmvehentAfiAK1pECzIHLTvqNELrVurBY",
    authDomain: "activevpn-premium.firebaseapp.com",
    databaseURL: "https://activevpn-premium-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "activevpn-premium",
    storageBucket: "activevpn-premium.firebasestorage.app",
    messagingSenderId: "847165419862",
    appId: "1:847165419862:web:7c74d6d4a4b66f83d066f7"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let currentDataArray = [];
let currentTab = "all";
let currentSlipText = "";
let currentSlipUserObj = null;

function setDefaultDates() {
    const d = new Date();
    const value =
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const input = document.getElementById("startDate");
    if (input && !input.value) input.value = value;
}
setDefaultDates();

/* =========================================================
   REALTIME LISTENER
========================================================= */
db.ref("premium_users").on("value",
    function(snapshot) {
        document.getElementById("firebaseErrorBanner").classList.add("hidden");
        const statusBadge = document.getElementById("dbStatusBadge");
        if (statusBadge) statusBadge.classList.remove("hidden");

        let data = snapshot.val();
        if (data && typeof data === "object" && !Array.isArray(data)) {
            data = Object.values(data);
        }

        if (data && Array.isArray(data) && data.length) {
            currentDataArray = data.filter(u => u && u["Name"] && u["Name"] !== "empty");
        } else {
            currentDataArray = [];
        }
        renderUsersGrid();
        refreshCharts();
    },
    function(error) {
        console.error("Firebase Database Error:", error);
        document.getElementById("firebaseErrorBanner").classList.remove("hidden");
        const statusBadge = document.getElementById("dbStatusBadge");
        if (statusBadge) {
            statusBadge.className =
                "hidden sm:inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-[11px] font-bold py-1 px-2.5 rounded-full";
            statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> DB Error';
            statusBadge.classList.remove("hidden");
        }

        const grid = document.getElementById("usersGrid");
        grid.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 text-center p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <i class="fa-solid fa-lock text-4xl text-red-500 mb-3"></i>
                    <h3 class="font-bold text-slate-900 dark:text-white text-base">Firebase Database ခွင့်ပြုချက် လိုအပ်နေပါသည်</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">Firebase Console > Realtime Database > Rules တွင် <b>read / write: true</b> ဟု ပြင်ဆင်ပေးပါရန်။</p>
                    <p class="text-[11px] font-mono text-red-400 mt-2 bg-red-950/30 px-3 py-1.5 rounded-lg">${error.message}</p>
                </div>`;
    }
);

function switchTab(tab) {
    currentTab = tab;
    const tabs = ['all', 'online', 'warning', 'offline'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`);
        if (btn) {
            if (t === tab) {
                btn.className =
                    "py-2 px-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow";
            } else {
                let colorClass = "text-slate-600 dark:text-slate-400";
                if (t === 'online') colorClass = "text-emerald-600 dark:text-emerald-400";
                if (t === 'warning') colorClass = "text-amber-600 dark:text-amber-400";
                if (t === 'offline') colorClass = "text-red-600 dark:text-red-400";
                btn.className = `py-2 px-2.5 rounded-xl text-xs font-bold ${colorClass}`;
            }
        }
    });
    renderUsersGrid();
}

/* =========================================================
   RENDER USERS CARDS
========================================================= */
function renderUsersGrid() {
    const grid = document.getElementById("usersGrid");
    grid.innerHTML = "";

    let countOnline = 0;
    let countWarning = 0;
    let countOffline = 0;

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayAccountsCount = 0;
    const todayFormatted = getTodayFormatted();

    currentDataArray.forEach(u => {
        const s = getValidDaysAndStatus(u["Expiration"]);
        if (s.statusType === "online") countOnline++;
        else if (s.statusType === "warning") countWarning++;
        else countOffline++;

        const priceNum = parsePriceValue(u["Price"] || u["price"]);
        totalRevenue += priceNum;

        const userStartDate = u["StartDate"] || u["startDate"];
        if (userStartDate === todayFormatted) {
            todayRevenue += priceNum;
            todayAccountsCount++;
        }
    });

    document.getElementById("statTotalRevenue").innerText = `${totalRevenue.toLocaleString()} ฿`;
    document.getElementById("statTodayRevenue").innerText = `${todayRevenue.toLocaleString()} ฿`;
    document.getElementById("statTodayAccounts").innerText = `${todayAccountsCount.toLocaleString()}`;

    document.getElementById("totalUsersCountNav").innerText = `Total: ${currentDataArray.length}`;
    document.getElementById("countAllBadge").innerText = currentDataArray.length;
    document.getElementById("countOnlineBadge").innerText = countOnline;
    document.getElementById("countWarningBadge").innerText = countWarning;
    document.getElementById("countOfflineBadge").innerText = countOffline;

    let users = currentDataArray.filter(u => {
        const s = getValidDaysAndStatus(u["Expiration"]);
        if (currentTab === "online") return s.statusType === "online";
        if (currentTab === "warning") return s.statusType === "warning";
        if (currentTab === "offline") return s.statusType === "offline";
        return true;
    });

    if (!users.length) {
        grid.innerHTML = `
                    <div class="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
                        <i class="fa-solid fa-folder-open text-5xl mb-4"></i>
                        <p>အသုံးပြုသူ မရှိသေးပါ</p>
                    </div>`;
        return;
    }

    users.forEach(user => {
        const name = user["Name"] || "-";
        const key = user["Key"] || "-";
        const rawPrice = user["Price"] || user["price"] || "-";
        const priceDisplay = formatPriceWithSymbol(rawPrice);
        const expire = user["Expiration"] || "-";
        const status = getValidDaysAndStatus(expire);

        let badgeBg = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        let pulseColor = "bg-emerald-400";
        let dotColor = "bg-emerald-500";
        let statusText = "Online";

        if (status.statusType === "warning") {
            badgeBg = "bg-amber-500/10 text-amber-500 border-amber-500/20";
            pulseColor = "bg-amber-400";
            dotColor = "bg-amber-500";
            statusText = "Expiring Soon";
        } else if (status.statusType === "offline") {
            badgeBg = "bg-red-500/10 text-red-500 border-red-500/20";
            pulseColor = "bg-red-400";
            dotColor = "bg-red-500";
            statusText = "Offline";
        }

        const initial = getAvatarInitial(name);
        const avatarColor = getAvatarGradient(name);

        const card = document.createElement("div");
        card.className =
            "bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md border border-slate-200 dark:border-slate-700/80 user-card transition duration-200 hover:shadow-lg";
        card.setAttribute("data-search", `${name} ${key}`.toLowerCase());

        card.innerHTML = `
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarColor} shadow-md border border-white/20">
                                <span class="absolute inline-flex h-full w-full rounded-2xl ${pulseColor} opacity-20 pulse-radar"></span>
                                <span class="absolute inline-flex h-2.5 w-2.5 rounded-full ${dotColor} -top-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-800 shadow-sm"></span>
                                <span class="font-extrabold text-base tracking-wider uppercase">${initial}</span>
                            </div>

                            <div>
                                <h3 class="font-extrabold text-slate-900 dark:text-white text-base leading-tight">${name}</h3>
                                <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeBg} mt-1">
                                    <span class="relative flex h-2 w-2">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-2 w-2 ${dotColor}"></span>
                                    </span>
                                    <span>${statusText}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-1.5 flex-wrap justify-end">
                            <!-- +30 Days Renew Button -->
                            <button onclick="quickRenew('${key}')" class="p-2 bg-amber-500/10 hover:bg-amber-500/25 rounded-xl text-amber-600 dark:text-amber-400 transition renew-btn-pulse" title="+30 Days သက်တမ်းတိုးရန်">
                                <i class="fa-solid fa-clock-rotate-left"></i>
                            </button>
                            <button onclick="openEditModal('${key}')" class="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition" title="ပြင်ဆင်ရန်">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="openSlipModal('${key}')" class="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition" title="Slip ထုတ်ရန်">
                                <i class="fa-solid fa-ticket"></i>
                            </button>
                            <button onclick="openReminderModal('${key}')" class="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition" title="သတိပေးစာ ထုတ်ရန်">
                                <i class="fa-solid fa-bell"></i>
                            </button>
                            <button onclick="deleteDevice('${key}')" class="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition" title="ဖျက်ရန်">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl mb-3 text-xs border border-slate-100 dark:border-slate-800">
                        <div>
                            <span class="text-slate-400 block font-medium">Device ID</span>
                            <div class="font-mono text-xs text-blue-500 break-all font-semibold">${key}</div>
                        </div>
                        <div class="text-right">
                            <span class="text-slate-400 block font-medium">စျေးနှုန်း</span>
                            <div class="font-bold text-emerald-500 dark:text-emerald-400 text-sm">${priceDisplay}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center text-xs">
                        <div>
                            <span class="text-slate-400 block font-medium">Expired Date</span>
                            <b class="text-slate-700 dark:text-slate-200">${expire}</b>
                        </div>
                        <div class="text-right">
                            <span class="${status.statusType === 'online' ? 'text-emerald-500' : status.statusType === 'warning' ? 'text-amber-500' : 'text-red-500'} font-bold">
                                ${status.label}
                            </span>
                        </div>
                    </div>`;

        grid.appendChild(card);
    });
}

/* =========================================================
   QUICK RENEW (+30 DAYS)
========================================================= */
function quickRenew(key) {
    const user = currentDataArray.find(u => u && u["Key"] === key);
    if (!user) {
        showAlert("မတွေ့ပါ", "အသုံးပြုသူကို ရှာမတွေ့ပါ။", "error");
        return;
    }

    const currentExp = user["Expiration"] || user["expireDate"];
    if (!currentExp || currentExp === "—") {
        showAlert("မရှိပါ", "သက်တမ်းကုန်ရက်စွဲ မရှိပါ။ ကျေးဇူးပြု၍ ပြင်ဆင်ပါ။", "error");
        return;
    }

    let dateObj;
    if (currentExp.includes("/")) {
        const p = currentExp.split("/");
        dateObj = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    } else {
        dateObj = new Date(currentExp);
    }

    if (isNaN(dateObj.getTime())) {
        showAlert("မမှန်ပါ", "သက်တမ်းကုန်ရက်စွဲ ပုံစံမှားနေပါသည်။", "error");
        return;
    }

    // Add 30 days
    dateObj.setDate(dateObj.getDate() + 30);
    const newExp =
        `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;

    // Update the user object
    user["Expiration"] = newExp;
    user["Valid"] = getValidDaysAndStatus(newExp).days;

    const index = currentDataArray.findIndex(u => u && u["Key"] === key);
    if (index >= 0) {
        currentDataArray[index] = user;
        db.ref("premium_users").set(currentDataArray)
            .then(() => {
                showAlert("သက်တမ်းတိုးပြီးပါပြီ",
                    `${user["Name"] || "User"} အတွက် +30 Days ထပ်တိုးပေးပြီးပါပြီ။ သက်တမ်းကုန်ရက်: ${newExp}`
                );
            })
            .catch(err => {
                showAlert("အမှားဖြစ်နေပါသည်", err.message, "error");
            });
    }
}

/* =========================================================
   SEARCH FILTER
========================================================= */
function filterUsers() {
    const q = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll(".user-card").forEach(card => {
        card.style.display = card.getAttribute("data-search").includes(q) ? "block" : "none";
    });
}

/* =========================================================
   ADD USER SUBMIT
========================================================= */
document.getElementById("addUserForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const btn = document.getElementById("addUserSubmitBtn");
    const originalText = document.getElementById("submitBtnText").innerText;
    btn.disabled = true;
    document.getElementById("submitBtnText").innerText = "သိမ်းနေသည်...";

    const name = document.getElementById("userName").value.trim();
    const key = document.getElementById("deviceId").value.trim();
    const priceInput = document.getElementById("userPrice").value.trim();
    const formattedPrice = formatPriceWithSymbol(priceInput);
    const start = document.getElementById("startDate").value;
    const expire = document.getElementById("expireDate").value;

    const user = {
        Name: name,
        Key: key,
        Price: formattedPrice,
        StartDate: formatDateForDisplay(start),
        Expiration: formatDateForDisplay(expire),
        Valid: getValidDaysAndStatus(expire).days
    };

    const index = currentDataArray.findIndex(u => u && u["Key"] === key);
    if (index >= 0) {
        currentDataArray.splice(index, 1);
    }
    currentDataArray.unshift(user);

    db.ref("premium_users").set(currentDataArray)
        .then(() => {
            btn.disabled = false;
            document.getElementById("submitBtnText").innerText = originalText;
            showAlert("အောင်မြင်ပါသည်", `${name} ကို Premium စာရင်းသို့ ထည့်ပြီးပါပြီ။`);
            document.getElementById("addUserForm").reset();
            setDefaultDates();
        })
        .catch(err => {
            btn.disabled = false;
            document.getElementById("submitBtnText").innerText = originalText;
            console.error("Save Error:", err);
            showAlert("သိမ်းဆည်းမရပါ", `Firebase Error: ${err.message}`, "error");
        });
});

/* =========================================================
   EDIT USER MODAL
========================================================= */
function openEditModal(key) {
    const user = currentDataArray.find(u => u && u["Key"] === key);
    if (!user) return;

    document.getElementById("editOriginalKey").value = key;
    document.getElementById("editUserName").value = user["Name"] || "";
    document.getElementById("editDeviceId").value = user["Key"] || "";
    document.getElementById("editPrice").value = user["Price"] || user["price"] || "";
    document.getElementById("editStartDate").value = parseFormattedDateToInput(user["StartDate"] || getTodayFormatted());
    document.getElementById("editExpireDate").value = parseFormattedDateToInput(user["Expiration"]);

    document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
    document.getElementById("editModal").classList.add("hidden");
}

document.getElementById("editUserForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const original = document.getElementById("editOriginalKey").value;
    const priceInput = document.getElementById("editPrice").value.trim();

    const user = {
        Name: document.getElementById("editUserName").value.trim(),
        Key: document.getElementById("editDeviceId").value.trim(),
        Price: formatPriceWithSymbol(priceInput),
        StartDate: formatDateForDisplay(document.getElementById("editStartDate").value),
        Expiration: formatDateForDisplay(document.getElementById("editExpireDate").value)
    };

    user.Valid = getValidDaysAndStatus(user.Expiration).days;

    const index = currentDataArray.findIndex(u => u && u["Key"] === original);
    if (index >= 0) {
        currentDataArray[index] = user;
        db.ref("premium_users").set(currentDataArray)
            .then(() => {
                closeEditModal();
                showAlert("ပြင်ဆင်ပြီးပါပြီ", "အကောင့်အချက်အလက်များကို သိမ်းဆည်းပြီးပါပြီ။");
            })
            .catch(err => {
                showAlert("ပြင်ဆင်မရပါ", err.message, "error");
            });
    }
});

/* =========================================================
   RECEIPT SLIP MODAL
========================================================= */
function openSlipModal(key) {
    const user = currentDataArray.find(u => u && u["Key"] === key);
    if (!user) return;

    currentSlipUserObj = user;

    const name = user["Name"] || "—";
    const device = user["Key"] || "—";
    const rawPrice = user["Price"] || user["price"] || "—";
    const priceDisplay = formatPriceWithSymbol(rawPrice);
    const start = (user["StartDate"] && user["StartDate"] !== "—") ? user["StartDate"] : (user["startDate"] ||
        getTodayFormatted());
    const expire = user["Expiration"] || user["expireDate"] || "—";

    document.getElementById("slipName").innerText = name;
    document.getElementById("slipKey").innerText = device;
    document.getElementById("slipPrice").innerText = priceDisplay;
    document.getElementById("slipStart").innerText = start;
    document.getElementById("slipExp").innerText = expire;

    currentSlipText =
        `ACTIVE VPN VIP

            အမည် : ${name}
            Device ID : ${device}
            စျေးနှုန်း : ${priceDisplay}
            စတင်သည့်ရက် : ${start}
            သက်တမ်းကုန်ရက် : ${expire}

            PAYMENT
            KRUNGTHAI BANK
            6661912324
            MR JUE HTET KHAING

            ငွေလွှဲပြီးတိုင်းစလစ်ပို့ပေးပါ
            THANK YOU FOR USING ACTIVE VPN`;

    const encoded = encodeURIComponent(currentSlipText);
    document.getElementById("tgShareBtn").href = `https://t.me/share/url?url=&text=${encoded}`;
    document.getElementById("waShareBtn").href = `https://api.whatsapp.com/send?text=${encoded}`;

    setSlipTheme('dark');

    document.getElementById("slipModal").classList.remove("hidden");
    preloadReceiptImages();
}

function closeSlipModal() {
    document.getElementById("slipModal").classList.add("hidden");
}

/* =========================================================
   RECEIPT CAPTURE
========================================================= */
function waitForImage(img) {
    return new Promise(resolve => {
        if (!img) { resolve(); return; }
        if (img.complete) { resolve(); return; }
        img.onload = () => resolve();
        img.onerror = () => resolve();
    });
}

async function preloadReceiptImages() {
    await Promise.all([
        waitForImage(document.getElementById("bankLogoImage")),
        waitForImage(document.getElementById("paymentQrImage")),
        waitForImage(document.querySelector("#receiptCardToCapture .receipt-logo"))
    ]);
}

async function downloadSlipImage() {
    const card = document.getElementById("receiptCardToCapture");
    const btn = document.getElementById("downloadBtnText");
    btn.innerText = "ပုံထုတ်နေသည်...";

    try {
        if (document.fonts) {
            await document.fonts.ready;
        }
        await preloadReceiptImages();
        await new Promise(r => setTimeout(r, 200));

        const bg = currentSlipTheme === 'light' ? '#ffffff' : '#020617';

        const dataUrl = await htmlToImage.toPng(card, {
            quality: 1.0,
            pixelRatio: 3,
            backgroundColor: bg,
            cacheBust: true,
            style: {
                margin: "0",
                transform: "none"
            }
        });

        const link = document.createElement("a");
        const name = currentSlipUserObj ? (currentSlipUserObj["Name"] || "User") : "User";
        link.download = `ACTIVE_VPN_${name}_${currentSlipTheme.toUpperCase()}_Receipt.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        btn.innerText = "ပုံအဖြစ် ဖုန်းထဲသိမ်းမည် (4K PNG)";
        showAlert("အောင်မြင်ပါသည်", `Receipt (${currentSlipTheme.toUpperCase()}) ပုံကို 4K PNG အဖြစ် သိမ်းပြီးပါပြီ။`);
    } catch (error) {
        console.error("Image generation error:", error);
        btn.innerText = "ပုံအဖြစ် ဖုန်းထဲသိမ်းမည် (4K PNG)";
        showAlert("အမှားဖြစ်နေပါသည်", "Receipt ပုံထုတ်ရာတွင် အမှားဖြစ်နေပါသည်။", "error");
    }
}

/* =========================================================
   COPY & DELETE
========================================================= */
function copySlipText() {
    const ta = document.getElementById("hiddenCopyText");
    ta.value = currentSlipText;
    ta.select();
    document.execCommand("copy");
    showAlert("Copy ကူးပြီးပါပြီ", "Receipt စာသားကို Copy ကူးပြီးပါပြီ။");
}

function deleteDevice(key) {
    showConfirm("ဖျက်ရန် သေချာပါသလား?", `Device ID: ${key} ကို ဖျက်မည်မှာ သေချာပါသလား?`, function() {
        const index = currentDataArray.findIndex(u => u && u["Key"] === key);
        if (index < 0) return;

        currentDataArray.splice(index, 1);
        db.ref("premium_users").set(currentDataArray)
            .then(() => {
                showAlert("ဖျက်ပြီးပါပြီ", "User ကို စာရင်းမှ ဖယ်ရှားပြီးပါပြီ။");
            })
            .catch(err => {
                showAlert("ဖျက်မရပါ", err.message, "error");
            });
    });
}

/* =========================================================
   PWA INSTALLATION — FIXED VERSION
========================================================= */
let deferredPrompt = null;
const pwaBtn = document.getElementById("pwaInstallBtn");

// Listen for the beforeinstallprompt event
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("✅ PWA beforeinstallprompt fired");
    // Show the button with a special indicator
    if (pwaBtn) {
        pwaBtn.classList.remove("hidden");
        pwaBtn.style.display = "inline-flex";
        pwaBtn.innerHTML =
            '<i class="fa-solid fa-download"></i><span class="hidden sm:inline">Install App</span><span class="sm:hidden">Install</span>';
        pwaBtn.className =
            "inline-flex items-center gap-1.5 pwa-install-btn text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-lg transition";
    }
});

// Also listen for appinstalled event
window.addEventListener("appinstalled", () => {
    console.log("✅ PWA installed successfully");
    if (pwaBtn) {
        pwaBtn.style.display = "none";
    }
    deferredPrompt = null;
    showAlert("အောင်မြင်ပါသည်", "ACTIVE VPN Admin App ကို အောင်မြင်စွာ Install ပြုလုပ်ပြီးပါပြီ။");
});

// Main install function
function installPWA() {
    console.log("🔧 installPWA() called, deferredPrompt:", deferredPrompt);

    if (deferredPrompt) {
        // Use the native prompt
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            console.log("User choice:", choiceResult.outcome);
            if (choiceResult.outcome === "accepted") {
                console.log("✅ User accepted the install");
                if (pwaBtn) pwaBtn.style.display = "none";
            } else {
                console.log("❌ User dismissed the install");
            }
            deferredPrompt = null;
        }).catch(err => {
            console.warn("User choice error:", err);
            deferredPrompt = null;
            // Fallback: show instructions
            showPwaFallbackInstructions();
        });
    } else {
        // No beforeinstallprompt event → show fallback instructions
        console.warn("⚠️ No deferredPrompt available — showing fallback instructions");
        showPwaFallbackInstructions();
    }
}

// Show fallback instructions modal
function showPwaFallbackInstructions() {
    document.getElementById("pwaFallbackModal").classList.remove("hidden");
}

function closePwaFallback() {
    document.getElementById("pwaFallbackModal").classList.add("hidden");
}

// Service Worker registration with better error handling
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then((reg) => {
                console.log("✅ Service Worker registered successfully:", reg);
            })
            .catch((err) => {
                console.warn("⚠️ Service Worker registration failed:", err);
                // Not critical — PWA can still work with manifest
            });
    });
}

// Check if the app is already installed (standalone mode)
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log("📱 App is running in standalone mode (already installed)");
    if (pwaBtn) pwaBtn.style.display = "none";
}

// Also listen for display-mode changes
window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
    if (evt.matches) {
        console.log("📱 App switched to standalone mode");
        if (pwaBtn) pwaBtn.style.display = "none";
    } else {
        console.log("🌐 App switched to browser mode");
        // Show button again if not installed
        if (pwaBtn && !deferredPrompt) {
            pwaBtn.style.display = "inline-flex";
        }
    }
});


/* =========================================================
   ===== NEW FEATURES IMPLEMENTATION =====
========================================================= */

/* ---------------------------------------------------------
   FEATURE 2: CHARTS (Revenue & User Status)
   -> 100% Real data from currentDataArray (Firebase)
--------------------------------------------------------- */
let revenueChartInstance = null;
let userStatusChartInstance = null;

function refreshCharts() {
    buildRevenueChart();
    buildUserStatusChart();
}

function buildRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    // Group by month from StartDate
    const monthMap = {};
    currentDataArray.forEach(u => {
        const start = u["StartDate"] || u["startDate"];
        if (start && start !== "—") {
            const monthKey = parseDateToMonthKey(start);
            if (monthKey) {
                const price = parsePriceValue(u["Price"] || u["price"]);
                if (!monthMap[monthKey]) monthMap[monthKey] = 0;
                monthMap[monthKey] += price;
            }
        }
    });

    const sortedMonths = Object.keys(monthMap).sort();
    const labels = sortedMonths.map(m => {
        const parts = m.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(parts[1])-1]} ${parts[0]}`;
    });
    const data = sortedMonths.map(m => monthMap[m]);

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(51,65,85,0.4)' : 'rgba(203,213,225,0.5)';

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                label: 'ဝင်ငွေ (ဘတ်)',
                data: data.length ? data : [0],
                backgroundColor: isDark ? 'rgba(52,211,153,0.6)' : 'rgba(16,185,129,0.7)',
                borderColor: isDark ? '#34d399' : '#059669',
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor, font: { size: 10, weight: 'bold' } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor, font: { size: 9 } },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor, font: { size: 9 }, maxRotation: 30, minRotation: 0 },
                    grid: { display: false }
                }
            }
        }
    });
}

function buildUserStatusChart() {
    const ctx = document.getElementById('userStatusChart').getContext('2d');

    let online = 0,
        warning = 0,
        offline = 0;
    currentDataArray.forEach(u => {
        const s = getValidDaysAndStatus(u["Expiration"]);
        if (s.statusType === "online") online++;
        else if (s.statusType === "warning") warning++;
        else offline++;
    });

    const total = online + warning + offline || 1;
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#475569';

    if (userStatusChartInstance) {
        userStatusChartInstance.destroy();
    }

    userStatusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Online', 'Expiring Soon', 'Offline'],
            datasets: [{
                data: [online, warning, offline],
                backgroundColor: [
                    isDark ? 'rgba(52,211,153,0.8)' : 'rgba(16,185,129,0.8)',
                    isDark ? 'rgba(251,191,36,0.8)' : 'rgba(245,158,11,0.8)',
                    isDark ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.8)'
                ],
                borderColor: isDark ? '#1e293b' : '#ffffff',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: { size: 9, weight: 'bold' },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '60%',
        }
    });
}

// Auto-refresh charts when theme changes
const origToggleDark = toggleDarkMode;
toggleDarkMode = function() {
    origToggleDark();
    setTimeout(refreshCharts, 200);
};


/* ---------------------------------------------------------
   FEATURE 3: EXCEL / CSV EXPORT & IMPORT
--------------------------------------------------------- */
function exportToExcel() {
    if (!currentDataArray.length) {
        showAlert("ဒေတာမရှိပါ", "Export လုပ်ရန် အသုံးပြုသူ မရှိပါ။", "error");
        return;
    }

    try {
        const data = currentDataArray.map(u => ({
            'Name': u["Name"] || "-",
            'Device ID': u["Key"] || "-",
            'Price': u["Price"] || u["price"] || "-",
            'Start Date': u["StartDate"] || u["startDate"] || "-",
            'Expiration Date': u["Expiration"] || u["expireDate"] || "-",
            'Status': getValidDaysAndStatus(u["Expiration"]).label
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Premium Users");
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ACTIVE_VPN_Users_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showAlert("Export အောင်မြင်ပါသည်", `အသုံးပြုသူ ${data.length} ဦး၏ data ကို Excel ဖိုင်အဖြစ် သိမ်းပြီးပါပြီ။`);
    } catch (err) {
        console.error(err);
        showAlert("Export မရပါ", err.message, "error");
    }
}

function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            if (!jsonData || !jsonData.length) {
                showAlert("ဒေတာမရှိပါ", "ဖိုင်ထဲတွင် အချက်အလက် မရှိပါ။", "error");
                return;
            }

            // Map columns
            const imported = jsonData.map(row => {
                const name = row['Name'] || row['name'] || row['အမည်'] || '-';
                const key = row['Device ID'] || row['DeviceId'] || row['deviceId'] || row['Key'] || row[
                    'key'] ||
                    '-';
                const price = row['Price'] || row['price'] || row['စျေးနှုန်း'] || '-';
                const start = row['Start Date'] || row['StartDate'] || row['startDate'] || row[
                    'စတင်သည့်ရက်'] ||
                    getTodayFormatted();
                const exp = row['Expiration Date'] || row['Expiration'] || row['expireDate'] || row[
                    'သက်တမ်းကုန်ရက်'] || '-';

                return {
                    Name: name,
                    Key: key,
                    Price: formatPriceWithSymbol(price),
                    StartDate: start,
                    Expiration: exp,
                    Valid: getValidDaysAndStatus(exp).days
                };
            });

            // Merge: replace existing if Key matches, else add
            let added = 0,
                updated = 0;
            imported.forEach(newUser => {
                if (newUser.Key === '-' || !newUser.Key) return;
                const idx = currentDataArray.findIndex(u => u && u["Key"] === newUser.Key);
                if (idx >= 0) {
                    currentDataArray[idx] = newUser;
                    updated++;
                } else {
                    currentDataArray.push(newUser);
                    added++;
                }
            });

            db.ref("premium_users").set(currentDataArray)
                .then(() => {
                    showAlert("Import အောင်မြင်ပါသည်",
                        `အသစ်ထည့် ${added} ဦး၊ ပြင်ဆင် ${updated} ဦး။ စုစုပေါင်း ${imported.length} ဦး။`);
                })
                .catch(err => {
                    showAlert("Import မရပါ", err.message, "error");
                });

        } catch (err) {
            console.error(err);
            showAlert("ဖိုင်ဖတ်မရပါ", "Excel ဖိုင်ပုံစံ မှားနေပါသည်။ " + err.message, "error");
        }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
}


/* ---------------------------------------------------------
   FEATURE 4: QR / BARCODE SCANNER (html5-qrcode)
--------------------------------------------------------- */
let qrScannerContext = 'add'; // 'add' or 'edit'
let html5QrCode = null;
let isScannerRunning = false;

function openQrScanner(context = 'add') {
    qrScannerContext = context;
    const modal = document.getElementById('qrScannerModal');
    modal.classList.remove('hidden');

    const loading = document.getElementById('qrScannerLoading');
    loading.classList.remove('hidden');

    // Start scanner after a small delay
    setTimeout(() => {
        startQrScanner();
    }, 400);
}

function closeQrScanner() {
    stopQrScanner();
    document.getElementById('qrScannerModal').classList.add('hidden');
}

function startQrScanner() {
    if (isScannerRunning) return;
    try {
        const readerElement = document.getElementById('reader');
        readerElement.innerHTML = '';

        html5QrCode = new Html5Qrcode("reader");

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
        };

        html5QrCode.start({ facingMode: "environment" },
            config,
            onScanSuccess,
            onScanError
        ).then(() => {
            isScannerRunning = true;
            document.getElementById('qrScannerLoading').classList.add('hidden');
        }).catch(err => {
            console.warn("Camera start error:", err);
            document.getElementById('qrScannerLoading').classList.add('hidden');
            showAlert("Camera မရပါ",
                "ကင်မရာကို ဖွင့်၍ မရပါ။ ကင်မရာခွင့်ပြုချက် ပေးထားပြီး ဖုန်းတွင် ကင်မရာရှိမရှိ စစ်ဆေးပါ။",
                "error"
            );
        });

    } catch (err) {
        console.error("QR Scanner init error:", err);
        document.getElementById('qrScannerLoading').classList.add('hidden');
        showAlert("Scanner မရပါ", err.message, "error");
    }
}

function stopQrScanner() {
    if (html5QrCode && isScannerRunning) {
        try {
            html5QrCode.stop().then(() => {
                isScannerRunning = false;
            }).catch(() => {});
        } catch (e) {}
    }
    isScannerRunning = false;
}

function restartQrScanner() {
    stopQrScanner();
    setTimeout(() => {
        const loading = document.getElementById('qrScannerLoading');
        loading.classList.remove('hidden');
        startQrScanner();
    }, 300);
}

function onScanSuccess(decodedText, decodedResult) {
    // Stop scanner
    stopQrScanner();

    // Fill the Device ID field
    const deviceId = decodedText.trim();
    if (qrScannerContext === 'add') {
        document.getElementById('deviceId').value = deviceId;
    } else if (qrScannerContext === 'edit') {
        document.getElementById('editDeviceId').value = deviceId;
    }

    closeQrScanner();
    showAlert("Scan အောင်မြင်ပါသည်", `Device ID: ${deviceId} ကို ဖြည့်သွင်းပြီးပါပြီ။`);
}

function onScanError(err) {
    // Ignore - continuous scanning
}


/* ---------------------------------------------------------
   FEATURE 5: REMINDER GENERATOR (with Device ID included)
   FIXED: Added Device ID to the reminder message
--------------------------------------------------------- */
let currentReminderUserKey = null;
let currentReminderMessage = '';

function openReminderModal(key) {
    const user = currentDataArray.find(u => u && u["Key"] === key);
    if (!user) {
        showAlert("မတွေ့ပါ", "အသုံးပြုသူကို ရှာမတွေ့ပါ။", "error");
        return;
    }

    currentReminderUserKey = key;
    const name = user["Name"] || "User";
    const deviceId = user["Key"] || "ID မရှိပါ";
    const expire = user["Expiration"] || user["expireDate"] || "ရက်စွဲမရှိပါ";

    // =========================================================
    // FIX: Added Device ID (deviceId) to the reminder message
    // =========================================================
    currentReminderMessage =
        `မင်္ဂလာပါဗျာ ACTIVE VPN အသုံးပြုသူ ${name} (Device ID: ${deviceId}) ဗျ။\n` +
        `သင့်အကောင့်သည် ${expire} တွင် သက်တမ်းကုန်ဆုံးမည်ဖြစ်၍\n` +
        `ဆက်လက်အသုံးပြုလိုပါက သက်တမ်းတိုးနိုင်ပါပြီဗျ။\n\n` +
        `ကျေးဇူးပြု၍ အောက်ပါအကောင့်သို့ ငွေလွှဲပေးပါရန်-\n` +
        `🏦 KRUNGTHAI BANK\n` +
        `💳 6661912324\n` +
        `👤 MR JUE HTET KHAING\n\n` +
        `ငွေလွှဲပြီးတိုင်း စလစ်ပို့ပေးပါရန်။\n\n` +
        `ACTIVE VPN Team`;

    document.getElementById('reminderMessage').innerText = currentReminderMessage;

    // Telegram share link
    const encoded = encodeURIComponent(currentReminderMessage);
    document.getElementById('reminderTgShare').href = `https://t.me/share/url?url=&text=${encoded}`;

    document.getElementById('reminderModal').classList.remove('hidden');
}

function closeReminderModal() {
    document.getElementById('reminderModal').classList.add('hidden');
    currentReminderUserKey = null;
}

function copyReminderText() {
    const text = document.getElementById('reminderMessage').innerText;
    const ta = document.getElementById('hiddenCopyText');
    ta.value = text;
    ta.select();
    document.execCommand('copy');
    showAlert("Copy ကူးပြီးပါပြီ", "သတိပေးစာကို Copy ကူးပြီးပါပြီ။");
}

// Share via Messenger using Web Share API
function shareReminderViaMessenger() {
    if (!currentReminderMessage) {
        showAlert("စာမရှိပါ", "သတိပေးစာ မရှိသေးပါ။ ကျေးဇူးပြု၍ ထပ်ကြိုးစားပါ။", "error");
        return;
    }

    if (navigator.share) {
        navigator.share({
            text: currentReminderMessage,
        }).then(() => {
            console.log('Shared successfully');
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                // Fallback: copy to clipboard
                copyReminderTextFallback();
            }
        });
    } else {
        // Fallback for desktop or unsupported browsers
        copyReminderTextFallback();
    }
}

function copyReminderTextFallback() {
    const ta = document.getElementById('hiddenCopyText');
    ta.value = currentReminderMessage;
    ta.select();
    document.execCommand('copy');
    showAlert("Copy ကူးပြီးပါပြီ",
        "သင့်ဘရောက်ဆာသည် မျှဝေခြင်းကို မထောက်ပံ့ပါ။ သတိပေးစာကို ကလစ်ဘုတ်သို့ ကူးယူပြီး Messenger တွင် ကိုယ်တိုင်ကူးထည့်ပါ။"
    );
}


/* =========================================================
   INITIALIZATION
========================================================= */

// Initial charts load after first data render
let chartsInitialized = false;
const origRender = renderUsersGrid;
renderUsersGrid = function() {
    origRender();
    if (!chartsInitialized && currentDataArray.length) {
        setTimeout(() => {
            refreshCharts();
            chartsInitialized = true;
        }, 300);
    }
};

// Also refresh charts on window resize
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (revenueChartInstance || userStatusChartInstance) {
            refreshCharts();
        }
    }, 500);
});

console.log('✅ ACTIVE VPN Admin Panel Pro loaded with all features (PWA fixed, Reminder now includes Device ID!)');
