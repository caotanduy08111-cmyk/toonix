/* Toonix — logic dùng chung cho toàn bộ website */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function fmtViews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

function fmtDaysAgo(d) {
  if (d <= 0) return "Hôm nay";
  if (d === 1) return "Hôm qua";
  return `${d} ngày trước`;
}

/* ---------- Nav active state ---------- */
function markActiveNav() {
  const page = document.body.dataset.page;
  $$(".main-nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === page);
  });
}

/* ---------- Header search ---------- */
function initHeaderSearch() {
  const form = $("#header-search");
  if (!form) return;
  const input = $("input", form);
  const presetQ = qs("q");
  if (presetQ) input.value = presetQ;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    location.href = "list.html" + (v ? `?q=${encodeURIComponent(v)}` : "");
  });
}

/* ---------- Story card ---------- */
function storyCardHTML(s) {
  const fav = typeof isFavorite === "function" && isFavorite(s.id);
  return `
  <div class="story-card">
    <a class="cover-wrap" href="story.html?id=${s.id}">
      <img src="${s.cover}" alt="${s.title}" loading="lazy">
      <span class="badge">${s.status === "Hoàn Thành" ? "Full" : "Mới"}</span>
    </a>
    <button class="fav-btn ${fav ? "active" : ""}" data-id="${s.id}" aria-label="Yêu thích">${fav ? "♥" : "♡"}</button>
    <a class="info" href="story.html?id=${s.id}">
      <h3>${s.title}</h3>
      <div class="meta">
        <span>Ch. ${s.chapterCount} · ★ ${s.rating}</span>
        <span class="rating">${fmtViews(s.views)} lượt xem</span>
      </div>
    </a>
  </div>`;
}

function renderGrid(container, stories, emptyMsg = "Không tìm thấy truyện nào phù hợp.") {
  if (!container) return;
  if (!stories.length) {
    container.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
    return;
  }
  container.innerHTML = stories.map(storyCardHTML).join("");
}

/* ---------- Hero slider (trang chủ) ---------- */
function initHeroSlider() {
  const hero = $("#hero");
  if (!hero) return;
  const featured = STORIES.slice(0, 5);
  const slidesWrap = $(".hero-slides", hero);
  const dotsWrap = $(".hero-dots", hero);

  slidesWrap.innerHTML = featured.map((s, i) => `
    <div class="hero-slide ${i === 0 ? "active" : ""}" data-i="${i}">
      <div class="hero-text">
        <span class="chip coral">${s.genres[0]}</span>
        <h1>${s.title}</h1>
        <p>${s.description}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="read.html?id=${s.id}&chap=1">▶ Đọc Ngay</a>
          <a class="btn btn-ghost" href="story.html?id=${s.id}">Chi Tiết</a>
        </div>
      </div>
      <div class="hero-cover"><img src="${s.cover}" alt="${s.title}"></div>
    </div>
  `).join("");

  dotsWrap.innerHTML = featured.map((_, i) =>
    `<button data-i="${i}" class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`
  ).join("");

  let current = 0;
  const slides = $$(".hero-slide", hero);
  const dots = $$(".hero-dots button", hero);

  function goTo(i) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  dots.forEach((d) => d.addEventListener("click", () => goTo(Number(d.dataset.i))));
  let timer = setInterval(() => goTo(current + 1), 5000);
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", () => { timer = setInterval(() => goTo(current + 1), 5000); });
}

/* ---------- Trang chủ ---------- */
function initHomePage() {
  initHeroSlider();

  const latest = [...STORIES].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo).slice(0, 12);
  renderGrid($("#grid-latest"), latest);

  const hot = [...STORIES].sort((a, b) => b.views - a.views).slice(0, 12);
  renderGrid($("#grid-hot"), hot);

  const genreStrip = $("#genre-strip");
  if (genreStrip) {
    genreStrip.innerHTML = ALL_GENRES.map((g) =>
      `<a class="chip-filter" href="list.html?genre=${encodeURIComponent(g)}">${g}</a>`
    ).join("");
  }
}

