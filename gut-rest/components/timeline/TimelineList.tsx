import React, { useCallback, useMemo } from "react";
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  ListRenderItem,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MealEntry as MealEntryType, TimeGap as TimeGapType } from "@/types";
import { MealEntry } from "./MealEntry";
import { TimeGap } from "./TimeGap";
import { EmptyTimeline } from "./EmptyTimeline";
import { GlobalStyles, Spacing } from "@/styles/globals";
import { router } from "expo-router";

// Timeline item types for the FlatList
type TimelineItemType = "meal" | "gap" | "header";

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  data?: MealEntryType | TimeGapType;
  isLast?: boolean;
}

interface TimelineListProps {
  entries: MealEntryType[];
  gaps: TimeGapType[];
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (entry: MealEntryType) => void;
}

export function TimelineList({
  entries,
  gaps,
  isLoading,
  error,
  refreshing,
  onRefresh,
  onDeleteEntry,
  onEditEntry,
}: TimelineListProps) {
  // Create timeline items by interleaving meals and gaps
  const timelineItems = useMemo((): TimelineItem[] => {
    if (entries.length === 0) {
      return [];
    }

    // Sort entries by timestamp (most recent first)
    const sortedEntries = [...entries].sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
    const items: TimelineItem[] = [];

    // Interleave meals and gaps (starting with most recent meal)
    sortedEntries.forEach((entry, index) => {
      // Add meal entry
      items.push({
        id: `meal-${entry.id}`,
        type: "meal",
        data: entry,
        isLast: index === sortedEntries.length - 1,
      });

      // Add gap after this meal (if not the last/oldest entry)
      if (index < sortedEntries.length - 1) {
        // Find the gap between this entry and the next (older) one
        const currentEntry = entry;
        const nextEntry = sortedEntries[index + 1];

        const gap = gaps.find(
          (g) =>
            g.startTime === nextEntry.timestamp &&
            g.endTime === currentEntry.timestamp
        );

        if (gap) {
          items.push({
            id: `gap-${gap.startTime}-${gap.endTime}`,
            type: "gap",
            data: gap,
            isLast: false,
          });
        }
      }
    });

    return items;
  }, [entries, gaps]);

  const handleEditEntry = useCallback(
    (entry: MealEntryType) => {
      if (onEditEntry) {
        onEditEntry(entry);
      } else {
        // Navigate to quick-add with edit mode
        router.push({
          pathname: "/quick-add",
          params: { editEntryId: entry.id },
        });
      }
    },
    [onEditEntry]
  );

  const renderTimelineItem: ListRenderItem<TimelineItem> = useCallback(
    ({ item, index }) => {
      switch (item.type) {
        case "meal":
          const mealData = item.data as MealEntryType;
          return (
            <MealEntry
              entry={mealData}
              onDelete={onDeleteEntry}
              onEdit={handleEditEntry}
            />
          );

        case "gap":
          const gapData = item.data as TimeGapType;
          return <TimeGap gap={gapData} isLast={item.isLast} />;

        default:
          return null;
      }
    },
    [onDeleteEntry, handleEditEntry]
  );

  const renderEmpty = () => (
    <EmptyTimeline onAddMeal={() => router.push("/quick-add")} />
  );

  const renderError = () => (
    <ThemedView style={[GlobalStyles.emptyState, styles.errorContainer]}>
      <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
      <ThemedText type="subtitle" style={styles.errorTitle}>
        Something went wrong
      </ThemedText>
      <ThemedText style={styles.errorMessage}>
        {error || "Unable to load your meal timeline"}
      </ThemedText>
    </ThemedView>
  );

  if (error) {
    return renderError();
  }

  if (timelineItems.length === 0) {
    return renderEmpty();
  }

  return (
    <FlatList
      data={timelineItems}
      renderItem={renderTimelineItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
        />
      }
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={8}
      // Add padding at bottom for floating action button
      contentInsetAdjustmentBehavior="automatic"
      ListFooterComponent={<ThemedView style={styles.listFooter} />}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  listFooter: {
    height: 100, // Space for floating action button
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
