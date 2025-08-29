import React from "react";
import { StyleSheet, ScrollView, RefreshControl } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DailySummary } from "@/types";
import { CompactMealEntry } from "./CompactMealEntry";
import { DaySummaryCard } from "./DaySummaryCard";
import { EmptyHistoryView } from "./EmptyHistoryView";
import { GlobalStyles, Spacing } from "@/styles/globals";

interface CompactHistoryViewProps {
  dailySummary: DailySummary | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  currentDate: string;
}

export function CompactHistoryView({
  dailySummary,
  isLoading,
  error,
  onRefresh,
  currentDate,
}: CompactHistoryViewProps) {
  if (error) {
    return (
      <ThemedView style={[GlobalStyles.emptyState, styles.errorContainer]}>
        <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Something went wrong
        </ThemedText>
        <ThemedText style={styles.errorMessage}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!dailySummary || dailySummary.entries.length === 0) {
    return (
      <EmptyHistoryView
        currentDate={currentDate}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
    );
  }

  const { entries, fastingWindow, gaps } = dailySummary;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      }
    >
      {/* Day Summary Card */}
      <DaySummaryCard dailySummary={dailySummary} currentDate={currentDate} />

      {/* Compact Timeline */}
      <ThemedView style={styles.timelineSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Timeline
        </ThemedText>

        <ThemedView style={styles.timeline}>
          {entries.map((entry, index) => (
            <CompactMealEntry
              key={entry.id}
              entry={entry}
              isFirst={index === 0}
              isLast={index === entries.length - 1}
              gap={gaps.find(
                (g) =>
                  g.startTime === entry.timestamp &&
                  index < entries.length - 1 &&
                  g.endTime === entries[index + 1].timestamp
              )}
            />
          ))}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  timelineSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    opacity: 0.8,
  },
  timeline: {
    backgroundColor: "transparent",
  },
  errorContainer: {
    paddingHorizontal: Spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: Spacing.md,
    opacity: 0.6,
  },
  errorTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
    opacity: 0.7,
    maxWidth: 280,
    lineHeight: 20,
  },
});
