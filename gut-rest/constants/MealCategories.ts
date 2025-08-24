import { MealCategory, CategoryConfig, MealThemeColors } from "../types";

/**
 * Meal category configurations with icons, colors, and display order
 */
export const MEAL_CATEGORIES: Record<MealCategory, CategoryConfig> = {
  water: {
    id: "water",
    icon: "💧",
    label: "Water",
    color: "#4FC3F7",
    order: 1,
  },
  fruit: {
    id: "fruit",
    icon: "🍎",
    label: "Fruit",
    color: "#81C784",
    order: 2,
  },
  light_meal: {
    id: "light_meal",
    icon: "🥗",
    label: "Light Meal",
    color: "#AED581",
    order: 3,
  },
  medium_meal: {
    id: "medium_meal",
    icon: "🍽️",
    label: "Medium Meal",
    color: "#FFB74D",
    order: 4,
  },
  heavy_meal: {
    id: "heavy_meal",
    icon: "🍖",
    label: "Heavy Meal",
    color: "#FF8A65",
    order: 5,
  },
  fast_food: {
    id: "fast_food",
    icon: "🍔",
    label: "Fast Food",
    color: "#F06292",
    order: 6,
  },
  drink: {
    id: "drink",
    icon: "☕",
    label: "Drink",
    color: "#BA68C8",
    order: 7,
  },
};

/**
 * Theme colors for meal categories (light and dark variants)
 */
export const MEAL_COLORS: MealThemeColors = {
  light: {
    water: "#4FC3F7",
    fruit: "#81C784",
    light_meal: "#AED581",
    medium_meal: "#FFB74D",
    heavy_meal: "#FF8A65",
    fast_food: "#F06292",
    drink: "#BA68C8",
  },
  dark: {
    water: "#0288D1",
    fruit: "#388E3C",
    light_meal: "#689F38",
    medium_meal: "#F57C00",
    heavy_meal: "#E64A19",
    fast_food: "#C2185B",
    drink: "#7B1FA2",
  },
};

/**
 * Get categories sorted by display order
 */
export const getSortedCategories = (): CategoryConfig[] => {
  return Object.values(MEAL_CATEGORIES).sort((a, b) => a.order - b.order);
};

/**
 * Get category config by ID
 */
export const getCategoryConfig = (categoryId: MealCategory): CategoryConfig => {
  return MEAL_CATEGORIES[categoryId];
};

/**
 * Get category color for theme
 */
export const getCategoryColor = (
  categoryId: MealCategory,
  theme: "light" | "dark" = "light"
): string => {
  return MEAL_COLORS[theme][categoryId];
};

/**
 * Get category label
 */
export const getCategoryLabel = (categoryId: MealCategory): string => {
  return MEAL_CATEGORIES[categoryId].label;
};

/**
 * Get category icon
 */
export const getCategoryIcon = (categoryId: MealCategory): string => {
  return MEAL_CATEGORIES[categoryId].icon;
};

/**
 * Check if category ID is valid
 */
export const isValidCategory = (
  categoryId: string
): categoryId is MealCategory => {
  return categoryId in MEAL_CATEGORIES;
};

/**
 * Get all category IDs
 */
export const getAllCategoryIds = (): MealCategory[] => {
  return Object.keys(MEAL_CATEGORIES) as MealCategory[];
};

/**
 * Category groupings for UI organization
 */
export const CATEGORY_GROUPS = {
  liquids: ["water", "drink"] as MealCategory[],
  light: ["fruit", "light_meal"] as MealCategory[],
  substantial: ["medium_meal", "heavy_meal", "fast_food"] as MealCategory[],
};

/**
 * Get category group
 */
export const getCategoryGroup = (
  categoryId: MealCategory
): "liquids" | "light" | "substantial" | null => {
  for (const [groupName, categories] of Object.entries(CATEGORY_GROUPS)) {
    if (categories.includes(categoryId)) {
      return groupName as "liquids" | "light" | "substantial";
    }
  }
  return null;
};

/**
 * Alternative icon sets for customization
 */
