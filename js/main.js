// 超軽量Markdown変換（最小）
// ※本格的にやるなら marked.js 等を導入してもOK（学習目的ならまずこれで十分）

// BASE URLを動的に検出（ローカルと GitHub Pages両対応）
function detectBaseUrl() {
  const href = window.location.href;
  // /my_website/ が含まれていたら GitHub Pages
  if (href.includes("/my_website/")) {
    return "/my_website/";
  }
  // localhost or file:// はローカル
  return "./";
}

const BASE_URL = detectBaseUrl();

function mdToHtml(md) {
  // エスケープ（最低限）
  const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // code block ``` ```
  md = md.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${esc(code.trim())}</code></pre>`);

  // inline code
  md = md.replace(/`([^`]+)`/g, (_, c) => `<code>${esc(c)}</code>`);

  // headings
  md = md.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  md = md.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  md = md.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // images ![alt](url)
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // Convert relative paths (../../assets/...) preserving them but with BASE_URL
    if (src.includes("../../assets/")) {
      src = BASE_URL + "assets/" + src.split("/assets/")[1];
    }
    return `<p><img alt="${alt}" src="${src}" style="max-width:100%;border-radius:14px;border:1px solid var(--line);" /></p>`;
  });

  // links [text](url)
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);

  // paragraphs (空行区切り)
  const blocks = md.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(b => {
    // すでにHTML（h/pre等）ならそのまま
    if (/^<h[1-3]>/.test(b) || /^<pre>/.test(b) || /^<p><img/.test(b)) return b;
    // 改行は<br>
    return `<p>${b.replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}

// 各セクションの一覧（追加したらここにファイル名を追記するだけ）
const CONTENT_INDEX = {
  blog: [
    { file: "2026-01-01.md", title: "生き方", date: "2026-01-01"},
  ],
  stamps: [
    { file: "stamp-001.md", title: "ペキニーズ", date: "2025-11-26" },
    { file: "stamp-002.md", title: "ミニチュアダックスフンド", date: "2025-11-26" },
    { file: "stamp-003.md", title: "2026年午年", date: "2025-12-29" },
    { file: "stamp-004.md", title: "casual bar be", date: "2025-12-31" },
  ],
  photos: [
    { file: "photo-001.md", title: "雲海", date: "2025-11-29"},
    { file: "photo-002.md", title: "折り紙", date: "2025-12-16"},
  ],
};

async function loadMd(section, file) {
  const res = await fetch(`content/${section}/${file}`);
  if (!res.ok) throw new Error("Failed to load markdown");
  return await res.text();
}

async function show(section, item, metaEl, articleEl) {
  metaEl.textContent = `${item.date}`;
  const md = await loadMd(section, item.file);
  articleEl.innerHTML = mdToHtml(md);
}

function renderList(section, listEl, metaEl, articleEl) {
  const items = CONTENT_INDEX[section] ?? [];
  listEl.innerHTML = "";
  items.forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="item-meta">${it.date}</div>
      <div class="item-title"><a class="item-link" href="#${encodeURIComponent(it.file)}">${it.title}</a></div>
      <div class="item-excerpt">${it.excerpt || ""}</div>
    `;
    const titleLink = div.querySelector('.item-link');
    titleLink.addEventListener("click", async (e) => {
      e.preventDefault();
      location.hash = encodeURIComponent(it.file);
      await show(section, it, metaEl, articleEl);
    });
    listEl.appendChild(div);

    // 初回は先頭を表示
    if (idx === 0 && !location.hash) {
      show(section, it, metaEl, articleEl).catch(()=>{});
    }
  });
}

// ハッシュで直接アクセス（URL共有も可能）
async function handleHash(section, metaEl, articleEl) {
  const file = decodeURIComponent(location.hash.replace("#", ""));
  if (!file) return;
  const items = CONTENT_INDEX[section] ?? [];
  const hit = items.find(x => x.file === file);
  if (hit) await show(section, hit, metaEl, articleEl);
}

window.ZEN = {
  renderSection: ({ section, listEl, articleEl, metaEl }) => {
    renderList(section, listEl, metaEl, articleEl);
    window.addEventListener("hashchange", () => {
      handleHash(section, metaEl, articleEl).catch(()=>{});
    });
    handleHash(section, metaEl, articleEl).catch(()=>{});
  }
};
