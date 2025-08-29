import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CategoryGrid, TimeSelector } from "@/components/quick-add";
import { useMealData } from "@/contexts/MealDataContext";
import { MealCategory, MealEntry } from "@/types";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function QuickAddModal() {
  const params = useLocalSearchParams<{ editEntryId?: string }>();
  const editEntryId = params.editEntryId;
  const isEditMode = !!editEntryId;

  const [selectedCategory, setSelectedCategory] = useState<MealCategory | null>(
    null
  );
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null);

  const { addMealEntry, updateMealEntry, todayEntries, error } = useMealData();

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

  // Load existing entry data when in edit mode
  useEffect(() => {
    if (isEditMode && editEntryId) {
      setIsLoading(true);

      // Find the entry from today's entries
      const existingEntry = todayEntries.find(
        (entry) => entry.id === editEntryId
      );

      if (existingEntry) {
        setEditingEntry(existingEntry);
        setSelectedCategory(existingEntry.category);
        setSelectedTime(new Date(existingEntry.timestamp));
        console.log(
          "[QuickAdd] Loaded existing entry for editing:",
          existingEntry
        );
      } else {
        console.warn("[QuickAdd] Could not find entry to edit:", editEntryId);
        Alert.alert(
          "Entry Not Found",
          "The entry you're trying to edit could not be found. It may have been deleted.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }

      setIsLoading(false);
    }
  }, [isEditMode, editEntryId, todayEntries]);

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

      if (isEditMode && editingEntry) {
        // Update existing entry
        const updates = {
          category: selectedCategory,
          timestamp: selectedTime.getTime(),
          // Update date if timestamp changed to a different date
          date: selectedTime.toISOString().split("T")[0],
        };

        await updateMealEntry(editingEntry.id, updates);

        // Check if the date changed
        const originalDate = new Date(
          editingEntry.timestamp
        ).toLocaleDateString();
        const newDate = selectedTime.toLocaleDateString();

        if (originalDate !== newDate) {
          Alert.alert(
            "Entry Updated",
            `Your meal entry was moved to ${newDate} due to the time change.`,
            [{ text: "Got it" }]
          );
        }

        console.log("[QuickAdd] Entry updated successfully:", editingEntry.id);
      } else {
        // Add new meal entry
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

        console.log("[QuickAdd] Entry added successfully");
      }

      // Navigate back with success
      router.back();
    } catch (error) {
      console.error("Failed to save meal entry:", error);

      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const action = isEditMode ? "update" : "save";
      Alert.alert("Error", `Failed to ${action} your meal. Please try again.`, [
        { text: "OK" },
      ]);
    } finally {
      setIsSaving(false);
    }
  }, [
    selectedCategory,
    selectedTime,
    addMealEntry,
    updateMealEntry,
    isEditMode,
    editingEntry,
  ]);

  const handleCancel = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if there are unsaved changes
    const hasChanges = isEditMode
      ? editingEntry &&
        (selectedCategory !== editingEntry.category ||
          selectedTime.getTime() !== editingEntry.timestamp)
      : selectedCategory !== null;

    if (hasChanges) {
      // Show confirmation if user has made changes
      const action = isEditMode ? "editing" : "adding";
      Alert.alert(
        "Discard Changes?",
        `Are you sure you want to cancel ${action}? Your changes will be lost.`,
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
  }, [selectedCategory, selectedTime, isEditMode, editingEntry]);

  const isSaveEnabled = selectedCategory && !isSaving && !isLoading;

  // Show loading state while loading entry data
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Loading entry...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

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
          {isEditMode ? "Edit Entry" : "Quick Add Meal"}
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
            <ThemedText style={styles.saveButtonText}>
              {isEditMode ? "Update" : "Save"}
            </ThemedText>
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
              💡 {isEditMode ? "Edit Tips" : "Quick Tips"}
            </ThemedText>
            {isEditMode ? (
              <>
                <ThemedText style={styles.tipsText}>
                  • Changing time may move entry to a different date
                </ThemedText>
                <ThemedText style={styles.tipsText}>
                  • Category changes affect your meal patterns
                </ThemedText>
                <ThemedText style={styles.tipsText}>
                  • Updated entries recalculate fasting windows
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText style={styles.tipsText}>
                  • Log meals as soon as possible for accuracy
                </ThemedText>
                <ThemedText style={styles.tipsText}>
                  • Water intake helps with digestion tracking
                </ThemedText>
                <ThemedText style={styles.tipsText}>
                  • Consistent logging improves insights
                </ThemedText>
              </>
            )}
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
              {isEditMode
                ? "Select a category to update"
                : "Choose a category to continue"}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
