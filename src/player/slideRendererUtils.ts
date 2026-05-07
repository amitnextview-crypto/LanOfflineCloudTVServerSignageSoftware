export const SOURCE_TYPES = {
  multimedia: "multimedia",
  web: "web",
  youtube: "youtube",
  template: "template",
} as const;

export const VIDEO_FILE_RE = /\.(mp4|m4v|mov|mkv|webm)(\?.*)?$/i;

export function normalizeWebUrl(url: string) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function extractYoutubeId(url: string) {
  const value = String(url || "").trim();
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/i,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/i,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/i,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/i,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

export function normalizeYoutubeEmbedUrl(url: string) {
  const value = String(url || "").trim();
  if (!value) return "";
  const id = extractYoutubeId(value);
  if (!id) return "";
  return `https://www.youtube.com/watch?v=${id}&autoplay=1&mute=1&playsinline=1`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseTemplateItems(value: unknown) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

export function buildOrderTemplateHtml(template: any = {}) {
  const tpl = {
    name: "Queue Template",
    title: "Ready to Collect",
    subtitle: "Preparation of Orders",
    footer: "Welcome",
    prepTitle: "Prep",
    readyTitle: "Ready",
    prepItems: "705\n713\n715\n732\n771\n777",
    readyItems: "657\n653\n655\n144",
    primaryColor: "#f4f72a",
    secondaryColor: "#2695d8",
    accentColor: "#d92736",
    textColor: "#ffffff",
    backgroundColor: "#101010",
    panelColor: "#ffffff",
    fontSize: 54,
    layout: "classic",
    brandText: "",
    badgeText: "LIVE",
    prepTag: "Preparing",
    readyTag: "Ready",
    footerBadge: "NextView",
    prepTitleBgColor: "",
    readyTitleBgColor: "",
    prepListBgColor: "",
    readyListBgColor: "",
    ...(template && typeof template === "object" ? template : {}),
  };
  const prepItems = parseTemplateItems(tpl.prepItems);
  const readyItems = parseTemplateItems(tpl.readyItems);
  const fontSize = Math.max(24, Math.min(96, Number(tpl.fontSize || 54)));
  const styleId = ["classic", "split", "royal", "glass", "cinema", "executive"].includes(String(tpl.layout || ""))
    ? String(tpl.layout || "classic")
    : "classic";
  const split = styleId === "split" || styleId === "executive";
  const prepHtml = prepItems.map((item) => `<div class="item prep">${escapeHtml(item)}</div>`).join("");
  const readyHtml = readyItems
    .map((item, index) => `<div class="item ready ${index === 0 ? "hero-ready" : ""}">${escapeHtml(item)}</div>`)
    .join("");
  const imageData = String(tpl.imageData || "").trim();
  const imageHtml = imageData
    ? `<img class="brandImg" src="${escapeHtml(imageData)}" />`
    : `<div class="brandMark">${escapeHtml(tpl.brandText || String(tpl.name || "T").slice(0, 1))}</div>`;
  const prepTitleBg = escapeHtml(tpl.prepTitleBgColor || "rgba(0,0,0,.28)");
  const readyTitleBg = escapeHtml(tpl.readyTitleBgColor || "rgba(0,0,0,.28)");
  const prepListBg = escapeHtml(tpl.prepListBgColor || tpl.panelColor || "#ffffff");
  const readyListBg = escapeHtml(tpl.readyListBgColor || (styleId === "classic" ? "#090909" : tpl.panelColor || "#ffffff"));

  return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:${escapeHtml(tpl.backgroundColor)}}
body{font-family:Arial,"Segoe UI",sans-serif;color:${escapeHtml(tpl.textColor)}}
.wrap{width:100vw;height:100vh;padding:0;background:${escapeHtml(tpl.backgroundColor)};position:relative;overflow:hidden}
.screen{width:100%;height:100%;position:relative;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;background:radial-gradient(circle at 14% 10%,rgba(255,255,255,.16),transparent 32%),radial-gradient(circle at 86% 18%,rgba(255,255,255,.12),transparent 34%),linear-gradient(135deg,rgba(255,255,255,.08),${escapeHtml(tpl.backgroundColor)} 48%,#050609);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),inset 0 -22px 90px rgba(0,0,0,.35)}
.glow{position:absolute;width:26%;aspect-ratio:1;border-radius:50%;pointer-events:none;filter:blur(22px);opacity:.34;z-index:0}.g1{top:-9%;left:-6%;background:${escapeHtml(tpl.secondaryColor)}}.g2{right:-8%;bottom:-12%;background:${escapeHtml(tpl.primaryColor)}}
.top,.body,.footer{position:relative;z-index:1}.top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:clamp(8px,1.6vw,24px);padding:clamp(12px,2vw,34px) clamp(16px,3vw,54px);background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(0,0,0,.28));border-bottom:1px solid rgba(255,255,255,.14)}
.brandBlock{min-width:0;display:flex;align-items:center;justify-content:flex-start;gap:clamp(8px,1.4vw,22px)}
.centerTitle{min-width:0;max-width:none;color:${escapeHtml(tpl.textColor)};font-size:clamp(28px,4.4vw,90px);font-weight:900;text-align:center;text-transform:uppercase;text-shadow:0 3px 18px rgba(0,0,0,.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bag{min-width:clamp(52px,6.8vw,138px);padding:clamp(7px,.9vw,14px) clamp(10px,1.35vw,24px);border-radius:999px;color:#0b0d10;background:linear-gradient(135deg,#fff,${escapeHtml(tpl.accentColor)});box-shadow:0 12px 26px rgba(0,0,0,.34),inset 0 2px 0 rgba(255,255,255,.65);text-align:center;font-size:clamp(10px,1.05vw,20px);font-weight:900;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis}
.brandImg,.brandMark{width:clamp(42px,6vw,118px);height:clamp(42px,6vw,118px);border-radius:clamp(10px,1vw,18px);object-fit:cover;display:flex;align-items:center;justify-content:center;background:${escapeHtml(tpl.accentColor)};color:#111;font-size:clamp(18px,2.3vw,42px);font-weight:900;box-shadow:0 16px 34px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.58)}
.body{display:grid;grid-template-columns:${split ? "minmax(0,.92fr) minmax(0,1.08fr)" : "1fr 1fr"};gap:clamp(12px,2vw,34px);padding:clamp(14px,2.2vw,38px) clamp(16px,3vw,54px);min-height:0;perspective:1200px}
.col{position:relative;min-width:0;display:grid;grid-template-rows:auto minmax(0,1fr);border-radius:clamp(12px,1.4vw,24px);overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.04)),rgba(255,255,255,.12);box-shadow:0 26px 54px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.28)}
.title{display:flex;align-items:center;gap:clamp(7px,1vw,16px);padding:clamp(10px,1.4vw,24px) clamp(12px,1.8vw,30px);background:rgba(0,0,0,.28);font-size:clamp(13px,1.45vw,30px);font-weight:900;text-shadow:0 2px 12px rgba(0,0,0,.38)}.prepCol .title{background:${prepTitleBg}}.readyCol .title{background:${readyTitleBg}}.title span{flex:0 0 auto;padding:.35em .7em;border-radius:999px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.22);font-size:.66em;text-transform:uppercase}
.list{background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(238,243,250,.86)),${escapeHtml(tpl.panelColor)};color:#111;padding:clamp(12px,1.8vw,32px);display:grid;align-content:start;justify-items:start;gap:clamp(7px,1.1vw,18px);overflow:hidden}.prepCol .list{background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.18)),${prepListBg}}.readyCol .list{background:linear-gradient(180deg,rgba(255,255,255,.58),rgba(255,255,255,.08)),${readyListBg}}.classic .readyCol .list{background:linear-gradient(180deg,rgba(12,12,12,.78),rgba(4,4,4,.78)),${readyListBg}}
.item{min-width:min(12ch,100%);width:max-content;max-width:100%;min-height:1.22em;display:inline-flex;align-items:center;justify-content:center;border-radius:clamp(8px,.8vw,14px);padding:.18em .48em;background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.32));box-shadow:0 8px 18px rgba(0,0,0,.12);font-size:clamp(22px,4.8vw,${fontSize}px);line-height:1;font-weight:900;letter-spacing:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.prep{color:${escapeHtml(tpl.secondaryColor)}}.ready{color:${escapeHtml(tpl.primaryColor)}}.hero-ready{min-width:min(7ch,100%);padding:.14em .42em;font-size:clamp(38px,8vw,${Math.round(fontSize * 1.85)}px);text-align:center;margin:2% 0 4%}
.footer{min-height:clamp(46px,7vh,94px);padding:clamp(10px,1.45vw,24px) clamp(16px,3vw,54px);display:flex;justify-content:space-between;align-items:center;gap:clamp(10px,1.4vw,24px);background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72));border-top:1px solid rgba(255,255,255,.12);font-size:clamp(12px,1.45vw,28px)}.footer strong{flex:0 0 auto;color:#0b0d10;background:linear-gradient(135deg,#fff,${escapeHtml(tpl.primaryColor)});border-radius:999px;padding:.38em .82em;box-shadow:0 8px 18px rgba(0,0,0,.25)}.footer em{min-width:0;flex:1 1 auto;font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mark{width:42px;height:42px;border-radius:7px;background:${escapeHtml(tpl.accentColor)}}.empty{color:#667;font-weight:800}
.royal .screen{background:radial-gradient(circle at 52% -12%,rgba(255,255,255,.18),transparent 28%),linear-gradient(135deg,#130b2c,#071526 42%,#05070f)}.glass .col{background:rgba(255,255,255,.14)}.cinema .screen{background:linear-gradient(135deg,#090909,#211109 48%,#050505)}
@media (max-aspect-ratio: 4/3){.top{grid-template-columns:auto minmax(0,1fr) auto;padding:clamp(16px,3.2vw,44px) clamp(18px,4vw,58px)}.centerTitle{font-size:clamp(34px,7.2vw,96px)}.body,.split .body{grid-template-columns:1fr;gap:clamp(18px,3.2vw,42px);padding:clamp(18px,4vw,58px)}.title{font-size:clamp(20px,3.2vw,42px)}.list{gap:clamp(12px,2vw,26px)}.item{font-size:clamp(38px,8.6vw,${fontSize}px);padding:.2em .52em}.hero-ready{font-size:clamp(56px,13vw,${Math.round(fontSize * 1.85)}px)}.footer em{white-space:normal}}
</style>
</head>
<body>
<div class="wrap ${split ? "split" : "classic"} ${escapeHtml(styleId)}"><div class="screen">
<div class="glow g1"></div><div class="glow g2"></div>
<div class="top"><div class="brandBlock"><div class="icon">${imageHtml}</div></div><div class="centerTitle">${escapeHtml(tpl.name || "Display Board")}</div><div class="bag">${escapeHtml(tpl.badgeText || "LIVE")}</div></div>
<div class="body"><section class="col prepCol"><div class="title"><span>${escapeHtml(tpl.prepTag || "Preparing")}</span>${escapeHtml(tpl.subtitle || "Preparation of Orders")}</div><div class="list">${prepHtml || `<div class="empty">No prep orders</div>`}</div></section><section class="col readyCol"><div class="title"><span>${escapeHtml(tpl.readyTag || "Ready")}</span>${escapeHtml(tpl.title || "Ready to Collect")}</div><div class="list">${readyHtml || `<div class="empty">No ready orders</div>`}</div></section></div>
<div class="footer"><strong>${escapeHtml(tpl.footerBadge || "NextView")}</strong><em>${escapeHtml(tpl.footer || "")}</em><span class="mark"></span></div>
</div></div>
</body>
</html>`;
}

export function buildPdfViewerUrl(fileUrl: string, page: number, nonce?: string | number) {
  const safePage = Math.max(1, Number(page || 1));
  if (/^file:\/\//i.test(String(fileUrl || ""))) {
    return String(fileUrl || "");
  }
  const match = String(fileUrl || "").match(/^(https?:\/\/[^/]+)/i);
  const origin = match?.[1] || "";
  const stamp = nonce ? `&r=${encodeURIComponent(String(nonce))}` : "";
  if (origin) {
    return `${origin}/pdf-viewer.html?file=${encodeURIComponent(fileUrl)}&page=${safePage}${stamp}`;
  }
  return `/pdf-viewer.html?file=${encodeURIComponent(fileUrl)}&page=${safePage}${stamp}`;
}

export function normalizeMediaUri(value: string) {
  const uri = String(value || "").trim();
  if (!uri) return "";
  if (/^https?:\/\//i.test(uri)) {
    try {
      return encodeURI(uri);
    } catch {
      return uri;
    }
  }
  return uri;
}

export function isLocalPlayableUri(value: string) {
  return /^(file|content):\/\//i.test(String(value || "").trim());
}

export function isUsbSourceItem(item: any) {
  return (
    String(item?.sourceId || "").toLowerCase() === "usb" ||
    /^usb:\/\//i.test(String(item?.url || ""))
  );
}

export function buildRemoteMediaUri(server: string, pathValue: string, versionHint?: string | number) {
  const base = normalizeMediaUri(`${String(server || "").trim()}${String(pathValue || "").trim()}`);
  if (!base) return "";
  const stamp = String(versionHint || "").trim();
  if (!stamp) return base;
  return `${base}${base.includes("?") ? "&" : "?"}v=${encodeURIComponent(stamp)}`;
}

export function isVideoFile(item: any) {
  const mime = String(item?.type || "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  const value = String(
    item?.originalName || item?.name || item?.url || item?.remoteUrl || ""
  );
  return VIDEO_FILE_RE.test(value);
}

export function getMediaIdentity(item: any) {
  return [
    String(item?.url || ""),
    String(item?.originalName || item?.name || ""),
    String(item?.type || ""),
    String(item?.remoteUrl || ""),
    Number(item?.mtimeMs || 0),
    Number(item?.size || 0),
    Number(item?.page || 0),
  ].join("|");
}

export function getMediaContentIdentity(item: any) {
  return [
    String(item?.url || ""),
    String(item?.originalName || item?.name || ""),
    String(item?.type || ""),
    Number(item?.mtimeMs || 0),
    Number(item?.size || 0),
    Number(item?.page || 0),
  ].join("|");
}

export function getMediaStableIdentity(item: any) {
  return [
    String(item?.url || ""),
    String(item?.originalName || item?.name || ""),
    String(item?.type || ""),
    Number(item?.page || 0),
  ].join("|");
}

export function getMediaCacheIdentity(item: any) {
  return [
    String(item?.localPath || ""),
    String(item?.remoteUrl || ""),
  ].join("|");
}

export function shouldPreferStreamingForVideo(item: any, server: string) {
  const localUri = normalizeMediaUri(String(item?.remoteUrl || ""));
  return !!server && isVideoFile(item) && !isLocalPlayableUri(localUri);
}

export function buildListSignature(list: any[]) {
  if (!Array.isArray(list) || !list.length) return "empty";
  let hash = 0;
  const parts: string[] = [];
  for (const item of list) {
    const part = getMediaContentIdentity(item);
    parts.push(part);
    for (let i = 0; i < part.length; i += 1) {
      hash = (hash * 33 + part.charCodeAt(i)) | 0;
    }
  }
  return `${list.length}|${Math.abs(hash).toString(36)}|${parts.join("||")}`;
}

export function areMediaListsEqual(a: any[], b: any[]) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (getMediaContentIdentity(a[i]) !== getMediaContentIdentity(b[i])) {
      return false;
    }
    if (getMediaCacheIdentity(a[i]) !== getMediaCacheIdentity(b[i])) {
      return false;
    }
  }
  return true;
}

export function findMatchingIndex(list: any[], current: any, fallbackIndex = 0) {
  if (!Array.isArray(list) || !list.length) return 0;
  if (!current) return Math.min(fallbackIndex, list.length - 1);
  const currentIdentity = getMediaStableIdentity(current);
  const safeFallback = Math.min(Math.max(0, fallbackIndex), list.length - 1);
  if (getMediaStableIdentity(list[safeFallback]) === currentIdentity) {
    return safeFallback;
  }
  const matchedIndexes = list
    .map((item, idx) => (getMediaStableIdentity(item) === currentIdentity ? idx : -1))
    .filter((idx) => idx >= 0);
  if (matchedIndexes.length) {
    let closest = matchedIndexes[0];
    let bestDelta = Math.abs(matchedIndexes[0] - safeFallback);
    for (const idx of matchedIndexes) {
      const delta = Math.abs(idx - safeFallback);
      if (delta < bestDelta) {
        bestDelta = delta;
        closest = idx;
      }
    }
    return closest;
  }
  return Math.min(fallbackIndex, list.length - 1);
}