/* ---------- Trang danh sách ---------- */
function initListPage() {
  const grid = $("#grid-list");
  const filterWrap = $("#genre-filters");
  const sortSelect = $("#sort-select");
  const searchInfo = $("#search-info");
  const pagination = $("#pagination");

  let activeGenre = qs("genre") || "Tất Cả";
  let query = (qs("q") || "").toLowerCase();
  let sortBy = "latest";
  let page = 1;
  const pageSize = 12;

  filterWrap.innerHTML = ["Tất Cả", ...ALL_GENRES].map((g) =>
    `<button class="chip-filter ${g === activeGenre ? "active" : ""}" data-genre="${g}">${g}</button>`
  ).join("");

  function apply() {
    let list = STORIES.filter((s) => {
      const genreOk = activeGenre === "Tất Cả" || s.genres.includes(activeGenre);
      const q = query.trim();
      const queryOk = !q || s.title.toLowerCase().includes(q);
      return genreOk && queryOk;
    });

    if (sortBy === "latest") list.sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo);
    if (sortBy === "views") list.sort((a, b) => b.views - a.views);
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "az") list.sort((a, b) => a.title.localeCompare(b.title));

    searchInfo.textContent = query
      ? `Kết quả tìm kiếm cho "${query}" — ${list.length} truyện`
      : `${activeGenre === "Tất Cả" ? "Tất cả truyện" : "Thể loại: " + activeGenre} — ${list.length} truyện`;

    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    page = Math.min(page, totalPages);
    const pageItems = list.slice((page - 1) * pageSize, page * pageSize);
    renderGrid(grid, pageItems);
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) { pagination.innerHTML = ""; return; }
    let html = `<button ${page === 1 ? "disabled" : ""} data-p="${page - 1}">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="${i === page ? "active" : ""}" data-p="${i}">${i}</button>`;
    }
    html += `<button ${page === totalPages ? "disabled" : ""} data-p="${page + 1}">›</button>`;
    pagination.innerHTML = html;
    $$("button", pagination).forEach((b) =>
      b.addEventListener("click", () => { page = Number(b.dataset.p); apply(); window.scrollTo({ top: 0, behavior: "smooth" }); })
    );
  }

  $$("button", filterWrap).forEach((b) =>
    b.addEventListener("click", () => {
      activeGenre = b.dataset.genre;
      page = 1;
      $$("button", filterWrap).forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      apply();
    })
  );

  sortSelect.addEventListener("change", () => { sortBy = sortSelect.value; page = 1; apply(); });

  const headerSearchInput = $("#header-search input");
  if (headerSearchInput) {
    $("#header-search").addEventListener("submit", (e) => {
      e.preventDefault();
      query = headerSearchInput.value.toLowerCase();
      activeGenre = "Tất Cả";
      $$("button", filterWrap).forEach((x) => x.classList.toggle("active", x.dataset.genre === "Tất Cả"));
      page = 1;
      apply();
    });
  }

  apply();
}

/* ---------- Trang chi tiết truyện ---------- */
function initStoryPage() {
  const id = qs("id");
  const story = getStoryById(id);
  const root = $("#story-root");
  if (!story) {
    root.innerHTML = `<div class="empty-state">Không tìm thấy truyện. <a href="index.html">Về trang chủ</a></div>`;
    return;
  }

  document.title = `${story.title} — Toonix`;

  $("#s-cover").src = story.cover;
  $("#s-cover").alt = story.title;
  $("#s-title").textContent = story.title;
  $("#s-genres").innerHTML = story.genres.map((g) => `<a class="chip" href="list.html?genre=${encodeURIComponent(g)}">${g}</a>`).join("");
  $("#s-description").textContent = story.description;
  $("#s-status").textContent = story.status;
  $("#s-chapcount").textContent = story.chapterCount;
  $("#s-views").textContent = fmtViews(story.views);
  $("#s-rating").textContent = story.rating;
  $("#s-author").textContent = story.author;
  $("#s-updated").textContent = fmtDaysAgo(story.updatedDaysAgo);

  const firstChap = story.chapters[story.chapters.length - 1].number;
  const lastChap = story.chapters[0].number;
  $("#btn-read-first").href = `read.html?id=${story.id}&chap=${firstChap}`;
  $("#btn-read-latest").href = `read.html?id=${story.id}&chap=${lastChap}`;

  const favBtn = $("#btn-fav-story");
  if (favBtn) {
    favBtn.dataset.id = story.id;
    const fav = typeof isFavorite === "function" && isFavorite(story.id);
    favBtn.classList.toggle("active", fav);
    favBtn.innerHTML = fav ? "♥ Đã Yêu Thích" : "♡ Yêu Thích";
  }

  $("#chapter-list").innerHTML = story.chapters.map((c) => `
    <a class="chapter-row" href="read.html?id=${story.id}&chap=${c.number}">
      <span class="name">${c.title}</span>
      <span class="date">${fmtDaysAgo(c.daysAgo)}</span>
    </a>
  `).join("");

  const related = STORIES.filter((s) => s.id !== story.id && s.genres.some((g) => story.genres.includes(g))).slice(0, 6);
  const relatedFallback = related.length ? related : STORIES.filter((s) => s.id !== story.id).slice(0, 6);
  renderGrid($("#grid-related"), relatedFallback);
}

