import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { TimelineList } from "@/components/timeline/TimelineList";
import { useMealData } from "@/contexts/MealDataContext";
import { GlobalStyles } from "@/styles/globals";
import { router } from "expo-router";

export default function TimelineScreen() {
  const {
    todayEntries,
    todaySummary,
    isLoading,
    error,
    refreshData,
    deleteMealEntry,
  } = useMealData();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      try {
        await deleteMealEntry(id);
      } catch (error) {
        console.error("Failed to delete meal entry:", error);
      }
    },
    [deleteMealEntry]
  );

  const handleEditEntry = useCallback((entry: any) => {
    router.push({
      pathname: "/quick-add",
      params: { editEntryId: entry.id },
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Today&apos;s Timeline</ThemedText>
        <ThemedText type="default" style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </ThemedText>

        {/* Optional: Show summary stats */}
        {todaySummary && todayEntries.length > 0 && (
          <ThemedView style={styles.statsContainer}>
            <ThemedText style={styles.statsText}>
              {todayEntries.length}{" "}
              {todayEntries.length === 1 ? "entry" : "entries"}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <TimelineList
        entries={todayEntries}
        gaps={todaySummary?.gaps || []}
        isLoading={isLoading}
        error={error}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onDeleteEntry={handleDeleteEntry}
        onEditEntry={handleEditEntry}
      />

      <FloatingActionButton />
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
  dateText: {
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  statsText: {
    fontSize: 14,
    opacity: 0.8,
  },
});
