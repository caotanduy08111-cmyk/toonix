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
  const featured = BANNER_STORY_IDS.map((id) => getStoryById(id)).filter(Boolean);
  const slidesWrap = $(".hero-slides", hero);
  const dotsWrap = $(".hero-dots", hero);

  slidesWrap.innerHTML = featured.map((s, i) => `
    <div class="hero-slide ${i === 0 ? "active" : ""}" data-i="${i}">
      <img src="${s.banner}" alt="${s.title}">
      <div class="hero-actions">
        <a class="btn btn-primary" href="read.html?id=${s.id}&chap=1">▶ Đọc Ngay</a>
        <a class="btn btn-ghost" href="story.html?id=${s.id}">Chi Tiết</a>
      </div>
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

/* ---------- Truyện đề cử: 1 thẻ lớn + lưới 2x2 ---------- */
function renderFeatured() {
  const mainEl = $("#featured-main");
  const gridEl = $("#featured-grid");
  if (!mainEl || !gridEl) return;

  const picks = [...STORIES].sort((a, b) => b.rating - a.rating).slice(0, 5);
  renderGrid(mainEl, picks.slice(0, 1));
  renderGrid(gridEl, picks.slice(1, 5));
}

/* ---------- Bảng xếp hạng: top 3 theo lượt xem ---------- */
function renderRankingPodium() {
  const el = $("#ranking-podium");
  if (!el) return;

  const top3 = [...STORIES].sort((a, b) => b.views - a.views).slice(0, 3);
  const visualOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const rankOf = (s) => top3.indexOf(s) + 1;

  el.innerHTML = visualOrder.map((s) => {
    const rank = rankOf(s);
    const fav = typeof isFavorite === "function" && isFavorite(s.id);
    return `
    <div class="story-card rank-${rank}">
      <span class="rank-badge">${rank}</span>
      <a class="cover-wrap" href="story.html?id=${s.id}">
        <img src="${s.cover}" alt="${s.title}" loading="lazy">
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
  }).join("");
}

/* ---------- Trang chủ ---------- */
function initMarquee(elId, items) {
  const track = $(elId);
  if (!track) return;
  const html = items.map((t) => `<span class="marquee-item">${t}<span class="dot">✦</span></span>`).join("");
  track.innerHTML = html + html; // lặp lại 2 lần để cuộn liền mạch
}

function initHomePage() {
  initHeroSlider();
  renderFeatured();
  renderRankingPodium();

  initMarquee("#marquee-genres", ALL_GENRES.map((g) =>
    `<a href="list.html?genre=${encodeURIComponent(g)}">${g}</a>`
  ));
  initMarquee("#marquee-features", [
    `${STORIES.length}+ Đầu Truyện`,
    "Cập Nhật Mỗi Ngày",
    "Đọc Hoàn Toàn Miễn Phí",
    "Lưu Truyện Yêu Thích",
    "Trải Nghiệm Lật Trang 3D",
    "Bảng Xếp Hạng Theo Thời Gian Thực",
  ]);
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
  $("#s-title-crumb").textContent = story.title;
  $("#s-genres").innerHTML = story.genres.map((g) => `<a class="chip" href="list.html?genre=${encodeURIComponent(g)}">${g}</a>`).join("");
  $("#s-description").textContent = story.description;
  $("#s-status").textContent = story.status;
  $("#s-chapcount").textContent = story.chapterCount;
  $("#s-views").textContent = fmtViews(story.views);
  $("#s-rating").textContent = story.rating;
  $("#s-author").textContent = story.author;
  $("#s-updated").textContent = fmtDaysAgo(story.updatedDaysAgo);

  const byViews = [...STORIES].sort((a, b) => b.views - a.views);
  $("#s-rank").textContent = `#${byViews.indexOf(story) + 1}`;

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

  $("#chapter-path").innerHTML = story.chapters.map((c, i) => `
    <a class="chapter-path-item ${i < 2 ? "is-new" : ""}" href="read.html?id=${story.id}&chap=${c.number}">
      <span class="name">${c.title}</span>
      <span class="date">${fmtDaysAgo(c.daysAgo)}</span>
    </a>
  `).join("");

  initComments(story);
}

