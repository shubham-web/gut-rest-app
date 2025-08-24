/**
 * Core type definitions for GutRest app
 * Based on the architecture specification
 */

// Types for meal categories
export type MealCategory =
  | "water"
  | "fruit"
  | "light_meal"
  | "medium_meal"
  | "heavy_meal"
  | "fast_food"
  | "drink";

// Main meal entry interface
export interface MealEntry {
  id: string;
  category: MealCategory;
  timestamp: number; // Unix timestamp in milliseconds
  date: string; // YYYY-MM-DD format for easy querying
  notes?: string; // Optional user notes
  createdAt: number;
  updatedAt: number;
}

// Category configuration for UI display
export interface CategoryConfig {
  id: MealCategory;
  icon: string; // Emoji or icon name
  label: string;
  color: string; // Hex color for theming
  order: number; // Display order in quick add
}

// Daily summary for stats
export interface DailySummary {
  date: string; // YYYY-MM-DD
  entries: MealEntry[];
  totalEntries: number;
  firstIntake?: number; // Timestamp of first intake
  lastIntake?: number; // Timestamp of last intake
  gaps: TimeGap[];
  fastingWindow?: FastingWindow;
}

// Time gap between meals
export interface TimeGap {
  startTime: number;
  endTime: number;
  durationMs: number;
  durationFormatted: string; // "3h 20m"
}

// Fasting tracking
export interface FastingWindow {
  startTime: number; // Last intake of previous day
  endTime: number; // First intake of current day
  durationMs: number;
  durationFormatted: string;
  isIntermittentFasting: boolean; // >= 16 hours
}

// Database service interface
export interface DatabaseService {
  // Meal entries
  insertMealEntry(entry: Omit<MealEntry, "id">): Promise<MealEntry>;
  updateMealEntry(id: string, updates: Partial<MealEntry>): Promise<void>;
  deleteMealEntry(id: string): Promise<void>;
  getMealEntriesByDate(date: string): Promise<MealEntry[]>;
  getMealEntriesInRange(
    startDate: string,
    endDate: string
  ): Promise<MealEntry[]>;

  // Analytics queries
  getDailySummary(date: string): Promise<DailySummary>;
  getWeeklySummaries(startDate: string): Promise<DailySummary[]>;

  // Database lifecycle
  initialize(): Promise<void>;
  close(): Promise<void>;
}

// Storage service interface for user preferences
export interface StorageService {
  // Settings management
  getSettings<T>(key: string, defaultValue: T): Promise<T>;
  setSettings<T>(key: string, value: T): Promise<void>;
  removeSettings(key: string): Promise<void>;
  clearAll(): Promise<void>;
}

// App settings structure
export interface AppSettings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  defaultMealCategory: MealCategory;
  fastingGoalHours: number;
  firstLaunch: boolean;
  onboardingCompleted: boolean;
}

// Context types for state management
export interface MealDataContextType {
  // Current day data
  todayEntries: MealEntry[];
  todaySummary: DailySummary | null;

  // Actions
  addMealEntry: (entry: Omit<MealEntry, "id">) => Promise<void>;
  updateMealEntry: (id: string, updates: Partial<MealEntry>) => Promise<void>;
  deleteMealEntry: (id: string) => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Cache management
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

// Daily statistics for the stats screen
export interface DailyStats {
  shortestGap: TimeGap | null;
  longestGap: TimeGap | null;
  averageGap: number;
  totalGaps: number;
  fastingStreak: number;
  totalIntakeToday: number;
}

// Error types for better error handling
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Database operation result types
export type DatabaseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: AppError;
    };

// Utility types for form handling
export type MealEntryInput = Omit<MealEntry, "id" | "createdAt" | "updatedAt">;

// Navigation types (for future screen navigation)
export type RootStackParamList = {
  "(tabs)": undefined;
  "(modals)/quick-add": {
    editEntry?: MealEntry;
    defaultCategory?: MealCategory;
  };
  "(modals)/edit-entry": {
    entryId: string;
  };
  "(modals)/settings": undefined;
};

// Theme colors for meal categories
export interface MealThemeColors {
  light: Record<MealCategory, string>;
  dark: Record<MealCategory, string>;
}
