import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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
  const colorScheme = useColorScheme();
  const maxAllowedTime = React.useMemo(() => maxTime || new Date(), [maxTime]);

  const handleDateTimeChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (selectedDate && event.type !== "dismissed") {
        // Ensure the selected date/time doesn't exceed maxAllowedTime
        const adjustedTime =
          selectedDate > maxAllowedTime ? maxAllowedTime : selectedDate;
        onTimeChange(adjustedTime);
      }
    },
    [maxAllowedTime, onTimeChange]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        When did you have it?
      </ThemedText>

      <DateTimePicker
        value={selectedTime}
        mode="datetime"
        display="spinner"
        maximumDate={maxAllowedTime}
        onChange={handleDateTimeChange}
        themeVariant={colorScheme === "dark" ? "dark" : "light"}
        style={styles.picker}
        is24Hour={false}
      />
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
  picker: {
    alignSelf: "center",
  },
});
