import { StyleSheet } from "react-native";

/**
 * Global styles for the GutRest app
 * These styles provide consistent spacing, typography, and layout patterns
 */
export const GlobalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },

  // Header styles
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },

  // Content styles
  content: {
    padding: 20,
  },
  contentPadded: {
    padding: 20,
    paddingTop: 10,
  },

  // Card styles
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  cardCompact: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(128, 128, 128, 0.05)",
  },

  // Layout styles
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowSpaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Text styles
  textCenter: {
    textAlign: "center",
  },
  textMuted: {
    opacity: 0.7,
  },
  textBold: {
    fontWeight: "bold",
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    textAlign: "center",
    opacity: 0.7,
    maxWidth: 280,
    lineHeight: 20,
  },

  // Button styles
  buttonPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Form styles
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  inputFocused: {
    borderWidth: 2,
  },

  // Grid styles
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: "30%",
  },

  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Spacing utilities
  marginTop8: { marginTop: 8 },
  marginTop16: { marginTop: 16 },
  marginTop24: { marginTop: 24 },
  marginTop32: { marginTop: 32 },

  marginBottom8: { marginBottom: 8 },
  marginBottom16: { marginBottom: 16 },
  marginBottom24: { marginBottom: 24 },
  marginBottom32: { marginBottom: 32 },

  paddingHorizontal16: { paddingHorizontal: 16 },
  paddingHorizontal20: { paddingHorizontal: 20 },
  paddingVertical8: { paddingVertical: 8 },
  paddingVertical16: { paddingVertical: 16 },
  paddingVertical20: { paddingVertical: 20 },

  // Shadow styles (for elevated components)
  shadowSmall: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  shadowMedium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
});

/**
 * Color constants for meal categories
 * These match the architecture plan and provide consistent theming
 */
export const MealColors = {
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
} as const;

/**
 * Typography scale following the existing ThemedText types
 */
export const Typography = {
  sizes: {
    small: 12,
    default: 16,
    subtitle: 20,
    title: 32,
    large: 40,
  },
  weights: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

/**
 * Spacing scale for consistent layout
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Border radius scale
 */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
