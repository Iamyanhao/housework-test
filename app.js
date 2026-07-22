// ============================================================
// jiawu / Chore Couple — app.js
// ⚠️ Change ADMIN_KEY before deploying publicly. This is a
// client-side gate only — see README for the security caveat.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
  collection, query, where, orderBy, limit, onSnapshot, getDocs,
  serverTimestamp, increment, arrayUnion, arrayRemove, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ADMIN_KEY = "jiawu-admin-2026"; // TODO: change this before real use

const firebaseConfig = {
  apiKey: "AIzaSyBRxbCSE5S4-NTP42e6ex_KcsisZdhVQgQ",
  authDomain: "kajilog1.firebaseapp.com",
  projectId: "kajilog1",
  storageBucket: "kajilog1.firebasestorage.app",
  messagingSenderId: "1082515486355",
  appId: "1:1082515486355:web:9e8fe5606a0477e6febf66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ---------------------------------------------------------------
// i18n
// ---------------------------------------------------------------
const I18N = {
  zh: {
    app_name: "家务对", app_tagline: "两个人，一份账",
    signin_google: "用 Google 账户登录",
    or_divider: "或者", email_ph: "邮箱", password_ph: "密码（至少6位）",
    email_login: "邮箱登录", email_signup: "没有账户？邮箱注册", email_pass_required: "请输入邮箱和密码",
    join_group: "加入小组", create_group: "创建小组",
    enter_passcode_hint: "输入 5 位数密码加入伴侣的小组", btn_join: "加入",
    create_hint: "创建小组，系统会生成 5 位密码，分享给你的伴侣", btn_create: "创建小组",
    enter_group_name: "给你们的小组起个名字（可留空）", default_group_name: "我们的家", rename_group: "修改小组名字",
    sign_out: "退出登录", admin_entry: "管理员入口",
    admin_login_title: "管理员登录", admin_key_hint: "输入管理员密钥", btn_enter: "进入",
    tab_dashboard: "看板", tab_stats: "统计", tab_history: "记录", tab_settings: "我",
    this_week_score: "本周积分", you: "你", tap_to_log: "点击记录家务", custom_chore: "+ 自定义",
    monthly_trends: "月度趋势", recent_logs: "最近记录",
    col_date: "日期", col_member: "成员", col_task: "家务", col_pts: "分数",
    filter_all: "全部", filter_me: "只看我的", filter_partner: "只看伴侣",
    manage_tasks: "管理家务", change_passcode: "修改密码", current_passcode: "当前密码", exit_group: "退出小组",
    admin_console: "管理控制台（仅管理员）",
    total_groups: "总组数", total_users: "总用户数", total_records: "总记录数",
    view_all_groups: "查看所有小组", view_all_users: "查看所有用户", view_all_records: "查看所有记录",
    custom_chore_title: "新增自定义家务", custom_name_ph: "家务名称", custom_pts_ph: "分数",
    cancel: "取消", save: "保存",
    already_done_by: "已由 {name} 完成", i_did: "我做的",
    err_passcode: "密码错误或小组已满", err_admin_key: "管理员密钥错误",
    attempts_left: "次机会", join_locked_out: "错误次数过多，请等待 {mins} 分钟后再试",
    group_created: "小组创建成功，密码：", passcode_changed: "新密码：",
    err_group_name_taken: "这个小组名字已经被使用了，换一个吧",
    confirm_exit: "确定要退出小组吗？", confirm_dissolve: "确定要解散该小组吗？此操作不可撤销。",
    logged: "已记录", adjust_score: "调整积分", dissolve_group: "解散小组",
    name_label: "姓名", email_label: "邮箱", created_label: "注册时间",
    last_login_label: "最后登录", login_count_label: "登录次数",
    delete: "删除", saved: "已保存",
    edit: "编辑", edit_record_title: "编辑家务记录", confirm_delete_record: "确定要删除这条记录吗？对方看板上的锁定状态也会一起解除。"
  },
  ja: {
    app_name: "カジログ", app_tagline: "ふたりで、ひとつの家計簿",
    signin_google: "Googleでログイン",
    or_divider: "または", email_ph: "メールアドレス", password_ph: "パスワード（6文字以上）",
    email_login: "メールでログイン", email_signup: "アカウントがない場合はメールで登録", email_pass_required: "メールアドレスとパスワードを入力してください",
    join_group: "グループに参加", create_group: "グループ作成",
    enter_passcode_hint: "5桁のパスコードを入力してパートナーのグループに参加", btn_join: "参加",
    create_hint: "グループを作成すると5桁のパスコードが発行されます。パートナーに共有してください", btn_create: "グループ作成",
    enter_group_name: "グループの名前を入力（空欄可）", default_group_name: "わたしたちの家", rename_group: "グループ名を変更",
    sign_out: "ログアウト", admin_entry: "管理者入口",
    admin_login_title: "管理者ログイン", admin_key_hint: "管理者キーを入力", btn_enter: "入る",
    tab_dashboard: "ホーム", tab_stats: "統計", tab_history: "履歴", tab_settings: "設定",
    this_week_score: "今週のスコア", you: "あなた", tap_to_log: "タップして記録", custom_chore: "+ カスタム",
    monthly_trends: "月間推移", recent_logs: "最近の記録",
    col_date: "日付", col_member: "メンバー", col_task: "家事", col_pts: "点数",
    filter_all: "すべて", filter_me: "自分のみ", filter_partner: "パートナーのみ",
    manage_tasks: "家事を管理", change_passcode: "パスコード変更", current_passcode: "現在のパスコード", exit_group: "グループを退出",
    admin_console: "管理コンソール（管理者のみ）",
    total_groups: "総グループ数", total_users: "総ユーザー数", total_records: "総記録数",
    view_all_groups: "全グループを表示", view_all_users: "全ユーザーを表示", view_all_records: "全記録を表示",
    custom_chore_title: "カスタム家事を追加", custom_name_ph: "家事の名前", custom_pts_ph: "点数",
    cancel: "キャンセル", save: "保存",
    already_done_by: "{name} が完了済み", i_did: "自分が完了",
    err_passcode: "パスコードが違うか、グループが満員です", err_admin_key: "管理者キーが違います",
    attempts_left: "回試行可能", join_locked_out: "試行回数が多すぎます。{mins}分後にもう一度お試しください",
    group_created: "グループを作成しました。パスコード：", passcode_changed: "新しいパスコード：",
    err_group_name_taken: "そのグループ名はすでに使われています。別の名前にしてください",
    confirm_exit: "グループを退出しますか？", confirm_dissolve: "このグループを解散しますか？元に戻せません。",
    logged: "記録しました", adjust_score: "スコアを調整", dissolve_group: "グループを解散",
    name_label: "名前", email_label: "メール", created_label: "登録日",
    last_login_label: "最終ログイン", login_count_label: "ログイン回数",
    delete: "削除", saved: "保存しました",
    edit: "編集", edit_record_title: "記録を編集", confirm_delete_record: "この記録を削除しますか？相手の画面のロックも解除されます。"
  },
  en: {
    app_name: "Chore Couple", app_tagline: "Two people, one scoreboard",
    signin_google: "Sign in with Google",
    or_divider: "or", email_ph: "Email", password_ph: "Password (6+ characters)",
    email_login: "Sign in with email", email_signup: "No account? Sign up with email", email_pass_required: "Please enter email and password",
    join_group: "Join Group", create_group: "Create Group",
    enter_passcode_hint: "Enter the 5-digit passcode to join your partner's group", btn_join: "Join",
    create_hint: "Create a group and get a 5-digit passcode to share with your partner", btn_create: "Create Group",
    enter_group_name: "Name your group (optional)", default_group_name: "Our Home", rename_group: "Rename group",
    sign_out: "Sign out", admin_entry: "Admin entrance",
    admin_login_title: "Admin login", admin_key_hint: "Enter admin key", btn_enter: "Enter",
    tab_dashboard: "Dashboard", tab_stats: "Stats", tab_history: "History", tab_settings: "Me",
    this_week_score: "This week's score", you: "You", tap_to_log: "Tap to log chore", custom_chore: "+ Custom",
    monthly_trends: "Monthly trends", recent_logs: "Recent logs",
    col_date: "Date", col_member: "Member", col_task: "Task", col_pts: "Pts",
    filter_all: "All", filter_me: "Only me", filter_partner: "Only partner",
    manage_tasks: "Manage tasks", change_passcode: "Change passcode", current_passcode: "Current passcode", exit_group: "Exit group",
    admin_console: "Admin console (admin only)",
    total_groups: "Total groups", total_users: "Total users", total_records: "Total records",
    view_all_groups: "View all groups", view_all_users: "View all users", view_all_records: "View all records",
    custom_chore_title: "Add custom chore", custom_name_ph: "Chore name", custom_pts_ph: "Points",
    cancel: "Cancel", save: "Save",
    already_done_by: "Already done by {name}", i_did: "Done by me",
    err_passcode: "Wrong passcode or group is full", err_admin_key: "Wrong admin key",
    attempts_left: "attempts left", join_locked_out: "Too many attempts. Try again in {mins} min",
    group_created: "Group created. Passcode: ", passcode_changed: "New passcode: ",
    err_group_name_taken: "This group name is already taken. Please choose another.",
    confirm_exit: "Exit this group?", confirm_dissolve: "Dissolve this group? This can't be undone.",
    logged: "Logged", adjust_score: "Adjust score", dissolve_group: "Dissolve group",
    name_label: "Name", email_label: "Email", created_label: "Joined",
    last_login_label: "Last login", login_count_label: "Login count",
    delete: "Delete", saved: "Saved",
    edit: "Edit", edit_record_title: "Edit chore record", confirm_delete_record: "Delete this record? It will also unlock the chore tile on your partner's screen."
  }
};
let lang = localStorage.getItem("jiawu_lang") || "zh";

function t(key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) || key;
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
  return s;
}
function applyI18n() {
  document.body.className = "lang-" + lang;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
}
function setLang(l) {
  lang = l;
  localStorage.setItem("jiawu_lang", l);
  applyI18n();
  renderChoreGrid();
  renderStats();
  renderHistory();
}
document.querySelectorAll(".lang-btn").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}
function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}
function randomPasscode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

