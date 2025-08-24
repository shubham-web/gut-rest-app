import React from "react";
import { Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MealCategory, CategoryConfig } from "@/types";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CategoryButtonProps {
  category: CategoryConfig;
  isSelected: boolean;
  onSelect: (categoryId: MealCategory) => void;
}

export function CategoryButton({
  category,
  isSelected,
  onSelect,
}: CategoryButtonProps) {
  const backgroundColor = useThemeColor(
    { light: "rgba(128, 128, 128, 0.05)", dark: "rgba(128, 128, 128, 0.1)" },
    "background"
  );

  const borderColor = isSelected ? category.color : "rgba(128, 128, 128, 0.3)";
  const selectedBackgroundColor = isSelected
    ? `${category.color}20`
    : backgroundColor;

  const handlePress = async () => {
    // Haptic feedback for better user experience
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(category.id);
  };

  return (
    <Pressable
      style={[
        styles.categoryButton,
        {
          borderColor,
          backgroundColor: selectedBackgroundColor,
        },
        isSelected && styles.selectedButton,
      ]}
      onPress={handlePress}
      android_ripple={{
        color: category.color,
        borderless: false,
      }}
    >
      <ThemedView style={styles.iconContainer}>
        <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
      </ThemedView>

      <ThemedText
        type="default"
        style={[
          styles.categoryLabel,
          isSelected && { color: category.color, fontWeight: "600" },
        ]}
      >
        {category.label}
      </ThemedText>

      {isSelected && (
        <ThemedView
          style={[
            styles.selectedIndicator,
            { backgroundColor: category.color },
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  categoryButton: {
    width: "30%",
    minWidth: 100,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    position: "relative",
    // Ensure minimum touch target of 44pt
    minHeight: 44,
  },
  selectedButton: {
    borderWidth: 3,
    transform: [{ scale: 1.02 }],
  },
  iconContainer: {
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  categoryIcon: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: "center",
    includeFontPadding: false,
  },
  categoryLabel: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 16,
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
