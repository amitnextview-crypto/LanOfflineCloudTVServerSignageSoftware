export const SOURCE_TYPES = {
  multimedia: "multimedia",
  web: "web",
  youtube: "youtube",
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
