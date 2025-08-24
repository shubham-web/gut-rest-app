import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TimeGap as TimeGapType } from "@/types";
import { GlobalStyles, Spacing, BorderRadius } from "@/styles/globals";

interface TimeGapProps {
  gap: TimeGapType;
  isLast?: boolean;
}

export function TimeGap({ gap, isLast = false }: TimeGapProps) {
  const getGapColor = (durationMs: number) => {
    const hours = durationMs / (1000 * 60 * 60);

    if (hours < 2) {
      return "#FF6B6B"; // Red for short gaps
    } else if (hours < 4) {
      return "#FFB74D"; // Orange for moderate gaps
    } else if (hours < 8) {
      return "#81C784"; // Green for good gaps
    } else {
      return "#4FC3F7"; // Blue for long gaps/fasting
    }
  };

  const getGapLabel = (durationMs: number) => {
    const hours = durationMs / (1000 * 60 * 60);

    if (hours < 2) {
      return "Short gap";
    } else if (hours < 4) {
      return "Moderate gap";
    } else if (hours < 8) {
      return "Good gap";
    } else if (hours < 16) {
      return "Long gap";
    } else {
      return "Fasting period";
    }
  };

  const gapColor = getGapColor(gap.durationMs);
  const gapLabel = getGapLabel(gap.durationMs);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.gapCard}>
        <ThemedView style={styles.gapHeader}>
          <ThemedText style={styles.gapIcon}>⏱</ThemedText>
          <ThemedView style={styles.gapInfo}>
            <ThemedText type="defaultSemiBold" style={styles.gapDuration}>
              {gap.durationFormatted}
            </ThemedText>
            <ThemedText style={[styles.gapLabel, { color: gapColor }]}>
              {gapLabel}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Timeline line on the right */}
      <ThemedView style={[styles.timelineLine, { backgroundColor: gapColor }]}>
        <ThemedView
          style={[styles.timelineDot, { backgroundColor: gapColor }]}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: Spacing.sm,
    position: "relative",
    height: 60,
  },
  gapCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginRight: 12,
    justifyContent: "center",
    // Subtle border instead of shadow
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  gapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  gapIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
    opacity: 0.7,
    lineHeight: 20,
    includeFontPadding: false,
  },
  gapInfo: {
    alignItems: "center",
  },
  gapDuration: {
    fontSize: 14,
    lineHeight: 16,
    color: "#333",
  },
  gapLabel: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "500",
    marginTop: 2,
  },
  timelineLine: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    opacity: 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