const DEFAULT_CHORES = [
  { id: "cook", points: 20, name: { zh: "做饭", ja: "夕食作り", en: "Cook Dinner" } },
  { id: "wash", points: 15, name: { zh: "洗碗", ja: "皿洗い", en: "Wash Dishes" } },
  { id: "vacuum", points: 10, name: { zh: "吸尘", ja: "掃除機", en: "Vacuum" } }
];

// ---------------------------------------------------------------
// State
// ---------------------------------------------------------------
let currentUser = null;
let userDoc = null;
let groupId = null;
let groupDoc = null;
let customChores = [];
let records = [];
let unsubGroup = null, unsubChores = null, unsubRecords = null;
let isAdmin = false;

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------
document.getElementById("btn-google")?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    showToast(e.message);
  }
});

document.getElementById("btn-email-login")?.addEventListener("click", async () => {
  const email = document.getElementById("email-input").value.trim();
  const pass = document.getElementById("password-input").value;
  if (!email || !pass) return showToast(t("email_pass_required"));
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    showToast(e.code + " — " + e.message);
  }
});

document.getElementById("btn-email-signup")?.addEventListener("click", async () => {
  const email = document.getElementById("email-input").value.trim();
  const pass = document.getElementById("password-input").value;
  if (!email || !pass) return showToast(t("email_pass_required"));
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    showToast(e.code + " — " + e.message);
  }
});
document.getElementById("btn-signout")?.addEventListener("click", async () => {
  await cleanupListeners();
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  await cleanupListeners();
  if (!user) {
    currentUser = null;
    document.getElementById("auth-block").classList.remove("hidden");
    document.getElementById("group-block").classList.add("hidden");
    showScreen("screen-login");
    return;
  }
  currentUser = user;
  try {
    const uref = doc(db, "users", user.uid);
    const usnap = await getDoc(uref);
    if (!usnap.exists()) {
      await setDoc(uref, {
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        groupId: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        loginCount: 1
      });
    } else {
      await updateDoc(uref, { lastLogin: serverTimestamp(), loginCount: increment(1) });
    }
    await addDoc(collection(db, "loginLogs"), { uid: user.uid, timestamp: serverTimestamp() });
    userDoc = (await getDoc(uref)).data();

    document.getElementById("auth-block").classList.add("hidden");
    document.getElementById("group-block").classList.remove("hidden");
    document.getElementById("who-am-i").textContent = userDoc.name + " · " + userDoc.email;

    if (userDoc.groupId) {
      groupId = userDoc.groupId;
      await enterApp();
    } else {
      showScreen("screen-login");
    }
  } catch (e) {
    showToast("错误 / Error: " + e.code + " — " + e.message);
    console.error(e);
  }
});