/* ---------- Bình luận trên trang truyện ---------- */
function initComments(story) {
  const hint = $("#comment-login-hint");
  const form = $("#comment-form");
  const listEl = $("#comment-list");
  if (!listEl) return;

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  hint.style.display = user ? "none" : "block";
  form.style.display = user ? "flex" : "none";

  function renderList() {
    const comments = getComments(story.id);
    if (!comments.length) {
      listEl.innerHTML = `<p class="comment-empty">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận!</p>`;
      return;
    }
    listEl.innerHTML = comments.map((c) => `
      <div class="comment-item">
        <div class="comment-avatar">${c.name.trim().charAt(0).toUpperCase()}</div>
        <div class="comment-body">
          <div class="top-row">
            <span class="author">${c.name}</span>
            <span class="chapter-tag">${c.chapter}</span>
            <span class="time">${fmtDaysAgo(Math.floor((Date.now() - c.time) / 86400000))}</span>
          </div>
          <div class="text"></div>
        </div>
      </div>
    `).join("");
    $$(".comment-body .text", listEl).forEach((el, i) => { el.textContent = comments[i].text; });
  }

  if (form && !form.dataset.bound) {
    form.dataset.bound = "1";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const textarea = $("#comment-text");
      const text = textarea.value.trim();
      if (!text) return;
      addComment(story.id, text);
      textarea.value = "";
      renderList();
    });
  }

  renderList();
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

  if (typeof recordHistory === "function") recordHistory(story.id, currentChap);

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

  initFlipbookMode(story, currentChap, pageCount);

  const related = STORIES.filter((s) => s.id !== story.id).slice(0, 6);
  const relatedGrid = $("#grid-reader-related");
  if (relatedGrid) renderGrid(relatedGrid, related);
}

/* ---------- Chế độ lật trang sách 3D (thư viện page-flip) ---------- */
function buildFlipbook(story, currentChap, pageCount) {
  const container = $("#flipbook");
  if (!container || typeof St === "undefined") return null;
  container.innerHTML = "";

  const cover = document.createElement("div");
  cover.className = "page page-cover";
  cover.innerHTML = `
    <img src="${story.cover}" alt="${story.title}">
    <div style="font-size:18px;font-weight:800;">${story.title}</div>
    <div style="font-size:13px;opacity:.85">Chương ${currentChap}</div>`;
  container.appendChild(cover);

  for (let i = 0; i < pageCount; i++) {
    const p = document.createElement("div");
    p.className = `page page-g${i % 4}`;
    p.innerHTML = `<span class="num">Trang ${i + 1}/${pageCount}</span><span class="hint">Ảnh minh hoạ demo</span>`;
    container.appendChild(p);
  }

  const backCover = document.createElement("div");
  backCover.className = "page page-cover";
  backCover.innerHTML = `<div style="font-size:18px;font-weight:800;">Hết Chương ${currentChap}</div>`;
  container.appendChild(backCover);

  const pageFlip = new St.PageFlip(container, {
    width: 300,
    height: 440,
    size: "stretch",
    minWidth: 180,
    maxWidth: 500,
    minHeight: 280,
    maxHeight: 700,
    showCover: true,
    usePortrait: true,
    maxShadowOpacity: 0.5,
    mobileScrollSupport: true,
  });
  pageFlip.loadFromHTML(container.querySelectorAll(".page"));
  return pageFlip;
}

