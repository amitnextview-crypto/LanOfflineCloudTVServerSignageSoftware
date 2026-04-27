import React from "react";
import { Animated, Image, ScrollView, Text } from "react-native";
import { WebView } from "react-native-webview";
import { buildPdfViewerUrl } from "./slideRendererUtils";

type Props = {
  transitionBackdrop: any;
  transitionAnimationType: string;
  sectionHasVideo: boolean;
  transitionDirection: string;
  backdropTranslateX: Animated.Value;
  backdropTranslateY: Animated.Value;
  slideTransitionDuration: number;
  styles: any;
};

export default function SlideRendererBackdrop({
  transitionBackdrop,
  transitionAnimationType,
  sectionHasVideo,
  transitionDirection,
  backdropTranslateX,
  backdropTranslateY,
  styles,
}: Props) {
  if (!transitionBackdrop) return null;
  const backFile = transitionBackdrop.file;
  if (!backFile || !transitionBackdrop.uri) return null;

  const backType = String(backFile?.type || "").toLowerCase();
  const backIsText =
    backType === "text" || /\.txt$/i.test(backFile?.originalName || backFile?.name || "");
  const backIsPdf =
    backType === "pdf" || /\.pdf$/i.test(backFile?.originalName || backFile?.name || "");

  if (!backIsText && !backIsPdf && transitionAnimationType === "slide") {
    return null;
  }

  const animatedBackdropStyle =
    transitionAnimationType === "slide" && !sectionHasVideo
      ? [
          styles.fillLayer,
          styles.transitionBackdrop,
          {
            transform: [
              {
                translateX:
                  transitionDirection === "left" || transitionDirection === "right"
                    ? backdropTranslateX
                    : 0,
              },
              {
                translateY:
                  transitionDirection === "top" || transitionDirection === "bottom"
                    ? backdropTranslateY
                    : 0,
              },
            ],
          },
        ]
      : [styles.fillLayer, styles.transitionBackdrop];

  if (backIsText) {
    return (
      <Animated.View pointerEvents="none" style={animatedBackdropStyle}>
        <ScrollView
          style={styles.media}
          contentContainerStyle={styles.textContentWrap}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.textContent}>
            {String(transitionBackdrop.textContent || "")}
          </Text>
        </ScrollView>
      </Animated.View>
    );
  }

  if (backIsPdf) {
    return (
      <Animated.View pointerEvents="none" style={animatedBackdropStyle}>
        <WebView
          source={{
            uri: buildPdfViewerUrl(
              transitionBackdrop.uri,
              Number(backFile?.page || 1),
              "transition"
            ),
          }}
          style={styles.media}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          mixedContentMode="always"
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View pointerEvents="none" style={animatedBackdropStyle}>
      <Image
        source={{ uri: transitionBackdrop.uri }}
        style={styles.media}
        resizeMode="stretch"
        fadeDuration={0}
      />
    </Animated.View>
  );
}