// group tabs
document.querySelectorAll(".tab-btn").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tab-btn").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  document.getElementById("tab-" + b.dataset.tab).classList.add("active");
}));

const JOIN_LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes
function getJoinAttempts() {
  return Number(localStorage.getItem("jiawu_join_fails") || 0);
}
function setJoinAttempts(n) {
  localStorage.setItem("jiawu_join_fails", String(n));
}
function getLockoutUntil() {
  return Number(localStorage.getItem("jiawu_join_lockout_until") || 0);
}
function setLockoutUntil(ts) {
  localStorage.setItem("jiawu_join_lockout_until", String(ts));
}
function joinLockoutRemainingMs() {
  return getLockoutUntil() - Date.now();
}

document.getElementById("btn-join")?.addEventListener("click", async () => {
  const remaining = joinLockoutRemainingMs();
  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60000);
    return showToast(t("join_locked_out", { mins }));
  }
  const code = document.getElementById("input-passcode").value.trim();
  if (code.length !== 5) return showToast(t("err_passcode"));
  const snap = await getDocs(query(collection(db, "groups"), where("passcode", "==", code)));
  let target = null;
  snap.forEach(d => { if (!target) target = { id: d.id, ...d.data() }; });
  if (!target || (target.memberUids || []).length >= 2) {
    const fails = getJoinAttempts() + 1;
    setJoinAttempts(fails);
    if (fails >= 3) {
      setLockoutUntil(Date.now() + JOIN_LOCKOUT_MS);
      setJoinAttempts(0);
      return showToast(t("join_locked_out", { mins: Math.ceil(JOIN_LOCKOUT_MS / 60000) }));
    }
    return showToast(t("err_passcode") + ` (${3 - fails} ${t("attempts_left")})`);
  }
  setJoinAttempts(0);
  setLockoutUntil(0);
  await updateDoc(doc(db, "groups", target.id), { memberUids: arrayUnion(currentUser.uid) });
  await updateDoc(doc(db, "users", currentUser.uid), { groupId: target.id });
  groupId = target.id;
  await enterApp();
});

