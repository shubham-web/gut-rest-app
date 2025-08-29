import React from "react";
import { StyleSheet, RefreshControl, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  getTodayDateString,
  getDateStringWithOffset,
} from "@/services/dateUtils";
import { GlobalStyles, Spacing } from "@/styles/globals";

interface EmptyHistoryViewProps {
  currentDate: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export function EmptyHistoryView({
  currentDate,
  onRefresh,
  isLoading,
}: EmptyHistoryViewProps) {
  const subtleTextColor = useThemeColor(
    { light: "#666", dark: "#A0A0A0" },
    "text"
  );

  const getEmptyMessage = () => {
    const today = getTodayDateString();
    const yesterday = getDateStringWithOffset(today, -1);

    if (currentDate === today) {
      return {
        icon: "🍽️",
        title: "No meals logged today",
        message:
          "Start tracking your meals by adding your first entry on the Timeline tab.",
      };
    } else if (currentDate === yesterday) {
      return {
        icon: "📅",
        title: "No meals logged yesterday",
        message: "Yesterday had no meal entries recorded.",
      };
    } else {
      const date = new Date(currentDate);
      const dateStr = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });

      return {
        icon: "📖",
        title: `No meals logged on ${dateStr}`,
        message: "This day had no meal entries recorded in your history.",
      };
    }
  };

  const { icon, title, message } = getEmptyMessage();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[GlobalStyles.emptyState, styles.content]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      }
    >
      <ThemedText style={styles.emptyIcon}>{icon}</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.emptyMessage, { color: subtleTextColor }]}>
        {message}
      </ThemedText>

      {currentDate !== getTodayDateString() && (
        <ThemedView style={styles.hintContainer}>
          <ThemedText style={[styles.hintText, { color: subtleTextColor }]}>
            Swipe left or right to navigate between dates
          </ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: Spacing.lg,
    opacity: 0.5,
    lineHeight: 80,
    includeFontPadding: false,
  },
  emptyTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
    opacity: 0.7,
    maxWidth: 280,
    lineHeight: 20,
  },
  hintContainer: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
});
