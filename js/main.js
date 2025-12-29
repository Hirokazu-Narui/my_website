// 超軽量Markdown変換（最小）
// ※本格的にやるなら marked.js 等を導入してもOK（学習目的ならまずこれで十分）
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
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, `<p><img alt="$1" src="$2" style="max-width:100%;border-radius:14px;border:1px solid var(--line);" /></p>`);

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
    { file: "2025-12-29.md", title: "余白の練習", date: "2025-12-29", excerpt: "短い文章で、静けさを残す。" },
  ],
  stamps: [
    { file: "stamp-001.md", title: "LINEスタンプ #001", date: "2025-12-29", excerpt: "制作の意図とリンク。" },
  ],
  photos: [
    { file: "photo-001.md", title: "写真 #001", date: "2025-12-29", excerpt: "キャプションは最小限。" },
  ],
};

async function loadMd(section, file) {
  const res = await fetch(`content/${section}/${file}`);
  if (!res.ok) throw new Error("Failed to load markdown");
  return await res.text();
}

async function show(section, item, metaEl, articleEl) {
  metaEl.textContent = `${item.date} / ${item.file}`;
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
      <div class="item-title">${it.title}</div>
      <div class="item-excerpt">${it.excerpt || ""}</div>
      <a href="#${encodeURIComponent(it.file)}">読む</a>
    `;
    div.querySelector("a").addEventListener("click", async (e) => {
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