document.getElementById("btn-create")?.addEventListener("click", async () => {
  const code = randomPasscode();
  const groupName = (prompt(t("enter_group_name")) || "").trim() || t("default_group_name");

  // reject duplicate group names
  const dupSnap = await getDocs(query(collection(db, "groups"), where("name", "==", groupName)));
  if (!dupSnap.empty) {
    return showToast(t("err_group_name_taken"));
  }

  const gref = await addDoc(collection(db, "groups"), {
    name: groupName,
    passcode: code,
    memberUids: [currentUser.uid],
    createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, "users", currentUser.uid), { groupId: gref.id });
  const box = document.getElementById("created-passcode");
  box.textContent = code;
  box.classList.remove("hidden");
  showToast(t("group_created") + code);
  groupId = gref.id;
  setTimeout(enterApp, 1200);
});

// ---------------------------------------------------------------
// Enter app / listeners
// ---------------------------------------------------------------
async function cleanupListeners() {
  if (unsubGroup) unsubGroup();
  if (unsubChores) unsubChores();
  if (unsubRecords) unsubRecords();
  unsubGroup = unsubChores = unsubRecords = null;
}

async function enterApp() {
  showScreen("app-shell");
  document.getElementById("header-user-name").textContent = (userDoc.name || "").toUpperCase();

  unsubGroup = onSnapshot(doc(db, "groups", groupId), (snap) => {
    groupDoc = { id: snap.id, ...snap.data() };
    document.getElementById("header-group-code").textContent = groupDoc.name || "";
    const pcEl = document.getElementById("current-passcode-val");
    if (pcEl) pcEl.textContent = groupDoc.passcode || "-";
    renderDashboard();
    renderStats();
  });

  unsubChores = onSnapshot(collection(db, "groups", groupId, "chores"), (snap) => {
    customChores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderChoreGrid();
  });

  unsubRecords = onSnapshot(
    query(collection(db, "records"), where("groupId", "==", groupId), orderBy("timestamp", "desc"), limit(500)),
    (snap) => {
      records = snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, jsDate: data.timestamp ? data.timestamp.toDate() : new Date() };
      });
      renderDashboard();
      renderChoreGrid();
      renderStats();
      renderHistory();
    },
    (err) => {
      showToast("记录同步错误 / Error: " + err.code + " — " + err.message);
      console.error(err);
    }
  );
}

function partnerUid() {
  if (!groupDoc) return null;
  return (groupDoc.memberUids || []).find(u => u !== currentUser.uid) || null;
}
const nameCache = {};
async function nameForUid(uid) {
  if (!uid) return "-";
  if (uid === currentUser.uid) return userDoc.name || t("you");
  if (nameCache[uid]) return nameCache[uid];
  const s = await getDoc(doc(db, "users", uid));
  const n = s.exists() ? (s.data().name || uid) : uid;
  nameCache[uid] = n;
  return n;
}

