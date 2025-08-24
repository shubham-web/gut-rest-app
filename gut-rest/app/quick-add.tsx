import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CategoryGrid, TimeSelector } from "@/components/quick-add";
import { useMealData } from "@/contexts/MealDataContext";
import { MealCategory } from "@/types";
import { useThemeColor } from "@/hooks/useThemeColor";
import { GlobalStyles } from "@/styles/globals";

export default function QuickAddModal() {
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | null>(
    null
  );
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  const { addMealEntry, error } = useMealData();

  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#000" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const disabledColor = useThemeColor(
    { light: "rgba(128, 128, 128, 0.4)", dark: "rgba(128, 128, 128, 0.6)" },
    "text"
  );

  const handleCategorySelect = useCallback((categoryId: MealCategory) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleTimeChange = useCallback((time: Date) => {
    setSelectedTime(time);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedCategory) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Please select a category",
        "Choose what you had before saving."
      );
      return;
    }

    try {
      setIsSaving(true);

      // Add haptic feedback for success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Add the meal entry
      const result = await addMealEntry(
        selectedCategory,
        selectedTime.getTime()
      );

      if (result.success && !result.isToday) {
        // Show feedback for back-logged entries
        const entryDate = new Date(result.entryDate).toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        Alert.alert(
          "Entry Saved",
          `Your meal was saved to ${entryDate}. Back-logged entries don't appear in today's timeline but are stored in your history.`,
          [{ text: "Got it" }]
        );
      }

      // Navigate back with success
      router.back();
    } catch (error) {
      console.error("Failed to save meal entry:", error);

      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      Alert.alert("Error", "Failed to save your meal. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSaving(false);
    }
  }, [selectedCategory, selectedTime, addMealEntry]);

  const handleCancel = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (selectedCategory) {
      // Show confirmation if user has made selections
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to cancel? Your selection will be lost.",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [selectedCategory]);

  const isSaveEnabled = selectedCategory && !isSaving;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable
          onPress={handleCancel}
          style={styles.headerButton}
          disabled={isSaving}
        >
          <IconSymbol
            size={24}
            name="xmark"
            color={isSaving ? disabledColor : textColor}
          />
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          Quick Add Meal
        </ThemedText>

        <Pressable
          onPress={handleSave}
          style={[
            styles.saveButton,
            {
              backgroundColor: isSaveEnabled ? primaryColor : disabledColor,
            },
          ]}
          disabled={!isSaveEnabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          )}
        </Pressable>
      </ThemedView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.content}>
          {/* Category Selection */}
          <CategoryGrid
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Time Selection */}
          <TimeSelector
            selectedTime={selectedTime}
            onTimeChange={handleTimeChange}
            maxTime={new Date()}
          />

          {/* Quick Tips */}
          <ThemedView style={styles.tipsContainer}>
            <ThemedText type="default" style={styles.tipsTitle}>
              💡 Quick Tips
            </ThemedText>
            <ThemedText style={styles.tipsText}>
              • Log meals as soon as possible for accuracy
            </ThemedText>
            <ThemedText style={styles.tipsText}>
              • Water intake helps with digestion tracking
            </ThemedText>
            <ThemedText style={styles.tipsText}>
              • Consistent logging improves insights
            </ThemedText>
          </ThemedView>

          {/* Error Display */}
          {error && (
            <ThemedView style={styles.errorContainer}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={16}
                color="#FF6B6B"
              />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>

      {/* Bottom Action Bar */}
      <ThemedView style={styles.bottomBar}>
        <ThemedView style={styles.selectionSummary}>
          {selectedCategory ? (
            <ThemedText style={styles.summaryText}>
              Selected:{" "}
              <ThemedText style={styles.summaryCategory}>
                {selectedCategory.replace("_", " ")}
              </ThemedText>
            </ThemedText>
          ) : (
            <ThemedText style={[styles.summaryText, { opacity: 0.6 }]}>
              Choose a category to continue
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
    minHeight: 64,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  tipsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.05)",
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    opacity: 0.8,
    marginBottom: 4,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    gap: 8,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    flex: 1,
  },
  bottomBar: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  selectionSummary: {
    alignItems: "center",
    backgroundColor: "transparent",
  },
  summaryText: {
    fontSize: 14,
    textAlign: "center",
  },
  summaryCategory: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