export const ALTERNATIVE_ICONS: Record<MealCategory, string[]> = {
  water: ["💧", "🥤", "🚰", "💦"],
  fruit: ["🍎", "🍌", "🍊", "🥝", "🍓", "🍇"],
  light_meal: ["🥗", "🥙", "🍞", "🥪"],
  medium_meal: ["🍽️", "🍚", "🍛", "🍝"],
  heavy_meal: ["🍖", "🥩", "🍗", "🥘"],
  fast_food: ["🍔", "🍟", "🌭", "🍕"],
  drink: ["☕", "🍵", "🥤", "🧃"],
};

/**
 * Get alternative icons for a category
 */
export const getAlternativeIcons = (categoryId: MealCategory): string[] => {
  return ALTERNATIVE_ICONS[categoryId];
};

/**
 * Category intensity/weight for calculations
 * Used for determining meal "heaviness" in analytics
 */
export const CATEGORY_WEIGHTS: Record<MealCategory, number> = {
  water: 0.1,
  drink: 0.2,
  fruit: 0.3,
  light_meal: 0.5,
  medium_meal: 0.8,
  heavy_meal: 1.0,
  fast_food: 1.2, // Slightly higher for processing difficulty
};

/**
 * Get category weight
 */
export const getCategoryWeight = (categoryId: MealCategory): number => {
  return CATEGORY_WEIGHTS[categoryId];
};

/**
 * Recommended gaps after each category type (in hours)
 */
export const RECOMMENDED_GAPS: Record<MealCategory, number> = {
  water: 0.5, // 30 minutes
  drink: 1.0, // 1 hour
  fruit: 2.0, // 2 hours
  light_meal: 3.0, // 3 hours
  medium_meal: 4.0, // 4 hours
  heavy_meal: 5.0, // 5 hours
  fast_food: 5.5, // 5.5 hours
};

/**
 * Get recommended gap after category
 */
export const getRecommendedGap = (categoryId: MealCategory): number => {
  return RECOMMENDED_GAPS[categoryId];
};

/**
 * Category descriptions for user guidance
 */
export const CATEGORY_DESCRIPTIONS: Record<MealCategory, string> = {
  water: "Plain water, hydration",
  fruit: "Fresh fruits, natural sugars",
  light_meal: "Salads, light snacks, vegetables",
  medium_meal: "Balanced meals, moderate portions",
  heavy_meal: "Large meals, high protein/fat content",
  fast_food: "Processed foods, takeout, junk food",
  drink: "Coffee, tea, juices, other beverages",
};

/**
 * Get category description
 */
export const getCategoryDescription = (categoryId: MealCategory): string => {
  return CATEGORY_DESCRIPTIONS[categoryId];
};

/**
 * Categories that should be considered as "breaking fast"
 * Water typically doesn't break intermittent fasting
 */
export const FASTING_BREAKING_CATEGORIES: Set<MealCategory> = new Set([
  "fruit",
  "light_meal",
  "medium_meal",
  "heavy_meal",
  "fast_food",
  "drink", // Most drinks break fasting (coffee with milk, juices, etc.)
]);

/**
 * Check if category breaks fasting
 */
export const doesCategoryBreakFasting = (categoryId: MealCategory): boolean => {
  return FASTING_BREAKING_CATEGORIES.has(categoryId);
};

/**
 * Export default configuration for easy importing
 */
export default {
  MEAL_CATEGORIES,
  MEAL_COLORS,
  CATEGORY_GROUPS,
  CATEGORY_WEIGHTS,
  RECOMMENDED_GAPS,
  CATEGORY_DESCRIPTIONS,
  ALTERNATIVE_ICONS,
  getSortedCategories,
  getCategoryConfig,
  getCategoryColor,
  getCategoryLabel,
  getCategoryIcon,
  isValidCategory,
  getAllCategoryIds,
  getCategoryGroup,
  getAlternativeIcons,
  getCategoryWeight,
  getRecommendedGap,
  getCategoryDescription,
  doesCategoryBreakFasting,
};
