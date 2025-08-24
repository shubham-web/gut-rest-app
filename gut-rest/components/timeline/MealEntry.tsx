import React from "react";
import { StyleSheet, Pressable, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MealEntry as MealEntryType } from "@/types";
import { getCategoryConfig } from "@/constants/MealCategories";
import { GlobalStyles, Spacing, BorderRadius } from "@/styles/globals";
import { useColorScheme } from "@/hooks/useColorScheme";

interface MealEntryProps {
  entry: MealEntryType;
  onDelete?: (id: string) => void;
  onEdit?: (entry: MealEntryType) => void;
}

export function MealEntry({ entry, onDelete, onEdit }: MealEntryProps) {
  const colorScheme = useColorScheme();
  const categoryConfig = getCategoryConfig(entry.category);

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

  const renderRightActions = () => (
    <ThemedView style={styles.deleteAction}>
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <ThemedText style={styles.deleteText}>Delete</ThemedText>
      </Pressable>
    </ThemedView>
  );

  const entryContent = (
    <ThemedView style={styles.entryWrapper}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.categoryInfo}>
            <ThemedText style={styles.categoryIcon}>
              {categoryConfig.icon}
            </ThemedText>
            <ThemedView style={styles.textContainer}>
              <ThemedText type="defaultSemiBold" style={styles.categoryLabel}>
                {categoryConfig.label}
              </ThemedText>
              <ThemedText style={styles.timestamp}>
                {formatTime(entry.timestamp)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView
            style={[
              styles.categoryDot,
              { backgroundColor: categoryConfig.color },
            ]}
          />
        </ThemedView>

        {entry.notes && (
          <ThemedView style={styles.notesContainer}>
            <ThemedText style={styles.notes}>{entry.notes}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Timeline line on the right */}
      <ThemedView style={styles.timelineLine} />
    </ThemedView>
  );

  if (onDelete) {
    return (
      <Swipeable renderRightActions={renderRightActions}>
        <ThemedView style={styles.pressable}>
          <Pressable onPress={handleEdit} style={styles.swipeableContent}>
            {entryContent}
          </Pressable>
        </ThemedView>
      </Swipeable>
    );
  }

  return (
    <Pressable onPress={handleEdit} style={styles.pressable}>
      {entryContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: Spacing.sm,
  },
  swipeableContent: {
    flex: 1,
  },
  entryWrapper: {
    flexDirection: "row",
    alignItems: "stretch",
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: 12,
    // Clean shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
    lineHeight: 30,
    includeFontPadding: false,
  },
  textContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 2,
    color: "#000",
  },
  timestamp: {
    fontSize: 14,
    opacity: 0.7,
    color: "#666",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    paddingLeft: 32, // Align with text content
  },
  notes: {
    fontSize: 14,
    opacity: 0.8,
    fontStyle: "italic",
    color: "#666",
  },
  timelineLine: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#E0E0E0",
  },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: BorderRadius.lg,
    marginLeft: Spacing.sm,
  },
  deleteButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  deleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
