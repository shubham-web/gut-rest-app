import React from "react";
import { StyleSheet, Pressable, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MealEntry as MealEntryType } from "@/types";
import { getCategoryConfig } from "@/constants/MealCategories";
import { GlobalStyles, Spacing, BorderRadius } from "@/styles/globals";
import { useColorScheme } from "@/hooks/useColorScheme";

interface MealEntryProps {
  entry: MealEntryType;
  onDelete?: (id: string) => void;
  onEdit?: (entry: MealEntryType) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function MealEntry({
  entry,
  onDelete,
  onEdit,
  isFirst = false,
  isLast = false,
}: MealEntryProps) {
  const colorScheme = useColorScheme();
  const categoryConfig = getCategoryConfig(entry.category);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const subtleTextColor = useThemeColor(
    { light: "#8E8E93", dark: "#8E8E93" },
    "text"
  );
  const timelineColor = useThemeColor(
    { light: "#E5E5E7", dark: "#38383A" },
    "text"
  );

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      `Are you sure you want to delete this ${categoryConfig.label.toLowerCase()} entry?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(entry.id),
        },
      ]
    );
  };

  const handleEdit = () => {
    onEdit?.(entry);
  };

  const entryContent = (
    <ThemedView style={styles.entryRow}>
      {/* Time Column */}
      <ThemedView style={styles.timeColumn}>
        <ThemedText style={[styles.timeText, { color: subtleTextColor }]}>
          {formatTime(entry.timestamp)}
        </ThemedText>
      </ThemedView>

      {/* Timeline Dot */}
      <ThemedView style={styles.dotColumn}>
        <ThemedView
          style={[
            styles.timelineDot,
            {
              backgroundColor: categoryConfig.color,
              borderColor: backgroundColor,
            },
          ]}
        />
      </ThemedView>

      {/* Content Column */}
      <ThemedView style={styles.contentColumn}>
        <ThemedView style={styles.mealContent}>
          <ThemedText style={styles.mealIcon}>{categoryConfig.icon}</ThemedText>
          <ThemedView style={styles.mealText}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.mealLabel, { color: textColor }]}
            >
              {categoryConfig.label}
            </ThemedText>
            {entry.notes && (
              <ThemedText
                style={[styles.mealNotes, { color: subtleTextColor }]}
                numberOfLines={2}
              >
                {entry.notes}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  return (
    <Pressable
      onPress={handleEdit}
      onLongPress={onDelete ? handleDelete : undefined}
      delayLongPress={500}
    >
      {entryContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 60,
  },
  timeColumn: {
    width: 80,
    alignItems: "flex-end",
    paddingRight: Spacing.md,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "right",
  },
  dotColumn: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000000", // This will be overridden by theme
    zIndex: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  mealContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
    lineHeight: 24,
    includeFontPadding: false,
  },
  mealText: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
  mealNotes: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: "italic",
    marginTop: 2,
    lineHeight: 18,
  },
});
