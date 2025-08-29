import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { CompactHistoryView } from "@/components/history/CompactHistoryView";
import { databaseService } from "@/services/database";
import { DailySummary } from "@/types";
import {
  getTodayDateString,
  getDateStringWithOffset,
  getLocalDateString,
} from "@/services/dateUtils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

export default function HistoryScreen() {
  const [currentDate, setCurrentDate] = useState(() => getTodayDateString());
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values for swipe
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const loadDayData = useCallback(async (dateString: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await databaseService.initialize();
      const summary = await databaseService.getDailySummary(dateString);
      setDailySummary(summary);
    } catch (err) {
      console.error("Failed to load day data:", err);
      setError("Failed to load meal history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when date changes
  useEffect(() => {
    loadDayData(currentDate);
  }, [currentDate, loadDayData]);

  const goToPreviousDay = useCallback(() => {
    const previousDate = getDateStringWithOffset(currentDate, -1);
    setCurrentDate(previousDate);
  }, [currentDate]);

  const goToNextDay = useCallback(() => {
    const nextDate = getDateStringWithOffset(currentDate, 1);
    const today = getTodayDateString();

    // Don't go beyond today
    if (nextDate <= today) {
      setCurrentDate(nextDate);
    }
  }, [currentDate]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const shouldSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD;

      if (shouldSwipe) {
        if (event.translationX > 0) {
          // Swipe right - go to previous day
          runOnJS(goToPreviousDay)();
        } else {
          // Swipe left - go to next day
          runOnJS(goToNextDay)();
        }
      }

      // Reset position
      translateX.value = withSpring(0);
      opacity.value = withSpring(1);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = getTodayDateString();
    const yesterday = getDateStringWithOffset(today, -1);

    if (dateString === today) {
      return "Today";
    } else if (dateString === yesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      });
    }
  };

  const canGoNext = currentDate < getTodayDateString();

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">History</ThemedText>
          <ThemedView style={styles.dateNavigation}>
            <ThemedText type="subtitle" style={styles.dateText}>
              {formatDateHeader(currentDate)}
            </ThemedText>
            <ThemedView style={styles.swipeHint}>
              <ThemedText style={styles.hintText}>
                {canGoNext
                  ? "← Swipe to navigate →"
                  : "← Swipe for previous days"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.content, animatedStyle]}>
            <CompactHistoryView
              dailySummary={dailySummary}
              isLoading={isLoading}
              error={error}
              onRefresh={() => loadDayData(currentDate)}
              currentDate={currentDate}
            />
          </Animated.View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  dateNavigation: {
    marginTop: 8,
    alignItems: "center",
  },
  dateText: {
    opacity: 0.9,
  },
  swipeHint: {
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
});
