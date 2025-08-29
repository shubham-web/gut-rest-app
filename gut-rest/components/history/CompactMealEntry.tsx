import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MealEntry, TimeGap } from "@/types";
import { getCategoryConfig } from "@/constants/MealCategories";
import { Spacing } from "@/styles/globals";

interface CompactMealEntryProps {
  entry: MealEntry;
  isFirst: boolean;
  isLast: boolean;
  gap?: TimeGap;
}

export function CompactMealEntry({
  entry,
  isFirst,
  isLast,
  gap,
}: CompactMealEntryProps) {
  const categoryConfig = getCategoryConfig(entry.category);

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const subtleTextColor = useThemeColor(
    { light: "#666", dark: "#A0A0A0" },
    "text"
  );
  const timelineColor = useThemeColor(
    { light: "#E0E0E0", dark: "#3C3C3E" },
    "text"
  );

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Timeline dot and line */}
      <ThemedView style={styles.timelineContainer}>
        {!isFirst && (
          <ThemedView
            style={[styles.timelineLine, { backgroundColor: timelineColor }]}
          />
        )}
        <ThemedView
          style={[
            styles.timelineDot,
            { backgroundColor: categoryConfig.color },
          ]}
        />
        {!isLast && (
          <ThemedView
            style={[styles.timelineLine, { backgroundColor: timelineColor }]}
          />
        )}
      </ThemedView>

      {/* Content */}
      <ThemedView style={styles.content}>
        <ThemedView style={styles.entryInfo}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.categoryIcon}>
              {categoryConfig.icon}
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.categoryLabel, { color: textColor }]}
            >
              {categoryConfig.label}
            </ThemedText>
            <ThemedText style={[styles.timestamp, { color: subtleTextColor }]}>
              {formatTime(entry.timestamp)}
            </ThemedText>
          </ThemedView>

          {entry.notes && (
            <ThemedText style={[styles.notes, { color: subtleTextColor }]}>
              {entry.notes}
            </ThemedText>
          )}
        </ThemedView>

        {/* Gap indicator */}
        {gap && !isLast && (
          <ThemedView style={styles.gapContainer}>
            <ThemedText style={[styles.gapText, { color: subtleTextColor }]}>
              ⏱ {gap.durationFormatted}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  timelineContainer: {
    width: 20,
    alignItems: "center",
    position: "relative",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  timelineLine: {
    position: "absolute",
    width: 2,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  entryInfo: {
    paddingBottom: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.8,
  },
  notes: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 24, // Align with category label
    opacity: 0.7,
    fontStyle: "italic",
  },
  gapContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  gapText: {
    fontSize: 11,
    opacity: 0.6,
  },
});