function initFlipbookMode(story, currentChap, pageCount) {
  const modeScrollBtn = $("#mode-scroll");
  const modeFlipBtn = $("#mode-flip");
  const flipWrap = $("#flipbook-wrap");
  const strip = $("#reader-strip");
  if (!modeScrollBtn || !modeFlipBtn) return;

  let pageFlipInstance = null;

  modeFlipBtn.addEventListener("click", () => {
    if (typeof St === "undefined") {
      if (typeof showToast === "function") showToast("Không tải được chế độ lật trang, kiểm tra kết nối mạng.");
      return;
    }
    modeFlipBtn.classList.add("active");
    modeScrollBtn.classList.remove("active");
    strip.style.display = "none";
    flipWrap.classList.add("active");

    if (!pageFlipInstance) {
      pageFlipInstance = buildFlipbook(story, currentChap, pageCount);
      if (!pageFlipInstance) return;
      const countEl = $("#flip-page-count");
      countEl.textContent = `1 / ${pageFlipInstance.getPageCount()}`;
      pageFlipInstance.on("flip", (e) => {
        countEl.textContent = `${e.data + 1} / ${pageFlipInstance.getPageCount()}`;
      });
      $("#flip-prev").addEventListener("click", () => pageFlipInstance.flipPrev());
      $("#flip-next").addEventListener("click", () => pageFlipInstance.flipNext());
    }
  });

  modeScrollBtn.addEventListener("click", () => {
    modeScrollBtn.classList.add("active");
    modeFlipBtn.classList.remove("active");
    strip.style.display = "";
    flipWrap.classList.remove("active");
  });
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

/* ---------- Trang Thể Loại (gallery) ---------- */
function buildGenreStats() {
  return ALL_GENRES.map((name) => {
    const stories = STORIES.filter((s) => s.genres.includes(name));
    const totalViews = stories.reduce((sum, s) => sum + s.views, 0);
    const cover = [...stories].sort((a, b) => b.views - a.views)[0];
    return { name, count: stories.length, totalViews, cover: cover ? cover.cover : "" };
  });
}

function initGenrePage() {
  const stats = buildGenreStats().sort((a, b) => b.totalViews - a.totalViews);
  const featured = stats[0];
  const rest = stats.slice(1);

  const featuredLink = $("#genre-featured");
  featuredLink.href = `list.html?genre=${encodeURIComponent(featured.name)}`;
  $("#genre-featured-img").src = featured.cover;
  $("#genre-featured-img").alt = featured.name;
  $("#genre-featured-name").textContent = featured.name;
  $("#genre-featured-count").textContent = `${featured.count} truyện · ${fmtViews(featured.totalViews)} lượt xem`;

  $("#genre-tile-grid").innerHTML = rest.map((g) => `
    <a class="genre-tile" href="list.html?genre=${encodeURIComponent(g.name)}">
      <img src="${g.cover}" alt="${g.name}" loading="lazy">
      <div class="info">
        <div class="name">${g.name}</div>
        <div class="count">${g.count} truyện</div>
      </div>
    </a>
  `).join("");
}

/* ---------- Trang Bảng Xếp Hạng đầy đủ (top.html) ---------- */
function initTopPage() {
  renderRankingPodium();

  const genreSelect = $("#top-genre");
  const statusSelect = $("#top-status");
  const sortSelect = $("#top-sort");
  const grid = $("#top-grid");
  if (!grid) return;

  genreSelect.innerHTML = `<option value="Tất Cả">Tất cả thể loại</option>` +
    ALL_GENRES.map((g) => `<option value="${g}">${g}</option>`).join("");

  function apply() {
    let list = STORIES.filter((s) => {
      const genreOk = genreSelect.value === "Tất Cả" || s.genres.includes(genreSelect.value);
      const statusOk = statusSelect.value === "Tất Cả" || s.status === statusSelect.value;
      return genreOk && statusOk;
    });
    if (sortSelect.value === "views") list.sort((a, b) => b.views - a.views);
    if (sortSelect.value === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortSelect.value === "chapters") list.sort((a, b) => b.chapterCount - a.chapterCount);
    renderGrid(grid, list.slice(0, 12));
  }
  [genreSelect, statusSelect, sortSelect].forEach((el) => el.addEventListener("change", apply));
  apply();

  const tabDay = $("#tab-week");
  const tabMonth = $("#tab-month");
  const miniList = $("#mini-rank-list");
  function renderMini(list) {
    miniList.innerHTML = list.slice(0, 6).map((s, i) => `
      <a class="mini-rank-row" href="story.html?id=${s.id}">
        <span class="num">${i + 1}</span>
        <img class="thumb" src="${s.cover}" alt="${s.title}">
        <span class="info">
          <span class="name">${s.title}</span>
          <span class="stat">${fmtViews(s.views)} lượt xem</span>
        </span>
      </a>
    `).join("");
  }
  const weekOrder = [...STORIES].sort((a, b) => b.rating - a.rating || b.views - a.views);
  const monthOrder = [...STORIES].sort((a, b) => b.chapterCount - a.chapterCount || b.views - a.views);
  renderMini(weekOrder);
  tabDay.addEventListener("click", () => {
    tabDay.classList.add("active"); tabMonth.classList.remove("active");
    renderMini(weekOrder);
  });
  tabMonth.addEventListener("click", () => {
    tabMonth.classList.add("active"); tabDay.classList.remove("active");
    renderMini(monthOrder);
  });
}

/* ---------- Trang Lịch Sử Đọc ---------- */
function initHistoryPage() {
  const user = getCurrentUser();
  const guestNotice = $("#history-guest-notice");
  const list = $("#history-list");
  const empty = $("#history-empty");
  const clearBtn = $("#history-clear-btn");

  if (!user) {
    guestNotice.style.display = "block";
    return;
  }
  $("#history-root").style.display = "block";

  function render() {
    const hist = getHistory();
    if (!hist.length) {
      list.innerHTML = "";
      empty.style.display = "block";
      clearBtn.style.display = "none";
      return;
    }
    empty.style.display = "none";
    clearBtn.style.display = "inline-flex";
    list.innerHTML = hist.map((h) => {
      const s = getStoryById(h.storyId);
      if (!s) return "";
      const date = new Date(h.time);
      const daysAgo = Math.floor((Date.now() - h.time) / 86400000);
      return `
      <div class="history-card">
        <img src="${s.cover}" alt="${s.title}">
        <div class="info">
          <div class="title">${s.title}</div>
          <div class="chap">Đã đọc: Chương ${h.chapterNumber}</div>
          <div class="time">${fmtDaysAgo(daysAgo)}</div>
        </div>
        <a class="btn btn-outline" href="read.html?id=${s.id}&chap=${h.chapterNumber}">Đọc Tiếp</a>
      </div>`;
    }).join("");
  }

  clearBtn.addEventListener("click", () => {
    clearHistory();
    render();
  });

  render();
}

/* ---------- Truyện cập nhật / Truyện full ---------- */
function initUpdatedPage() {
  const list = [...STORIES].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo);
  renderGrid($("#grid-updated"), list);
  const ctaBtn = $("#cta-read-now");
  if (ctaBtn && list[0]) ctaBtn.href = `read.html?id=${list[0].id}&chap=${list[0].chapters[0].number}`;
}
function initCompletedPage() {
  const list = STORIES.filter((s) => s.status === "Hoàn Thành");
  renderGrid($("#grid-completed"), list, "Chưa có truyện nào hoàn thành.");
  const ctaBtn = $("#cta-read-now");
  if (ctaBtn && list[0]) ctaBtn.href = `read.html?id=${list[0].id}&chap=${list[0].chapters[0].number}`;
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
  if (page === "genre") initGenrePage();
  if (page === "top") initTopPage();
  if (page === "history") initHistoryPage();
  if (page === "updated") initUpdatedPage();
  if (page === "completed") initCompletedPage();
});
