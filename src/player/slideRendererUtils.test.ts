import {
  areMediaListsEqual,
  buildListSignature,
  shouldPreferStreamingForVideo,
} from "./slideRendererUtils";

describe("slideRendererUtils", () => {
  test("treats same path with new content metadata as a new playlist item", () => {
    const oldList = [
      {
        url: "/media/section-1/intro.mp4",
        originalName: "intro.mp4",
        type: "video/mp4",
        size: 100,
        mtimeMs: 1000,
      },
    ];
    const newList = [
      {
        url: "/media/section-1/intro.mp4",
        originalName: "intro.mp4",
        type: "video/mp4",
        size: 200,
        mtimeMs: 2000,
      },
    ];

    expect(areMediaListsEqual(oldList, newList)).toBe(false);
    expect(buildListSignature(oldList)).not.toBe(buildListSignature(newList));
  });

  test("prefers HTTP streaming for CMS videos", () => {
    expect(
      shouldPreferStreamingForVideo(
        {
          url: "/media/section-1/large-video.mkv",
          originalName: "large-video.mkv",
          size: 2 * 1024 * 1024 * 1024,
        },
        "http://192.168.1.10:8080"
      )
    ).toBe(true);
  });
});
