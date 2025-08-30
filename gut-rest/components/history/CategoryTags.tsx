import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DailySummary } from "@/types";
import { BorderRadius, Spacing } from "@/styles/globals";

interface CategoryTagsProps {
  entries: DailySummary["entries"];
}

export function CategoryTags({ entries }: CategoryTagsProps) {
  const tagBackground = useThemeColor(
    { light: "#F2F2F7", dark: "#3C3C43" },
    "background"
  );
  const tagTextColor = useThemeColor(
    { light: "#666", dark: "#A0A0A0" },
    "text"
  );
  const countColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );

  // Calculate category counts
  const categoryCount = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoryCount).sort(
    ([, a], [, b]) => b - a
  ); // Sort by count descending

  if (categoryEntries.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {categoryEntries.map(([category, count]) => {
        const label = category.replace("_", " ");
        return (
          <ThemedView
            key={category}
            style={[styles.tag, { backgroundColor: tagBackground }]}
          >
            <ThemedText style={[styles.tagText, { color: tagTextColor }]}>
              {label}
            </ThemedText>
            {count > 1 && (
              <ThemedText style={[styles.countText, { color: countColor }]}>
                {count}
              </ThemedText>
            )}
          </ThemedView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    maxWidth: "60%", // Limit width to prevent taking up too much space
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 16,
    textAlign: "center",
  },
});
