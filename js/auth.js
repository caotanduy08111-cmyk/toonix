/* Toonix — tài khoản (demo, lưu trong localStorage của trình duyệt),
   chế độ sáng/tối, và danh sách truyện yêu thích.
   Đây KHÔNG phải hệ thống đăng nhập thật — không dùng để lưu mật khẩu thật. */

const USERS_KEY = "toonix_users";
const SESSION_KEY = "toonix_session";
const THEME_KEY = "toonix_theme";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function getCurrentUser() {
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function registerUser(name, email, password) {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "Email này đã được đăng ký." };
  }
  users.push({ name, email, password, gender: null, birthday: "", favoriteGenres: [] });
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, email);
  return { ok: true };
}

function updateCurrentUser(patch) {
  const user = getCurrentUser();
  if (!user) return false;
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (idx < 0) return false;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return true;
}

function loginUser(email, password) {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: "Email hoặc mật khẩu không đúng." };
  localStorage.setItem(SESSION_KEY, user.email);
  return { ok: true };
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  location.href = "index.html";
}

/* ---------- Truyện yêu thích (riêng theo từng tài khoản) ---------- */
function favoritesKey() {
  const user = getCurrentUser();
  return `toonix_fav_${user ? user.email.toLowerCase() : "guest"}`;
}
function getFavoriteIds() {
  try { return JSON.parse(localStorage.getItem(favoritesKey())) || []; }
  catch { return []; }
}
function isFavorite(id) { return getFavoriteIds().includes(Number(id)); }
function toggleFavorite(id) {
  id = Number(id);
  const favs = getFavoriteIds();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1); else favs.push(id);
  localStorage.setItem(favoritesKey(), JSON.stringify(favs));
  return favs.includes(id);
}

/* ---------- Lịch sử đọc (riêng theo từng tài khoản) ---------- */
function historyKey() {
  const user = getCurrentUser();
  return `toonix_history_${user ? user.email.toLowerCase() : "guest"}`;
}
function getHistory() {
  try { return JSON.parse(localStorage.getItem(historyKey())) || []; }
  catch { return []; }
}
function recordHistory(storyId, chapterNumber) {
  storyId = Number(storyId);
  chapterNumber = Number(chapterNumber);
  let hist = getHistory().filter((h) => h.storyId !== storyId);
  hist.unshift({ storyId, chapterNumber, time: Date.now() });
  hist = hist.slice(0, 40);
  localStorage.setItem(historyKey(), JSON.stringify(hist));
}
function clearHistory() {
  localStorage.removeItem(historyKey());
}

/* ---------- Bình luận (demo, lưu theo từng truyện) ---------- */
function commentsKey(storyId) { return `toonix_comments_${storyId}`; }
function getComments(storyId) {
  try { return JSON.parse(localStorage.getItem(commentsKey(storyId))) || []; }
  catch { return []; }
}
function addComment(storyId, text, chapterLabel) {
  const user = getCurrentUser();
  if (!user) return null;
  const list = getComments(storyId);
  const entry = {
    id: Date.now(),
    name: user.name || user.email,
    text: text.trim(),
    chapter: chapterLabel || "Toàn truyện",
    time: Date.now(),
  };
  list.unshift(entry);
  localStorage.setItem(commentsKey(storyId), JSON.stringify(list));
  return entry;
}

/* ---------- Chế độ sáng / tối ---------- */
function applyStoredTheme() {
  const theme = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.setAttribute("data-theme", theme);
}
function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = next === "dark" ? "☀️" : "🌙";
}

/* ---------- Vùng tài khoản trên header ---------- */
function renderAuthArea() {
  const area = document.getElementById("auth-area");
  if (!area) return;
  const user = getCurrentUser();

  if (!user) {
    area.innerHTML = `<a class="auth-guest-link" href="auth.html">Đăng Nhập</a>`;
    return;
  }

  const initial = (user.name || user.email).trim().charAt(0).toUpperCase() || "U";
  area.innerHTML = `
    <div class="user-menu" id="user-menu">
      <button class="user-menu-btn" id="user-menu-btn" type="button">
        <span class="user-avatar">${initial}</span>
        ${user.name}
      </button>
      <div class="user-dropdown">
        <a href="ho-so.html">👤 Hồ Sơ</a>
        <a href="lich-su-doc.html">🕘 Lịch Sử Đọc</a>
        <a href="favorites.html">❤ Truyện Yêu Thích</a>
        <hr>
        <button type="button" id="logout-btn">↩ Đăng Xuất</button>
      </div>
    </div>`;

  const menu = document.getElementById("user-menu");
  document.getElementById("user-menu-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });
  document.addEventListener("click", () => menu.classList.remove("open"));
  document.getElementById("logout-btn").addEventListener("click", logoutUser);
}

/* ---------- Nút yêu thích dùng chung (event delegation) ---------- */
function initFavoriteButtons() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-btn, .btn-fav");
    if (!btn || !btn.dataset.id) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.id;
    const active = toggleFavorite(id);

    document.querySelectorAll(`[data-id="${id}"].fav-btn`).forEach((b) => {
      b.classList.toggle("active", active);
      b.textContent = active ? "♥" : "♡";
    });
    document.querySelectorAll(`[data-id="${id}"].btn-fav`).forEach((b) => {
      b.classList.toggle("active", active);
      b.innerHTML = active ? "♥ Đã Yêu Thích" : "♡ Yêu Thích";
    });

    if (document.body.dataset.page === "favorites" && typeof initFavoritesPage === "function") {
      initFavoritesPage();
    }
  });
}

/* ---------- Toast thông báo nhỏ ---------- */
function showToast(message) {
  let el = document.getElementById("toonix-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toonix-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

document.addEventListener("DOMContentLoaded", () => {
  applyStoredTheme();
  renderAuthArea();
  initFavoriteButtons();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
    themeBtn.addEventListener("click", toggleTheme);
  }
});
