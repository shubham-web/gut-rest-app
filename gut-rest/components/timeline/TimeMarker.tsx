import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Spacing } from "@/styles/globals";

interface TimeMarkerProps {
  time: Date;
  isNow?: boolean;
}

export function TimeMarker({ time, isNow = false }: TimeMarkerProps) {
  const textColor = useThemeColor({}, "text");
  const subtleTextColor = useThemeColor(
    { light: "#666", dark: "#A0A0A0" },
    "text"
  );
  const timelineColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const nowColor = useThemeColor({ light: "#FF3B30", dark: "#FF453A" }, "text");

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const markerColor = isNow ? nowColor : timelineColor;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.timeContainer}>
        <ThemedText
          style={[
            styles.timeText,
            { color: isNow ? nowColor : subtleTextColor },
            isNow && styles.nowText,
          ]}
        >
          {isNow ? "Now" : formatTime(time)}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.markerContainer}>
        <ThemedView
          style={[
            styles.markerDot,
            { backgroundColor: markerColor },
            isNow && styles.nowDot,
          ]}
        />
        <ThemedView
          style={[
            styles.markerLine,
            { backgroundColor: markerColor },
            isNow && styles.nowLine,
          ]}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.sm,
    height: 32,
  },
  timeContainer: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: Spacing.md,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
  nowText: {
    fontWeight: "600",
    opacity: 1,
    fontSize: 13,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  nowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: "#FF3B30",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerLine: {
    position: "absolute",
    width: 2,
    height: 32,
    opacity: 0.3,
    zIndex: 1,
  },
  nowLine: {
    opacity: 0.5,
    width: 3,
  },
});