// ---------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------
async function renderDashboard() {
  if (!groupDoc) return;
  const pUid = partnerUid();
  document.getElementById("score-partner-name").textContent = pUid ? await nameForUid(pUid) : "-";
  document.getElementById("stats-partner-name").textContent = pUid ? await nameForUid(pUid) : "-";

  const { start, end } = weekRange();
  let myPts = 0, partnerPts = 0;
  records.forEach(r => {
    if (r.jsDate >= start && r.jsDate < end) {
      if (r.uid === currentUser.uid) myPts += r.points;
      else if (r.uid === pUid) partnerPts += r.points;
    }
  });
  document.getElementById("score-me-pts").textContent = myPts + "pts";
  document.getElementById("score-partner-pts").textContent = partnerPts + "pts";
  const total = myPts + partnerPts;
  const splitDeg = total > 0 ? (myPts / total) * 360 : 180;
  document.getElementById("pie").style.setProperty("--split", splitDeg + "deg");
  document.getElementById("pie-week-label").textContent = total + "pts";
}
function weekRange() {
  const start = startOfWeek();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function allChores() {
  return [
    ...DEFAULT_CHORES.map(c => ({ ...c, custom: false })),
    ...customChores.map(c => ({ id: c.id, points: c.points, name: { zh: c.name, ja: c.name, en: c.name }, custom: true }))
  ];
}

async function renderChoreGrid() {
  if (!groupDoc) return;
  const grid = document.getElementById("chore-grid");
  grid.innerHTML = "";
  const today = todayStr();
  const todaysRecords = records.filter(r => r.date === today);
  for (const chore of allChores()) {
    const doneRec = todaysRecords.find(r => r.choreId === chore.id);
    const tile = document.createElement("button");
    tile.className = "chore-tile" + (doneRec ? " done" : "");
    const nameStr = chore.name[lang] || chore.name.zh;
    let extra = "";
    if (doneRec) {
      const doneName = doneRec.uid === currentUser.uid ? t("i_did") : t("already_done_by", { name: await nameForUid(doneRec.uid) });
      extra = `<span class="chore-tile-doneby">${doneName}</span>`;
    }
    tile.innerHTML = `<span class="chore-tile-name">${nameStr}</span><span class="chore-tile-pts">${chore.points}pts</span>${extra}`;
    if (!doneRec) {
      tile.addEventListener("click", () => logChore(chore));
    } else {
      tile.disabled = true;
    }
    grid.appendChild(tile);
  }
}

async function logChore(chore) {
  await addDoc(collection(db, "records"), {
    groupId,
    uid: currentUser.uid,
    userName: userDoc.name || "",
    choreId: chore.id,
    choreName: chore.name[lang] || chore.name.zh,
    points: chore.points,
    date: todayStr(),
    timestamp: serverTimestamp()
  });
  showToast(t("logged"));
}

document.getElementById("btn-add-custom")?.addEventListener("click", () => {
  document.getElementById("modal-custom").classList.remove("hidden");
});
document.getElementById("custom-cancel")?.addEventListener("click", () => {
  document.getElementById("modal-custom").classList.add("hidden");
});
document.getElementById("custom-save")?.addEventListener("click", async () => {
  const name = document.getElementById("custom-name").value.trim();
  const pts = Number(document.getElementById("custom-points").value);
  if (!name || !pts) return;
  await addDoc(collection(db, "groups", groupId, "chores"), { name, points: pts, createdBy: currentUser.uid, createdAt: serverTimestamp() });
  document.getElementById("custom-name").value = "";
  document.getElementById("custom-points").value = "";
  document.getElementById("modal-custom").classList.add("hidden");
});

// ---------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------
function monthKey(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }

function populateMonthSelect() {
  const sel = document.getElementById("month-select");
  const months = new Set([monthKey(new Date())]);
  records.forEach(r => months.add(monthKey(r.jsDate)));
  const sorted = Array.from(months).sort().reverse();
  const prevVal = sel.value;
  sel.innerHTML = sorted.map(m => `<option value="${m}">${m}</option>`).join("");
  sel.value = sorted.includes(prevVal) ? prevVal : sorted[0];
}
document.getElementById("month-select")?.addEventListener("change", renderStats);

function renderStats() {
  if (!groupDoc) return;
  populateMonthSelect();
  const pUid = partnerUid();
  const selMonth = document.getElementById("month-select").value;
  const monthRecords = records.filter(r => monthKey(r.jsDate) === selMonth);

  const weeks = [0, 0, 0, 0, 0];
  const weeksB = [0, 0, 0, 0, 0];
  monthRecords.forEach(r => {
    const wk = Math.min(4, Math.floor((r.jsDate.getDate() - 1) / 7));
    if (r.uid === currentUser.uid) weeks[wk] += r.points;
    else if (r.uid === pUid) weeksB[wk] += r.points;
  });
  drawTrend(weeks, weeksB);

  const tbody = document.getElementById("log-table-body");
  tbody.innerHTML = "";
  records.slice(0, 20).forEach(r => {
    const tr = document.createElement("tr");
    const who = r.uid === currentUser.uid ? t("you") : (r.userName || "-");
    tr.innerHTML = `<td>${r.date}</td><td>${who}</td><td>${r.choreName}</td><td>${r.points}</td>`;
    tbody.appendChild(tr);
  });
}

function drawTrend(a, b) {
  const svg = document.getElementById("trend-svg");
  const max = Math.max(1, ...a, ...b);
  const w = 300, h = 140, pad = 10;
  const stepX = (w - pad * 2) / 4;
  const pathFor = (arr) => arr.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  svg.innerHTML = `
    <polyline points="" />
    <path d="${pathFor(a)}" fill="none" stroke="var(--a,#E15B62)" stroke-width="2.5" />
    <path d="${pathFor(b)}" fill="none" stroke="var(--b,#3E6E93)" stroke-width="2.5" />
    ${a.map((v, i) => `<circle cx="${pad + i * stepX}" cy="${h - pad - (v / max) * (h - pad * 2)}" r="3" fill="#E15B62"/>`).join("")}
    ${b.map((v, i) => `<circle cx="${pad + i * stepX}" cy="${h - pad - (v / max) * (h - pad * 2)}" r="3" fill="#3E6E93"/>`).join("")}
  `;
}

// ---------------------------------------------------------------
// History
// ---------------------------------------------------------------
let historyFilter = "all";
document.querySelectorAll(".filter-btn").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".filter-btn").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  historyFilter = b.dataset.filter;
  renderHistory();
}));

