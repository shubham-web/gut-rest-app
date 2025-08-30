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
import { EmptyTimeline } from "./EmptyTimeline";
import { GlobalStyles, Spacing } from "@/styles/globals";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";

// Timeline item types for the FlatList
type TimelineItemType = "meal" | "now-marker";

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  data?: MealEntryType;
  isFirst?: boolean;
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
  const timelineColor = useThemeColor(
    { light: "#E5E5E7", dark: "#38383A" },
    "text"
  );

  // Create timeline items
  const timelineItems = useMemo((): TimelineItem[] => {
    if (entries.length === 0) {
      return [];
    }

    // Sort entries by timestamp (most recent first)
    const sortedEntries = [...entries].sort((a, b) => {
      return b.timestamp - a.timestamp;
    });

    const items: TimelineItem[] = [];

    // Add "Now" marker at the top
    items.push({
      id: "now-marker",
      type: "now-marker",
      isFirst: true,
    });

    // Add meal entries
    sortedEntries.forEach((entry, index) => {
      items.push({
        id: `meal-${entry.id}`,
        type: "meal",
        data: entry,
        isFirst: index === 0,
        isLast: index === sortedEntries.length - 1,
      });
    });

    return items;
  }, [entries]);

  const handleEditEntry = useCallback(
    (entry: MealEntryType) => {
      if (onEditEntry) {
        onEditEntry(entry);
      } else {
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
              isFirst={item.isFirst}
              isLast={item.isLast}
            />
          );

        case "now-marker":
          return <NowMarker />;

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
    <ThemedView style={styles.timelineContainer}>
      <FlatList
        data={timelineItems}
        renderItem={renderTimelineItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        contentInsetAdjustmentBehavior="automatic"
        ListFooterComponent={<ThemedView style={styles.listFooter} />}
      />

      {/* Continuous Timeline Line - positioned to move with FlatList content */}
      <ThemedView
        style={[styles.continuousTimeline, { backgroundColor: timelineColor }]}
        pointerEvents="none"
      />
    </ThemedView>
  );
}

// Simple Now Marker component
function NowMarker() {
  return (
    <ThemedView style={styles.nowMarkerRow}>
      {/* Time Column */}
      <ThemedView style={styles.nowTimeColumn}>
        <ThemedText style={styles.nowText}>Now</ThemedText>
      </ThemedView>

      {/* Dot Column */}
      <ThemedView style={styles.nowDotColumn}>
        <ThemedView style={styles.nowDot} />
      </ThemedView>

      {/* Content Column - empty for now marker */}
      <ThemedView style={styles.nowContentColumn}>
        <ThemedView style={styles.nowLine} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    flex: 1,
    position: "relative",
  },
  continuousTimeline: {
    position: "absolute",
    left: 107, // User's corrected positioning
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: -1, // User's corrected z-index
    transform: [{ translateY: Spacing.sm }], // Offset to align with content
  },
  listContent: {
    paddingTop: Spacing.sm,
    position: "relative",
  },
  listFooter: {
    height: 100,
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
  // Now Marker Styles
  nowMarkerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  nowTimeColumn: {
    width: 80,
    alignItems: "flex-end",
    paddingRight: Spacing.md,
  },
  nowText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF3B30",
    textAlign: "right",
  },
  nowDotColumn: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  nowDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF3B30",
    zIndex: 3,
    shadowColor: "#FF3B30",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nowContentColumn: {
    flex: 1,
    paddingLeft: Spacing.md,
    justifyContent: "center",
  },
  nowLine: {
    height: 2,
    backgroundColor: "#FF3B30",
    opacity: 0.4,
    borderRadius: 1,
  },
});
