import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { DailySummary } from "@/types";
import {
  getTodayDateString,
  getDateStringWithOffset,
} from "@/services/dateUtils";
import { BorderRadius, Spacing } from "@/styles/globals";

interface DaySummaryCardProps {
  dailySummary: DailySummary;
  currentDate: string;
}

export function DaySummaryCard({
  dailySummary,
  currentDate,
}: DaySummaryCardProps) {
  const cardBackground = useThemeColor(
    { light: "#FFFFFF", dark: "#2C2C2E" },
    "background"
  );
  const textColor = useThemeColor({}, "text");
  const subtleTextColor = useThemeColor(
    { light: "#666", dark: "#A0A0A0" },
    "text"
  );
  const successColor = useThemeColor(
    { light: "#34C759", dark: "#32D74B" },
    "text"
  );

  const { entries, fastingWindow, totalEntries, firstIntake, lastIntake } =
    dailySummary;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDateLabel = () => {
    const today = getTodayDateString();
    const yesterday = getDateStringWithOffset(today, -1);

    if (currentDate === today) {
      return "Today";
    } else if (currentDate === yesterday) {
      return "Yesterday";
    } else {
      const date = new Date(currentDate);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <ThemedView style={[styles.card, { backgroundColor: cardBackground }]}>
      <ThemedView style={styles.header}>
        <ThemedText
          type="subtitle"
          style={[styles.dateLabel, { color: textColor }]}
        >
          {getDateLabel()}
        </ThemedText>
        <ThemedText style={[styles.entryCount, { color: subtleTextColor }]}>
          {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stats}>
        {/* First/Last intake times */}
        {firstIntake && lastIntake && (
          <ThemedView style={styles.statRow}>
            <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
              Eating window
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {formatTime(firstIntake)} - {formatTime(lastIntake)}
            </ThemedText>
          </ThemedView>
        )}

        {/* Fasting window */}
        {fastingWindow && (
          <ThemedView style={styles.statRow}>
            <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
              Fasting
            </ThemedText>
            <ThemedView style={styles.fastingInfo}>
              <ThemedText
                style={[
                  styles.fastingDuration,
                  {
                    color: fastingWindow.isIntermittentFasting
                      ? successColor
                      : textColor,
                  },
                ]}
              >
                {fastingWindow.durationFormatted}
              </ThemedText>
              {fastingWindow.isIntermittentFasting && (
                <ThemedText
                  style={[styles.fastingBadge, { color: successColor }]}
                >
                  ✓ IF
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>
        )}

        {/* Total entries breakdown by category */}
        {entries.length > 0 && (
          <ThemedView style={styles.statRow}>
            <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
              Categories
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {getCategoryBreakdown(entries)}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

function getCategoryBreakdown(entries: DailySummary["entries"]): string {
  const categoryCount = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryCount)
    .map(([category, count]) => {
      const label = category.replace("_", " ");
      return count > 1 ? `${count} ${label}` : label;
    })
    .join(", ");
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dateLabel: {
    fontSize: 18,
  },
  entryCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  stats: {
    gap: Spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  fastingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  fastingDuration: {
    fontSize: 14,
    fontWeight: "500",
  },
  fastingBadge: {
    fontSize: 12,
    fontWeight: "600",
  },
});
