import RNFS from "react-native-fs";
import type { MediaItem } from "./mediaService";
import type { UsbState } from "./usbManagerModule";

const USB_CACHE_ROOT = `${RNFS.DocumentDirectoryPath}/usb-cache`;
const USB_CACHE_MEDIA_ROOT = `${USB_CACHE_ROOT}/files`;
const USB_CACHE_INDEX_PATH = `${USB_CACHE_ROOT}/index.json`;

type CachedUsbItem = MediaItem & {
  cacheKey: string;
  localPath: string;
  cachedAt: number;
};

type UsbCacheIndex = {
  mountPath: string;
  savedAt: number;
  items: CachedUsbItem[];
};

let cacheIndexPromise: Promise<UsbCacheIndex | null> | null = null;
let warmCachePromise: Promise<UsbState | null> | null = null;

function normalizeFileUri(value: string) {
  const safeValue = String(value || "").trim();
  if (!safeValue) return "";
  return /^file:\/\//i.test(safeValue) ? safeValue : `file://${safeValue}`;
}

function safeName(value: string) {
  return String(value || "media.bin")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ")
    .trim() || "media.bin";
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function buildCacheKey(item: MediaItem) {
  return hashString(
    [
      String(item?.name || item?.originalName || ""),
      String(item?.type || ""),
      Number(item?.size || 0),
      Number(item?.mtimeMs || 0),
      String(item?.url || ""),
      String(item?.remoteUrl || ""),
      String(item?.localPath || ""),
    ].join("|")
  );
}

async function ensureCacheDirs() {
  await RNFS.mkdir(USB_CACHE_MEDIA_ROOT);
}

async function readCacheIndex(): Promise<UsbCacheIndex | null> {
  if (cacheIndexPromise) return cacheIndexPromise;
  cacheIndexPromise = (async () => {
    try {
      const exists = await RNFS.exists(USB_CACHE_INDEX_PATH);
      if (!exists) return null;
      const raw = await RNFS.readFile(USB_CACHE_INDEX_PATH, "utf8");
      const parsed = JSON.parse(String(raw || "{}"));
      const items = Array.isArray(parsed?.items) ? parsed.items : [];
      return {
        mountPath: String(parsed?.mountPath || ""),
        savedAt: Number(parsed?.savedAt || 0),
        items: items
          .filter((entry: any) => entry && typeof entry === "object")
          .map((entry: any) => ({
            ...entry,
            cacheKey: String(entry?.cacheKey || ""),
            localPath: String(entry?.localPath || ""),
            cachedAt: Number(entry?.cachedAt || 0),
          }))
          .filter((entry: CachedUsbItem) => !!entry.cacheKey && !!entry.localPath),
      };
    } catch {
      return null;
    } finally {
      cacheIndexPromise = null;
    }
  })();
  return cacheIndexPromise;
}

async function writeCacheIndex(index: UsbCacheIndex) {
  await ensureCacheDirs();
  await RNFS.writeFile(USB_CACHE_INDEX_PATH, JSON.stringify(index, null, 2), "utf8");
}

async function fileExists(path: string) {
  const safePath = String(path || "").trim();
  if (!safePath) return false;
  try {
    return await RNFS.exists(safePath);
  } catch {
    return false;
  }
}

function withLiveMetadata(item: MediaItem, cached: CachedUsbItem | undefined): MediaItem {
  if (!cached) return item;
  return {
    ...item,
    remoteUrl: normalizeFileUri(cached.localPath),
    localPath: cached.localPath,
  };
}

export async function getUsbStateForPlayback(rawState: UsbState): Promise<UsbState> {
  const safePlaylist = Array.isArray(rawState?.playlist) ? rawState.playlist : [];
  const index = await readCacheIndex();

  if (safePlaylist.length > 0) {
    const cacheByKey = new Map<string, CachedUsbItem>();
    for (const cached of index?.items || []) {
      if (await fileExists(cached.localPath)) {
        cacheByKey.set(cached.cacheKey, cached);
      }
    }
    return {
      ...rawState,
      hasPlayableMedia: true,
      playlist: safePlaylist.map((item) => withLiveMetadata(item, cacheByKey.get(buildCacheKey(item)))),
    };
  }

  return {
    ...rawState,
    mountPath: String(rawState?.mountPath || index?.mountPath || ""),
    mountPaths: Array.isArray(rawState?.mountPaths) ? rawState.mountPaths : [],
    playlist: [],
    hasPlayableMedia: false,
  };
}

export function warmUsbPlaybackCache(rawState: UsbState): Promise<UsbState | null> {
  const safePlaylist = Array.isArray(rawState?.playlist) ? rawState.playlist : [];
  if (!safePlaylist.length) return Promise.resolve(null);
  if (warmCachePromise) return warmCachePromise;

  warmCachePromise = (async () => {
    try {
      await ensureCacheDirs();
      const nextItems: CachedUsbItem[] = [];

      for (const item of safePlaylist) {
        const sourcePath = String(item?.localPath || "").trim();
        if (!sourcePath || !(await fileExists(sourcePath))) {
          continue;
        }

        const cacheKey = buildCacheKey(item);
        const targetPath = `${USB_CACHE_MEDIA_ROOT}/${cacheKey}_${safeName(
          String(item?.name || item?.originalName || "media.bin")
        )}`;

        if (!(await fileExists(targetPath))) {
          try {
            await RNFS.copyFile(sourcePath, targetPath);
          } catch {
            continue;
          }
        }

        nextItems.push({
          ...item,
          cacheKey,
          localPath: targetPath,
          remoteUrl: normalizeFileUri(targetPath),
          cachedAt: Date.now(),
        });
      }

      if (!nextItems.length) return null;

      const nextIndex: UsbCacheIndex = {
        mountPath: String(rawState?.mountPath || ""),
        savedAt: Date.now(),
        items: nextItems,
      };
      await writeCacheIndex(nextIndex);

      return {
        ...rawState,
        hasPlayableMedia: true,
        playlist: nextItems.map((item) => ({
          ...item,
          remoteUrl: normalizeFileUri(item.localPath),
          localPath: item.localPath,
        })),
      };
    } catch {
      return null;
    } finally {
      warmCachePromise = null;
    }
  })();

  return warmCachePromise;
}