function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;
  const pUid = partnerUid();
  let items = records;
  if (historyFilter === "me") items = records.filter(r => r.uid === currentUser.uid);
  if (historyFilter === "partner") items = records.filter(r => r.uid === pUid);
  list.innerHTML = items.map(r => {
    const who = r.uid === currentUser.uid ? t("you") : (r.userName || "-");
    const mine = r.uid === currentUser.uid;
    const actions = mine ? `
      <div class="history-actions">
        <button data-edit="${r.id}">${t("edit")}</button>
        <button data-del="${r.id}">${t("delete")}</button>
      </div>` : "";
    return `<div class="history-item"><div><span class="who">${who}</span> · ${r.choreName}</div>
      <div class="history-right"><div><span>${r.date}</span> <span class="pts">${r.points}pts</span></div>${actions}</div></div>`;
  }).join("");
  list.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const rec = records.find(r => r.id === btn.dataset.edit);
    if (rec) editRecordModal(rec);
  }));
  list.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", async () => {
    if (!confirm(t("confirm_delete_record"))) return;
    await deleteDoc(doc(db, "records", btn.dataset.del));
  }));
}

function editRecordModal(rec) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-box">
      <h3>${t("edit_record_title")}</h3>
      <input id="edit-choreName" class="text-input" value="${rec.choreName}">
      <input id="edit-points" class="text-input" type="number" value="${rec.points}">
      <div class="modal-actions">
        <button class="btn btn-ghost" id="edit-cancel">${t("cancel")}</button>
        <button class="btn btn-primary" id="edit-save">${t("save")}</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("#edit-cancel").addEventListener("click", () => modal.remove());
  modal.querySelector("#edit-save").addEventListener("click", async () => {
    const choreName = modal.querySelector("#edit-choreName").value.trim();
    const points = Number(modal.querySelector("#edit-points").value);
    if (!choreName || !points) return;
    await updateDoc(doc(db, "records", rec.id), { choreName, points });
    modal.remove();
    showToast(t("saved"));
  });
}

// ---------------------------------------------------------------
// Bottom nav
// ---------------------------------------------------------------
document.querySelectorAll(".nav-btn").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".nav-btn").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".tab-view").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  document.getElementById("tab-" + b.dataset.tab + "-view").classList.add("active");
  document.getElementById("header-title").textContent = b.querySelector("span").textContent;
}));

// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------
document.getElementById("row-exit-group")?.addEventListener("click", async () => {
  if (!confirm(t("confirm_exit"))) return;
  await updateDoc(doc(db, "groups", groupId), { memberUids: arrayRemove(currentUser.uid) });
  await updateDoc(doc(db, "users", currentUser.uid), { groupId: null });
  await cleanupListeners();
  groupId = null; groupDoc = null; records = []; customChores = [];
  document.getElementById("group-block").classList.remove("hidden");
  document.getElementById("created-passcode").classList.add("hidden");
  showScreen("screen-login");
});

document.getElementById("row-copy-passcode")?.addEventListener("click", () => {
  if (groupDoc && groupDoc.passcode) showPasscodeModal(groupDoc.passcode);
});

