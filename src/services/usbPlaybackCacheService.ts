import RNFS from "react-native-fs";
import type { UsbState } from "./usbManagerModule";

const USB_CACHE_ROOT = `${RNFS.DocumentDirectoryPath}/usb-cache`;

export async function getUsbStateForPlayback(rawState: UsbState): Promise<UsbState> {
  return {
    ...rawState,
    mountPath: String(rawState?.mountPath || ""),
    mountPaths: Array.isArray(rawState?.mountPaths) ? rawState.mountPaths : [],
    playlist: Array.isArray(rawState?.playlist) ? rawState.playlist : [],
    hasPlayableMedia: !!rawState?.hasPlayableMedia,
  };
}

export function warmUsbPlaybackCache(rawState: UsbState): Promise<UsbState | null> {
  return Promise.resolve(rawState?.hasPlayableMedia ? rawState : null);
}

export async function clearUsbPlaybackCache() {
  try {
    if (await RNFS.exists(USB_CACHE_ROOT)) {
      await RNFS.unlink(USB_CACHE_ROOT);
    }
  } catch {
    // ignore cleanup errors
  }
}
