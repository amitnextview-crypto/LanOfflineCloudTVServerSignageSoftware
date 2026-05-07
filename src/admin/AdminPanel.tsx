import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import CmsAccessCard from "./CmsAccessCard";
import { findCMS } from "../services/serverService";

export default function AdminPanel({ visible, onClose }: any) {
  const slide = useRef(new Animated.Value(400)).current;
  const [server, updateServer] = useState("");

  useEffect(() => {
    async function init() {
      const url = await findCMS();
      if (url) updateServer(url);
    }
    init();
  }, []);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : 400,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slide, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateX: slide }] }]}>
      <View style={styles.header}>
        <Text style={styles.title}>QR CMS</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>X</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <CmsAccessCard compact />
        {server ? (
          <WebView
            source={{ uri: server }}
            style={styles.webview}
            onMessage={(event) => {
              if (event.nativeEvent.data === "CONFIG_SAVED") onClose();
            }}
          />
        ) : (
          <Text style={styles.emptyText}>QR CMS is starting...</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "90%",
    backgroundColor: "#111",
  },
  header: {
    height: 60,
    backgroundColor: "#222",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  close: { color: "#fff", fontSize: 24 },
  content: { flex: 1, padding: 10 },
  webview: { flex: 1, marginTop: 10 },
  emptyText: { color: "#fff", marginTop: 10 },
});
