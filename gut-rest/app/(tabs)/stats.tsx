import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FastingStatus, FastingTracker } from "@/components/stats";
import { useMealData } from "@/contexts/MealDataContext";
import { databaseService } from "@/services/database";
import { MealEntry } from "@/types";
import { GlobalStyles } from "@/styles/globals";
import { doesCategoryBreakFasting } from "@/constants/MealCategories";
import { getYesterdayDateString } from "@/services/dateUtils";

export default function StatsScreen() {
  const {
    todayEntries,
    isLoading: contextLoading,
    error: contextError,
    refreshData,
  } = useMealData();

  const [yesterdayLastMeal, setYesterdayLastMeal] = useState<MealEntry | null>(
    null
  );
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getYesterdayLocalDateString = useCallback(() => {
    return getYesterdayDateString(); // Use local time instead of UTC
  }, []);

  const loadHistoricalData = useCallback(async () => {
    try {
      setHistoricalLoading(true);
      setError(null);

      const yesterdayDate = getYesterdayLocalDateString();
      const yesterdayEntries = await databaseService.getMealEntriesByDate(
        yesterdayDate
      );

      // Filter for fasting-breaking meals only
      const yesterdayFastingBreakingMeals = yesterdayEntries.filter((entry) =>
        doesCategoryBreakFasting(entry.category)
      );

      if (yesterdayFastingBreakingMeals.length > 0) {
        setYesterdayLastMeal(
          yesterdayFastingBreakingMeals[
            yesterdayFastingBreakingMeals.length - 1
          ]
        );
      } else {
        setYesterdayLastMeal(null);
      }
    } catch (err) {
      console.error("Failed to load historical data:", err);
      setError("Failed to load historical data");
    } finally {
      setHistoricalLoading(false);
    }
  }, [getYesterdayLocalDateString]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshData(), loadHistoricalData()]);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData, loadHistoricalData]);

  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData]);

  const isLoading = contextLoading || historicalLoading;
  const hasError = contextError || error;

  // Find the last meal that actually breaks fasting (not water)
  const lastFastingBreakingMeal = React.useMemo(() => {
    const fastingBreakingMeals = todayEntries.filter((entry) =>
      doesCategoryBreakFasting(entry.category)
    );
    return fastingBreakingMeals.length > 0
      ? fastingBreakingMeals[fastingBreakingMeals.length - 1]
      : null;
  }, [todayEntries]);

  const firstMealToday = todayEntries.length > 0 ? todayEntries[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Your Stats</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          Fasting insights and meal patterns
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4FC3F7"
            colors={["#4FC3F7"]}
          />
        }
      >
        <ThemedView style={styles.content}>
          {hasError && (
            <ThemedView style={styles.errorCard}>
              <ThemedText type="subtitle" style={styles.errorTitle}>
                ⚠️ Unable to load some data
              </ThemedText>
              <ThemedText type="default" style={styles.errorText}>
                {hasError}
              </ThemedText>
              <ThemedText type="default" style={styles.errorSubtext}>
                Pull to refresh to try again
              </ThemedText>
            </ThemedView>
          )}

          {/* Current Fasting Status */}
          <FastingStatus
            lastMealEntry={lastFastingBreakingMeal}
            isLoading={isLoading}
            fastingGoalHours={16}
          />

          {/* Overnight Fasting Tracker */}
          <FastingTracker
            lastEntryYesterday={yesterdayLastMeal}
            firstEntryToday={firstMealToday}
            isLoading={isLoading}
          />

          {/* Empty State for No Data */}
          {!isLoading && todayEntries.length === 0 && (
            <ThemedView style={styles.emptyStateContainer}>
              <ThemedText type="title" style={styles.emptyStateEmoji}>
                🍽️
              </ThemedText>
              <ThemedText type="subtitle" style={styles.emptyStateTitle}>
                No meals logged today
              </ThemedText>
              <ThemedText type="default" style={styles.emptyStateDescription}>
                Start logging your meals to see detailed insights about your
                eating patterns and fasting windows.
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Bottom spacing for tab bar */}
        <ThemedView style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  bottomSpacer: {
    height: 100, // Space for tab bar
  },
  errorCard: {
    ...GlobalStyles.card,
    backgroundColor: "rgba(255, 99, 99, 0.1)",
    borderColor: "rgba(255, 99, 99, 0.3)",
    borderWidth: 1,
  },
  errorTitle: {
    marginBottom: 8,
    color: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 4,
  },
  errorSubtext: {
    opacity: 0.7,
    fontSize: 12,
    color: "#FF6B6B",
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateDescription: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    maxWidth: 300,
  },
});