document.getElementById("row-rename-group")?.addEventListener("click", async () => {
  try {
    const newName = (prompt(t("enter_group_name"), (groupDoc && groupDoc.name) || "") || "").trim();
    if (!newName) return;
    if (newName !== (groupDoc && groupDoc.name)) {
      const dupSnap = await getDocs(query(collection(db, "groups"), where("name", "==", newName)));
      const takenByOther = dupSnap.docs.some(d => d.id !== groupId);
      if (takenByOther) return showToast(t("err_group_name_taken"));
    }
    await updateDoc(doc(db, "groups", groupId), { name: newName });
    showToast(t("saved"));
  } catch (e) {
    showToast("错误 / Error: " + (e.code || "") + " — " + e.message);
    console.error(e);
  }
});

document.getElementById("row-change-passcode")?.addEventListener("click", async () => {
  const code = randomPasscode();
  await updateDoc(doc(db, "groups", groupId), { passcode: code });
  showPasscodeModal(code);
});

function showPasscodeModal(code) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-box" style="text-align:center;">
      <h3>${t("passcode_changed")}</h3>
      <div id="passcode-display" style="font-family:'Space Grotesk',monospace;font-size:34px;letter-spacing:8px;background:var(--bg);border-radius:12px;padding:16px;margin:14px 0;">${code}</div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="passcode-close">${t("cancel")}</button>
        <button class="btn btn-primary" id="passcode-copy">${lang === "zh" ? "复制" : lang === "ja" ? "コピー" : "Copy"}</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("#passcode-close").addEventListener("click", () => modal.remove());
  modal.querySelector("#passcode-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast(t("saved"));
    } catch (e) {
      // fallback: select the text so the user can manually copy
      const range = document.createRange();
      range.selectNodeContents(modal.querySelector("#passcode-display"));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      showToast(lang === "zh" ? "已选中，请手动复制" : lang === "ja" ? "選択しました。コピーしてください" : "Selected — copy manually");
    }
  });
}

document.getElementById("row-manage-tasks")?.addEventListener("click", () => {
  const list = customChores.map(c =>
    `<div class="admin-group-row"><b>${c.name}</b> · ${c.points}pts
      <button class="admin-small-btn" data-del="${c.id}">${t("delete")}</button></div>`
  ).join("") || `<p class="hint">—</p>`;
  const area = document.getElementById("manage-tasks-detail");
  area.classList.remove("hidden");
  area.innerHTML = `<h3>${t("manage_tasks")}</h3>${list}`;
  area.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", async () => {
    await deleteDoc(doc(db, "groups", groupId, "chores", btn.dataset.del));
  }));
});

// admin entry from login screen
document.getElementById("btn-admin-entry")?.addEventListener("click", () => showScreen("screen-admin-login"));
document.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => showScreen(b.dataset.back)));
document.getElementById("btn-admin-login")?.addEventListener("click", () => {
  if (document.getElementById("input-admin-key").value === ADMIN_KEY) {
    isAdmin = true;
    showToast("OK");
    showScreen("screen-login");
  } else {
    showToast(t("err_admin_key"));
  }
});

document.getElementById("btn-admin-unlock")?.addEventListener("click", async () => {
  if (document.getElementById("input-admin-key-2").value !== ADMIN_KEY) return showToast(t("err_admin_key"));
  isAdmin = true;
  document.getElementById("admin-locked").classList.add("hidden");
  document.getElementById("admin-unlocked").classList.remove("hidden");
  const [gCount, uCount, rCount] = await Promise.all([
    getCountFromServer(collection(db, "groups")),
    getCountFromServer(collection(db, "users")),
    getCountFromServer(collection(db, "records"))
  ]);
  document.getElementById("admin-total-groups").textContent = gCount.data().count;
  document.getElementById("admin-total-users").textContent = uCount.data().count;
  document.getElementById("admin-total-records").textContent = rCount.data().count;
});

