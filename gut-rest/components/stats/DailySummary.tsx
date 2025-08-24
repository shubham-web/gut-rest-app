import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlobalStyles } from "@/styles/globals";
import { DailySummary as DailySummaryType } from "@/types";
import { TimeCalculationService } from "@/services/TimeCalculationService";

interface DailySummaryProps {
  summary: DailySummaryType | null;
  isLoading?: boolean;
}

export function DailySummary({
  summary,
  isLoading = false,
}: DailySummaryProps) {
  const stats = React.useMemo(() => {
    if (!summary) return null;
    return TimeCalculationService.getDailyStats(summary);
  }, [summary]);

  const eatingWindow = React.useMemo(() => {
    if (!summary || summary.entries.length < 2) return 0;
    return TimeCalculationService.calculateEatingWindow(summary.entries);
  }, [summary]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Today&apos;s Summary
        </ThemedText>
        <ThemedView style={styles.summaryGrid}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="title" style={styles.statNumber}>
              --
            </ThemedText>
            <ThemedText type="default" style={styles.statLabel}>
              Meals
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="title" style={styles.statNumber}>
              --
            </ThemedText>
            <ThemedText type="default" style={styles.statLabel}>
              Avg Gap
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="title" style={styles.statNumber}>
              --
            </ThemedText>
            <ThemedText type="default" style={styles.statLabel}>
              Longest Gap
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!summary || summary.entries.length === 0) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Today&apos;s Summary
        </ThemedText>
        <ThemedView style={styles.emptyState}>
          <ThemedText type="default" style={styles.emptyText}>
            No meals logged today
          </ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>
            Add your first meal to see insights
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle" style={styles.cardTitle}>
        Today&apos;s Summary
      </ThemedText>

      {/* Main Stats Grid */}
      <ThemedView style={styles.summaryGrid}>
        <ThemedView style={styles.statItem}>
          <ThemedText type="title" style={styles.statNumber}>
            {summary.totalEntries}
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Meals
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.statItem}>
          <ThemedText type="title" style={styles.statNumber}>
            {stats?.averageGap
              ? TimeCalculationService.formatDuration(stats.averageGap)
              : "--"}
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Avg Gap
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.statItem}>
          <ThemedText type="title" style={styles.statNumber}>
            {stats?.longestGap?.durationFormatted || "--"}
          </ThemedText>
          <ThemedText type="default" style={styles.statLabel}>
            Longest Gap
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Additional Details */}
      {summary.entries.length >= 2 && (
        <ThemedView style={styles.detailsSection}>
          <ThemedView style={styles.detailRow}>
            <ThemedText type="default" style={styles.detailLabel}>
              First Meal:
            </ThemedText>
            <ThemedText type="default" style={styles.detailValue}>
              {summary.firstIntake ? formatTime(summary.firstIntake) : "--"}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.detailRow}>
            <ThemedText type="default" style={styles.detailLabel}>
              Last Meal:
            </ThemedText>
            <ThemedText type="default" style={styles.detailValue}>
              {summary.lastIntake ? formatTime(summary.lastIntake) : "--"}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.detailRow}>
            <ThemedText type="default" style={styles.detailLabel}>
              Eating Window:
            </ThemedText>
            <ThemedText type="default" style={styles.detailValue}>
              {TimeCalculationService.formatDuration(eatingWindow)}
            </ThemedText>
          </ThemedView>

          {stats?.shortestGap && (
            <ThemedView style={styles.detailRow}>
              <ThemedText type="default" style={styles.detailLabel}>
                Shortest Gap:
              </ThemedText>
              <ThemedText type="default" style={styles.detailValue}>
                {stats.shortestGap.durationFormatted}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}

      {/* Fasting Achievement */}
      {summary.fastingWindow?.isIntermittentFasting && (
        <ThemedView style={styles.achievementBanner}>
          <ThemedText style={styles.achievementEmoji}>✅</ThemedText>
          <ThemedText type="default" style={styles.achievementText}>
            Intermittent Fasting Goal Achieved!
          </ThemedText>
          <ThemedText type="default" style={styles.achievementSubtext}>
            {summary.fastingWindow.durationFormatted} fast
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    opacity: 0.7,
    marginBottom: 4,
  },
  emptySubtext: {
    opacity: 0.5,
    fontSize: 14,
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    paddingTop: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    opacity: 0.7,
    fontSize: 14,
  },
  detailValue: {
    fontWeight: "500",
    fontSize: 14,
  },
  achievementBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 195, 247, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  achievementEmoji: {
    fontSize: 16,
  },
  achievementText: {
    flex: 1,
    fontWeight: "600",
    color: "#4FC3F7",
  },
  achievementSubtext: {
    fontSize: 12,
    opacity: 0.8,
    color: "#4FC3F7",
  },
});
