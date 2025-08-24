import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlobalStyles, Spacing } from "@/styles/globals";
import { router } from "expo-router";

interface EmptyTimelineProps {
  onAddMeal?: () => void;
}

export function EmptyTimeline({ onAddMeal }: EmptyTimelineProps) {
  const handleAddMeal = () => {
    if (onAddMeal) {
      onAddMeal();
    } else {
      router.push("/quick-add");
    }
  };

  return (
    <ThemedView style={[GlobalStyles.emptyState, styles.container]}>
      <ThemedView style={styles.iconContainer}>
        <ThemedText style={styles.emptyIcon}>🍽️</ThemedText>
      </ThemedView>

      <ThemedText
        type="subtitle"
        style={[GlobalStyles.emptyStateTitle, styles.title]}
      >
        No meals logged yet
      </ThemedText>

      <ThemedText
        style={[GlobalStyles.emptyStateDescription, styles.description]}
      >
        Start tracking your meal timing to understand your eating patterns and
        optimize your digestive health.
      </ThemedText>

      <Pressable style={styles.ctaButton} onPress={handleAddMeal}>
        <ThemedText style={styles.ctaText}>Log Your First Meal</ThemedText>
      </Pressable>

      <ThemedView style={styles.tipsContainer}>
        <ThemedText style={styles.tipsTitle}>💡 Quick Tips:</ThemedText>
        <ThemedView style={styles.tipsList}>
          <ThemedText style={styles.tipItem}>
            • Aim for 3-4 hour gaps between meals
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • Track everything, even small snacks
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • Use the floating + button for quick logging
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 80,
    includeFontPadding: false,
  },
  title: {
    marginBottom: Spacing.md,
  },
  description: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: "#007AFF",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    marginBottom: Spacing.xl,
    ...GlobalStyles.shadowSmall,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  tipsContainer: {
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderRadius: 12,
    padding: Spacing.md,
    maxWidth: 300,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "center",
    lineHeight: 24,
    includeFontPadding: false,
  },
  tipsList: {
    alignItems: "flex-start",
  },
  tipItem: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
});