document.getElementById("row-view-groups")?.addEventListener("click", async () => {
  const area = document.getElementById("admin-detail");
  area.innerHTML = `<h3>${t("view_all_groups")}</h3><p class="hint">…</p>`;
  const groupsSnap = await getDocs(collection(db, "groups"));
  const rows = [];
  for (const g of groupsSnap.docs) {
    const gd = { id: g.id, ...g.data() };
    const memberNames = [];
    for (const uid of gd.memberUids || []) {
      const us = await getDoc(doc(db, "users", uid));
      memberNames.push({ uid, name: us.exists() ? us.data().name : uid });
    }
    rows.push(`
      <div class="admin-group-row">
        <b>${gd.name}</b> · ${gd.passcode}
        <div>${memberNames.map(m => m.name).join(" & ") || "—"}</div>
        <div class="row-actions">
          <select data-adjust-uid="${gd.id}">
            ${memberNames.map(m => `<option value="${m.uid}">${m.name}</option>`).join("")}
          </select>
          <input type="number" placeholder="±pts" data-adjust-pts="${gd.id}">
          <button class="admin-small-btn" data-adjust-go="${gd.id}">${t("adjust_score")}</button>
          <button class="admin-small-btn" data-dissolve="${gd.id}">${t("dissolve_group")}</button>
        </div>
      </div>`);
  }
  area.innerHTML = `<h3>${t("view_all_groups")}</h3>` + rows.join("");
  area.querySelectorAll("[data-adjust-go]").forEach(btn => btn.addEventListener("click", async () => {
    const gid = btn.dataset.adjustGo;
    const uidSel = area.querySelector(`[data-adjust-uid="${gid}"]`);
    const ptsInput = area.querySelector(`[data-adjust-pts="${gid}"]`);
    const pts = Number(ptsInput.value);
    if (!pts) return;
    await addDoc(collection(db, "records"), {
      groupId: gid, uid: uidSel.value, userName: uidSel.selectedOptions[0].textContent,
      choreId: "admin_adjust", choreName: "Admin adjustment", points: pts,
      date: todayStr(), timestamp: serverTimestamp()
    });
    showToast(t("saved"));
  }));
  area.querySelectorAll("[data-dissolve]").forEach(btn => btn.addEventListener("click", async () => {
    if (!confirm(t("confirm_dissolve"))) return;
    const gid = btn.dataset.dissolve;
    const gs = await getDoc(doc(db, "groups", gid));
    for (const uid of (gs.data().memberUids || [])) {
      await updateDoc(doc(db, "users", uid), { groupId: null });
    }
    await deleteDoc(doc(db, "groups", gid));
    document.getElementById("row-view-groups").click();
  }));
});

document.getElementById("row-view-users")?.addEventListener("click", async () => {
  const area = document.getElementById("admin-detail");
  const usersSnap = await getDocs(collection(db, "users"));
  const rows = usersSnap.docs.map(u => {
    const ud = u.data();
    return `
      <div class="admin-group-row">
        <input class="text-input" data-name-uid="${u.id}" value="${ud.name || ""}">
        <div class="hint">${t("email_label")}: ${ud.email || "-"}</div>
        <div class="hint">${t("last_login_label")}: ${ud.lastLogin ? ud.lastLogin.toDate().toLocaleString() : "-"}</div>
        <div class="hint">${t("login_count_label")}: ${ud.loginCount || 0}</div>
        <button class="admin-small-btn" data-save-name="${u.id}">${t("save")}</button>
      </div>`;
  }).join("");
  area.innerHTML = `<h3>${t("view_all_users")}</h3>` + rows;
  area.querySelectorAll("[data-save-name]").forEach(btn => btn.addEventListener("click", async () => {
    const uid = btn.dataset.saveName;
    const val = area.querySelector(`[data-name-uid="${uid}"]`).value.trim();
    await updateDoc(doc(db, "users", uid), { name: val });
    showToast(t("saved"));
  }));
});

document.getElementById("row-view-records")?.addEventListener("click", async () => {
  const area = document.getElementById("admin-detail");
  area.innerHTML = `<h3>${t("view_all_records")}</h3><p class="hint">…</p>`;
  try {
    const recSnap = await getDocs(query(collection(db, "records"), orderBy("timestamp", "desc"), limit(100)));
    const rows = recSnap.docs.map(d => {
      const r = { id: d.id, ...d.data() };
      return `
        <div class="admin-group-row">
          <div>${r.date} · ${r.userName || r.uid} · <b>${r.choreName}</b> · ${r.points}pts</div>
          <div class="row-actions">
            <button class="admin-small-btn" data-admin-edit="${r.id}">${t("edit")}</button>
            <button class="admin-small-btn" data-admin-del="${r.id}">${t("delete")}</button>
          </div>
        </div>`;
    });
    area.innerHTML = `<h3>${t("view_all_records")}</h3>` + (rows.join("") || `<p class="hint">—</p>`);
    recSnap.docs.forEach(d => {
      const r = { id: d.id, ...d.data() };
      const editBtn = area.querySelector(`[data-admin-edit="${r.id}"]`);
      if (editBtn) editBtn.addEventListener("click", () => editRecordModal(r));
    });
    area.querySelectorAll("[data-admin-del]").forEach(btn => btn.addEventListener("click", async () => {
      if (!confirm(t("confirm_delete_record"))) return;
      await deleteDoc(doc(db, "records", btn.dataset.adminDel));
      document.getElementById("row-view-records").click();
    }));
  } catch (e) {
    area.innerHTML = `<h3>${t("view_all_records")}</h3>`;
    showToast("错误 / Error: " + e.code + " — " + e.message);
    console.error(e);
  }
});

// initial i18n paint
applyI18n();
