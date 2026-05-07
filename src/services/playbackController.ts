import type { AppConfig } from "../types/config";
import {
  clearPlaybackOverride,
  setPlaybackOverride,
  type MediaItem,
} from "./mediaService";

const USB_SOURCE_ID = "usb";
const INSTANT_STREAM_SOURCE_ID = "instant-stream";

export class PlaybackController {
  playUsbPlaylist(playlist: MediaItem[]) {
    setPlaybackOverride(USB_SOURCE_ID, playlist);
  }

  stopUsbPlayback() {
    clearPlaybackOverride(USB_SOURCE_ID);
  }

  playInstantStream(item: MediaItem) {
    setPlaybackOverride(INSTANT_STREAM_SOURCE_ID, [item]);
  }

  stopInstantStream() {
    clearPlaybackOverride(INSTANT_STREAM_SOURCE_ID);
  }

  buildUsbConfig(baseConfig: AppConfig | any) {
    const sourceSection = baseConfig?.sections?.[0] || {};
    return {
      ...baseConfig,
      orientation: baseConfig?.orientation || "horizontal",
      layout: "fullscreen",
      bgColor: baseConfig?.bgColor || "#000000",
      ticker: {
        ...(baseConfig?.ticker || {}),
        text: "",
      },
      sections: [
        {
          ...sourceSection,
          sourceType: "multimedia",
          sourceUrl: "",
          usbFitMode: "cover",
          slideDuration: Number(sourceSection?.slideDuration || baseConfig?.slideDuration || 5),
        },
      ],
    };
  }
}