/* ---------- Trang đọc chương ---------- */
const READER_GRADIENTS = [
  "linear-gradient(160deg,#62C4DA,#3f97ad)",
  "linear-gradient(160deg,#FA855A,#c95a34)",
  "linear-gradient(160deg,#FFDE96,#e0a94f)",
  "linear-gradient(160deg,#C93638,#8f2224)",
];

function initReaderPage() {
  const id = qs("id");
  const chap = Number(qs("chap") || 1);
  const story = getStoryById(id);
  const root = $("#reader-root");
  if (!story) {
    root.innerHTML = `<div class="empty-state">Không tìm thấy truyện. <a href="index.html">Về trang chủ</a></div>`;
    return;
  }

  const chapterExists = story.chapters.find((c) => c.number === chap);
  const currentChap = chapterExists ? chap : story.chapters[story.chapters.length - 1].number;

  document.title = `${story.title} — Chương ${currentChap} — Toonix`;

  $("#r-story-name").textContent = story.title;
  $("#r-story-name").href = `story.html?id=${story.id}`;
  $("#r-chap-name").textContent = `Chương ${currentChap}`;

  const select = $("#r-chapter-select");
  select.innerHTML = story.chapters.map((c) =>
    `<option value="${c.number}" ${c.number === currentChap ? "selected" : ""}>${c.title}</option>`
  ).join("");
  select.addEventListener("change", () => {
    location.href = `read.html?id=${story.id}&chap=${select.value}`;
  });

  const maxChap = story.chapters[0].number;
  const minChap = story.chapters[story.chapters.length - 1].number;
  const prevBtns = $$(".r-prev");
  const nextBtns = $$(".r-next");
  prevBtns.forEach((b) => {
    if (currentChap <= minChap) b.disabled = true;
    else b.addEventListener("click", () => location.href = `read.html?id=${story.id}&chap=${currentChap - 1}`);
  });
  nextBtns.forEach((b) => {
    if (currentChap >= maxChap) b.disabled = true;
    else b.addEventListener("click", () => location.href = `read.html?id=${story.id}&chap=${currentChap + 1}`);
  });

  const pageCount = 6 + (currentChap % 5);
  const strip = $("#reader-strip");
  strip.innerHTML = Array.from({ length: pageCount }, (_, i) => `
    <div class="reader-page" style="background:${READER_GRADIENTS[i % READER_GRADIENTS.length]}">
      <span class="num">Trang ${i + 1}/${pageCount}</span>
      <span class="hint">Ảnh minh hoạ demo — thay bằng ảnh chương thật tại đây</span>
    </div>
  `).join("");

  const related = STORIES.filter((s) => s.id !== story.id).slice(0, 6);
  const relatedGrid = $("#grid-reader-related");
  if (relatedGrid) renderGrid(relatedGrid, related);
}

/* ---------- Trang truyện yêu thích ---------- */
function initFavoritesPage() {
  const user = getCurrentUser();
  const guestNotice = $("#fav-guest-notice");
  const grid = $("#grid-favorites");
  const countEl = $("#fav-count");

  if (!user) {
    guestNotice.style.display = "block";
    grid.innerHTML = "";
    if (countEl) countEl.textContent = "";
    return;
  }
  guestNotice.style.display = "none";

  const ids = getFavoriteIds();
  const favStories = STORIES.filter((s) => ids.includes(s.id));
  if (countEl) countEl.textContent = favStories.length ? `${favStories.length} truyện` : "";
  renderGrid(grid, favStories, "Bạn chưa yêu thích truyện nào. Bấm biểu tượng ♡ trên bất kỳ truyện nào để lưu vào đây.");
}

document.addEventListener("DOMContentLoaded", () => {
  markActiveNav();
  initHeaderSearch();
  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "list") initListPage();
  if (page === "story") initStoryPage();
  if (page === "read") initReaderPage();
  if (page === "favorites") initFavoritesPage();
});
