import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlobalStyles } from "@/styles/globals";
import { MealEntry, FastingWindow } from "@/types";
import { TimeCalculationService } from "@/services/TimeCalculationService";

interface FastingTrackerProps {
  lastEntryYesterday: MealEntry | null;
  firstEntryToday: MealEntry | null;
  isLoading?: boolean;
}

export function FastingTracker({
  lastEntryYesterday,
  firstEntryToday,
  isLoading = false,
}: FastingTrackerProps) {
  const fastingWindow: FastingWindow | null = React.useMemo(() => {
    return TimeCalculationService.calculateFastingWindow(
      lastEntryYesterday,
      firstEntryToday
    );
  }, [lastEntryYesterday, firstEntryToday]);

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today ${timeStr}`;
    if (isYesterday) return `Yesterday ${timeStr}`;

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Overnight Fast
        </ThemedText>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText type="title" style={styles.fastingDuration}>
            --:--
          </ThemedText>
          <ThemedText type="default" style={styles.statusText}>
            Calculating...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!fastingWindow) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Overnight Fast
        </ThemedText>
        <ThemedView style={styles.emptyContainer}>
          <ThemedText type="default" style={styles.emptyText}>
            Need meals from yesterday and today
          </ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>
            Log meals to track your fasting windows
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Overnight Fast
        </ThemedText>
        {fastingWindow.isIntermittentFasting && (
          <ThemedView style={styles.achievementBadge}>
            <ThemedText style={styles.achievementEmoji}>✅</ThemedText>
            <ThemedText type="default" style={styles.achievementLabel}>
              16h+ Goal
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.fastingContainer}>
        <ThemedText type="title" style={styles.fastingDuration}>
          {fastingWindow.durationFormatted}
        </ThemedText>

        <ThemedText type="default" style={styles.statusText}>
          {fastingWindow.isIntermittentFasting
            ? "Intermittent Fasting Achieved!"
            : "Fasting Window"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.timelineContainer}>
        <ThemedView style={styles.timelineItem}>
          <ThemedView style={styles.timelineDot} />
          <ThemedView style={styles.timelineContent}>
            <ThemedText type="default" style={styles.timelineLabel}>
              Last meal
            </ThemedText>
            <ThemedText type="default" style={styles.timelineTime}>
              {formatDateTime(fastingWindow.startTime)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.timelineLine} />

        <ThemedView style={styles.timelineItem}>
          <ThemedView style={styles.timelineDot} />
          <ThemedView style={styles.timelineContent}>
            <ThemedText type="default" style={styles.timelineLabel}>
              First meal
            </ThemedText>
            <ThemedText type="default" style={styles.timelineTime}>
              {formatDateTime(fastingWindow.endTime)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Enhanced insights with autophagy information */}
      <ThemedView style={styles.insightsContainer}>
        {fastingWindow.isIntermittentFasting ? (
          <ThemedView style={styles.benefitsContainer}>
            <ThemedView style={styles.insight}>
              <ThemedText style={styles.insightIcon}>🎯</ThemedText>
              <ThemedText type="default" style={styles.insightText}>
                Excellent! You&apos;ve achieved the 16-hour intermittent fasting
                goal.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.autophagySection}>
              <ThemedText type="subtitle" style={styles.autophagyTitle}>
                🧬 Autophagy Benefits Unlocked
              </ThemedText>
              <ThemedText type="default" style={styles.autophagyText}>
                After 16+ hours of fasting, your body enters autophagy - a
                cellular &quot;spring cleaning&quot; process that:
              </ThemedText>
              <ThemedView style={styles.benefitsList}>
                <ThemedText style={styles.benefitItem}>
                  • Removes damaged cellular components
                </ThemedText>
                <ThemedText style={styles.benefitItem}>
                  • Promotes cellular regeneration
                </ThemedText>
                <ThemedText style={styles.benefitItem}>
                  • Enhances metabolic efficiency
                </ThemedText>
                <ThemedText style={styles.benefitItem}>
                  • Supports longevity and brain health
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedView style={styles.progressContainer}>
            <ThemedView style={styles.insight}>
              <ThemedText style={styles.insightIcon}>⏰</ThemedText>
              <ThemedText type="default" style={styles.insightText}>
                {fastingWindow.durationMs >= 12 * 60 * 60 * 1000
                  ? "Great progress! Extend to 16h to unlock autophagy benefits."
                  : "Keep going! Longer fasting windows offer greater metabolic benefits."}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.goalProgress}>
              <ThemedText type="default" style={styles.goalText}>
                Goal: 16 hours for intermittent fasting
              </ThemedText>
              <ThemedView style={styles.progressBar}>
                <ThemedView
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        (fastingWindow.durationMs / (16 * 60 * 60 * 1000)) * 100
                      )}%`,
                    },
                  ]}
                />
              </ThemedView>
              <ThemedText type="default" style={styles.progressText}>
                {Math.round(
                  (fastingWindow.durationMs / (16 * 60 * 60 * 1000)) * 100
                )}
                % to autophagy
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 0,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 195, 247, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  achievementEmoji: {
    fontSize: 12,
  },
  achievementLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4FC3F7",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    opacity: 0.7,
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtext: {
    opacity: 0.5,
    fontSize: 14,
    textAlign: "center",
  },
  fastingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  fastingDuration: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 4,
    lineHeight: 50,
  },
  statusText: {
    opacity: 0.8,
    fontSize: 16,
    fontWeight: "500",
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4FC3F7",
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 2,
  },
  timelineTime: {
    fontWeight: "500",
  },
  timelineLine: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    marginLeft: 3.5,
    marginBottom: 8,
  },
  insightsContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    paddingTop: 16,
  },
  insight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  insightIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    opacity: 0.8,
    lineHeight: 20,
    fontSize: 14,
  },
  benefitsContainer: {
    gap: 16,
  },
  autophagySection: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "rgba(76, 195, 247, 0.05)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4FC3F7",
  },
  autophagyTitle: {
    marginBottom: 8,
    color: "#4FC3F7",
    fontSize: 16,
    fontWeight: "600",
  },
  autophagyText: {
    opacity: 0.8,
    lineHeight: 18,
    fontSize: 14,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    opacity: 0.7,
    fontSize: 13,
    lineHeight: 18,
  },
  progressContainer: {
    gap: 12,
  },
  goalProgress: {
    padding: 12,
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderRadius: 8,
    gap: 8,
  },
  goalText: {
    opacity: 0.7,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4FC3F7",
    borderRadius: 3,
  },
  progressText: {
    opacity: 0.6,
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
  },
});
