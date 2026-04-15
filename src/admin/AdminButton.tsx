import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  onOpen: () => void;
  side?: "left" | "right";
  label?: string;
  icon?: string;
  hasTVPreferredFocus?: boolean;
  focusable?: boolean;
};

export default function AdminButton({
  onOpen,
  side = "left",
  label,
  icon = "\u2699",
  hasTVPreferredFocus = false,
  focusable = true,
}: Props) {
  const compact = !label;
  const [focused, setFocused] = useState(false);
  const isRight = side === "right";
  const baseColor = isRight ? "#ffb225" : "#e29a19";
  const accentColor = "#ffd24a";
  const activeColor = focused ? accentColor : baseColor;
  const shellSize = compact ? 24 : 29;
  return (
    <TouchableOpacity
      onPress={onOpen}
      activeOpacity={0.78}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      focusable={focusable}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={{
        position: "absolute",
        bottom: 16,
        ...(side === "right" ? { right: 16 } : { left: 16 }),
        width: shellSize,
        height: shellSize,
        justifyContent: "center",
        opacity: focused ? 1 : focusable ? 0.96 : 0.7,
        alignItems: "center",
        backgroundColor: focused
          ? "rgba(96, 58, 4, 0.98)"
          : isRight
            ? "rgba(64, 37, 4, 0.94)"
            : "rgba(54, 33, 4, 0.94)",
        borderRadius: 999,
        borderWidth: focused ? 2 : 1.5,
        borderColor: focused ? accentColor : `${baseColor}cc`,
        shadowColor: accentColor,
        shadowOpacity: focused ? 0.55 : 0.18,
        shadowRadius: focused ? 12 : 4,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Text
        style={{
          fontSize: compact ? 10 : 8,
          color: activeColor,
          fontWeight: "800",
          textShadowColor: focused ? accentColor : baseColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: focused ? 14 : 8,
        }}
      >
        {icon}
      </Text>
      {label ? (
        <Text
          style={{
            fontSize: 9,
            color: activeColor,
            fontWeight: "800",
            textShadowColor: focused ? accentColor : baseColor,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: focused ? 8 : 4,
          }}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
