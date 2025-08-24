import React from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { CategoryButton } from "./CategoryButton";
import { MealCategory, CategoryConfig } from "@/types";
import { getSortedCategories } from "@/constants/MealCategories";
import { GlobalStyles } from "@/styles/globals";

interface CategoryGridProps {
  selectedCategory: MealCategory | null;
  onCategorySelect: (categoryId: MealCategory) => void;
}

export function CategoryGrid({
  selectedCategory,
  onCategorySelect,
}: CategoryGridProps) {
  const categories = getSortedCategories();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        What did you have?
      </ThemedText>

      <ThemedView style={styles.grid}>
        {categories.map((category: CategoryConfig) => (
          <CategoryButton
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onSelect={onCategorySelect}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "transparent",
  },
});
