import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useColorScheme } from "@/hooks/useColorScheme";

interface TimeSelectorProps {
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
  maxTime?: Date; // Optional max time (defaults to now)
}

export function TimeSelector({
  selectedTime,
  onTimeChange,
  maxTime,
}: TimeSelectorProps) {
  const [displayTime, setDisplayTime] = useState(selectedTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const backgroundColor = useThemeColor(
    { light: "rgba(128, 128, 128, 0.1)", dark: "rgba(128, 128, 128, 0.15)" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "rgba(128, 128, 128, 0.3)", dark: "rgba(128, 128, 128, 0.4)" },
    "text"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const colorScheme = useColorScheme();

  const maxAllowedTime = maxTime || new Date();

  useEffect(() => {
    setDisplayTime(selectedTime);
  }, [selectedTime]);

  const handleDateTimeChange = useCallback(
    (event: any, selectedDate?: Date) => {
      // Always hide pickers after interaction
      setShowDatePicker(false);
      setShowTimePicker(false);

      if (selectedDate && event.type !== "dismissed") {
        // Ensure the selected date/time doesn't exceed maxAllowedTime
        const adjustedTime =
          selectedDate > maxAllowedTime ? maxAllowedTime : selectedDate;
        setDisplayTime(adjustedTime);
        onTimeChange(adjustedTime);
      }
    },
    [maxAllowedTime, onTimeChange]
  );

  const showDatePickerModal = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPickerMode("date");
    setShowDatePicker(true);
  }, []);

  const showTimePickerModal = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPickerMode("time");
    setShowTimePicker(true);
  }, []);

  const formatDate = useCallback((date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return "Today";
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  }, []);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: undefined, // Let device settings determine format
    });
  }, []);

  const getTimeLabel = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return "Now";
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
    } else if (diffHours < 24) {
      const mins = diffMins % 60;
      if (mins === 0) {
        return `${diffHours}h ago`;
      }
      return `${diffHours}h ${mins}m ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return `${diffDays} days ago`;
    }
  }, []);

  const isNow = useCallback((date: Date) => {
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    return diffMs < 60000; // Within 1 minute is considered "now"
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Date & Time
      </ThemedText>

      <ThemedView style={styles.selectorsContainer}>
        {/* Date Selector */}
        <Pressable
          style={[
            styles.selector,
            styles.dateSelector,
            { backgroundColor, borderColor },
          ]}
          onPress={showDatePickerModal}
          android_ripple={{ color: "rgba(128, 128, 128, 0.3)" }}
        >
          <ThemedView style={styles.selectorContent}>
            <IconSymbol
              name="calendar"
              size={20}
              color="rgba(128, 128, 128, 0.7)"
              style={styles.selectorIcon}
            />
            <ThemedView style={styles.selectorTextContainer}>
              <ThemedText type="default" style={styles.selectorLabel}>
                Date
              </ThemedText>
              <ThemedText type="title" style={styles.selectorValue}>
                {formatDate(displayTime)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Pressable>

        {/* Time Selector */}
        <Pressable
          style={[
            styles.selector,
            styles.timeSelector,
            { backgroundColor, borderColor },
          ]}
          onPress={showTimePickerModal}
          android_ripple={{ color: "rgba(128, 128, 128, 0.3)" }}
        >
          <ThemedView style={styles.selectorContent}>
            <IconSymbol
              name="clock"
              size={20}
              color="rgba(128, 128, 128, 0.7)"
              style={styles.selectorIcon}
            />
            <ThemedView style={styles.selectorTextContainer}>
              <ThemedText type="default" style={styles.selectorLabel}>
                Time
              </ThemedText>
              <ThemedText type="title" style={styles.selectorValue}>
                {formatTime(displayTime)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Pressable>
      </ThemedView>

      {/* Time Indicator */}
      <ThemedView style={styles.timeIndicator}>
        <ThemedText type="default" style={styles.timeLabel}>
          {getTimeLabel(displayTime)}
        </ThemedText>
        {isNow(displayTime) && (
          <ThemedView style={styles.nowIndicator}>
            <ThemedText style={styles.nowText}>LIVE</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Native Date Picker - Shows as modal only */}
      {showDatePicker && (
        <DateTimePicker
          value={displayTime}
          mode="date"
          display="default"
          maximumDate={maxAllowedTime}
          onChange={handleDateTimeChange}
          themeVariant={colorScheme === "dark" ? "dark" : "light"}
        />
      )}

      {/* Native Time Picker - Shows as modal only */}
      {showTimePicker && (
        <DateTimePicker
          value={displayTime}
          mode="time"
          display="default"
          maximumDate={maxAllowedTime}
          onChange={handleDateTimeChange}
          themeVariant={colorScheme === "dark" ? "dark" : "light"}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  selectorsContainer: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "transparent",
  },
  selector: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 80,
  },
  dateSelector: {
    // Additional styles for date selector if needed
  },
  timeSelector: {
    // Additional styles for time selector if needed
  },
  selectorContent: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    gap: 8,
  },
  selectorIcon: {
    marginBottom: 4,
  },
  selectorTextContainer: {
    alignItems: "center",
    backgroundColor: "transparent",
  },
  selectorLabel: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: "500",
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  timeIndicator: {
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "transparent",
    position: "relative",
  },
  timeLabel: {
    opacity: 0.7,
    fontSize: 14,
    fontWeight: "500",
  },
  nowIndicator: {
    position: "absolute",
    top: -8,
    right: -20,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nowText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
