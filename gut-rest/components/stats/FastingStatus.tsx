import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlobalStyles } from "@/styles/globals";
import { MealEntry } from "@/types";
import { TimeCalculationService } from "@/services/TimeCalculationService";

interface FastingStatusProps {
  lastMealEntry: MealEntry | null;
  isLoading?: boolean;
  fastingGoalHours?: number;
}

export function FastingStatus({
  lastMealEntry,
  isLoading = false,
  fastingGoalHours = 16,
}: FastingStatusProps) {
  const fastingStatus = React.useMemo(() => {
    return TimeCalculationService.getCurrentFastingStatus(
      lastMealEntry,
      fastingGoalHours
    );
  }, [lastMealEntry, fastingGoalHours]);

  if (isLoading) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Current Fast
        </ThemedText>
        <ThemedView style={styles.fastingContainer}>
          <ThemedText type="title" style={styles.fastingTime}>
            --:--
          </ThemedText>
          <ThemedText type="default" style={styles.fastingLabel}>
            Loading...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!fastingStatus.isCurrentlyFasting || !lastMealEntry) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Current Fast
        </ThemedText>
        <ThemedView style={styles.fastingContainer}>
          <ThemedText type="title" style={styles.fastingTime}>
            --:--
          </ThemedText>
          <ThemedText type="default" style={styles.fastingLabel}>
            Not fasting
          </ThemedText>
          <ThemedText type="default" style={styles.suggestion}>
            Log your next meal to start tracking
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const progressRing = () => {
    const progress = fastingStatus.progressPercentage;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return {
      circumference,
      strokeDashoffset,
      progress,
    };
  };

  const ring = progressRing();

  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Current Fast
        </ThemedText>
        {fastingStatus.goalReached && (
          <ThemedText style={styles.achievement}>✅</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.fastingContainer}>
        <ThemedView style={styles.progressContainer}>
          {/* Progress ring would go here in a real implementation with react-native-svg */}
          <ThemedView style={styles.timeContainer}>
            <ThemedText type="title" style={styles.fastingTime}>
              {fastingStatus.currentFastFormatted}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.statusContainer}>
          <ThemedText type="default" style={styles.fastingLabel}>
            {fastingStatus.goalReached
              ? "Intermittent Fasting Goal Achieved!"
              : "Fasting in progress"}
          </ThemedText>

          {!fastingStatus.goalReached && (
            <ThemedText type="default" style={styles.timeToGo}>
              {fastingStatus.timeToGoalFormatted} to goal
            </ThemedText>
          )}

          <ThemedView style={styles.progressBar}>
            <ThemedView style={styles.progressBarBg}>
              <ThemedView
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      100,
                      fastingStatus.progressPercentage
                    )}%`,
                  },
                ]}
              />
            </ThemedView>
            <ThemedText type="default" style={styles.progressText}>
              {fastingStatus.progressPercentage}%
            </ThemedText>
          </ThemedView>
        </ThemedView>
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
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 0,
  },
  achievement: {
    fontSize: 20,
  },
  fastingContainer: {
    alignItems: "center",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  timeContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  fastingTime: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 50,
  },
  statusContainer: {
    alignItems: "center",
    width: "100%",
  },
  fastingLabel: {
    opacity: 0.8,
    marginBottom: 4,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  timeToGo: {
    opacity: 0.6,
    marginBottom: 12,
    fontSize: 14,
  },
  suggestion: {
    opacity: 0.6,
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
  progressBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4FC3F7",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: "600",
    minWidth: 35,
    textAlign: "right",
  },
});
