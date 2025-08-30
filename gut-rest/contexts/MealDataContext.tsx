import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { MealEntry, DailySummary, MealCategory } from "@/types";
import { databaseService } from "@/services/database";
import {
  getTodayDateString,
  getDateStringFromTimestamp,
} from "@/services/dateUtils";

interface MealDataState {
  todayEntries: MealEntry[];
  todaySummary: DailySummary | null;
  isLoading: boolean;
  error: string | null;
}

type MealDataAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TODAY_ENTRIES"; payload: MealEntry[] }
  | { type: "SET_TODAY_SUMMARY"; payload: DailySummary | null }
  | { type: "ADD_ENTRY"; payload: MealEntry }
  | { type: "UPDATE_ENTRY"; payload: { id: string; entry: MealEntry } }
  | { type: "DELETE_ENTRY"; payload: string };

const initialState: MealDataState = {
  todayEntries: [],
  todaySummary: null,
  isLoading: false,
  error: null,
};

function mealDataReducer(
  state: MealDataState,
  action: MealDataAction
): MealDataState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_TODAY_ENTRIES":
      return { ...state, todayEntries: action.payload };
    case "SET_TODAY_SUMMARY":
      return { ...state, todaySummary: action.payload };
    case "ADD_ENTRY":
      return {
        ...state,
        todayEntries: [...state.todayEntries, action.payload].sort(
          (a, b) => a.timestamp - b.timestamp
        ),
      };
    case "UPDATE_ENTRY":
      return {
        ...state,
        todayEntries: state.todayEntries.map((entry) =>
          entry.id === action.payload.id ? action.payload.entry : entry
        ),
      };
    case "DELETE_ENTRY":
      return {
        ...state,
        todayEntries: state.todayEntries.filter(
          (entry) => entry.id !== action.payload
        ),
      };
    default:
      return state;
  }
}

interface MealDataContextType {
  // State
  todayEntries: MealEntry[];
  todaySummary: DailySummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addMealEntry: (
    category: MealCategory,
    timestamp?: number,
    notes?: string
  ) => Promise<{ success: boolean; isToday: boolean }>;
  updateMealEntry: (id: string, updates: Partial<MealEntry>) => Promise<void>;
  deleteMealEntry: (id: string) => Promise<void>;

  // Utility
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

const MealDataContext = createContext<MealDataContextType | undefined>(
  undefined
);

export function MealDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mealDataReducer, initialState);

  const getTodayLocalDateString = useCallback(() => {
    return getTodayDateString(); // Use local time instead of UTC
  }, []);

  const loadTodayData = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Initialize database if not already done
      await databaseService.initialize();

      const todayDate = getTodayLocalDateString();
      const entries = await databaseService.getMealEntriesByDate(todayDate);
      const summary = await databaseService.getDailySummary(todayDate);

      dispatch({ type: "SET_TODAY_ENTRIES", payload: entries });
      dispatch({ type: "SET_TODAY_SUMMARY", payload: summary });
    } catch (error) {
      console.error("Failed to load today data:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load meal data" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [getTodayLocalDateString]);

  const addMealEntry = useCallback(
    async (category: MealCategory, timestamp?: number, notes?: string) => {
      try {
        dispatch({ type: "SET_ERROR", payload: null });

        // Initialize database if not already done
        await databaseService.initialize();

        const now = timestamp || Date.now();

        // Check if entry is for today using timestamps only
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const isToday =
          now >= todayStart.getTime() && now <= todayEnd.getTime();

        const entryData = {
          category,
          timestamp: now,
          notes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const newEntry = await databaseService.insertMealEntry(entryData);

        // Only add to today's entries if the entry is for today
        if (isToday) {
          dispatch({ type: "ADD_ENTRY", payload: newEntry });
          // Refresh today's data to update gaps and fasting calculations
          await loadTodayData();
        }

        // Return simplified information
        return {
          success: true,
          isToday,
        };
      } catch (error) {
        console.error("Failed to add meal entry:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to add meal entry" });
        throw error;
      }
    },
    [loadTodayData]
  );

  const updateMealEntry = useCallback(
    async (id: string, updates: Partial<MealEntry>) => {
      try {
        dispatch({ type: "SET_ERROR", payload: null });

        // Initialize database if not already done
        await databaseService.initialize();

        await databaseService.updateMealEntry(id, {
          ...updates,
          updatedAt: Date.now(),
        });

        // Find the existing entry and update it
        const existingEntry = state.todayEntries.find(
          (entry) => entry.id === id
        );
        if (existingEntry) {
          const updatedEntry = {
            ...existingEntry,
            ...updates,
            updatedAt: Date.now(),
          };
          dispatch({
            type: "UPDATE_ENTRY",
            payload: { id, entry: updatedEntry },
          });
        }

        // Refresh summary if timestamp changed (affects gaps)
        if (updates.timestamp) {
          await loadTodayData();
        }
      } catch (error) {
        console.error("Failed to update meal entry:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to update meal entry" });
        throw error;
      }
    },
    [state.todayEntries, loadTodayData]
  );

  const deleteMealEntry = useCallback(
    async (id: string) => {
      try {
        dispatch({ type: "SET_ERROR", payload: null });

        // Initialize database if not already done
        await databaseService.initialize();

        await databaseService.deleteMealEntry(id);
        dispatch({ type: "DELETE_ENTRY", payload: id });

        // Refresh summary to recalculate gaps
        await loadTodayData();
      } catch (error) {
        console.error("Failed to delete meal entry:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to delete meal entry" });
        throw error;
      }
    },
    [loadTodayData]
  );

  const refreshData = useCallback(async () => {
    await loadTodayData();
  }, [loadTodayData]);

  const clearCache = useCallback(() => {
    dispatch({ type: "SET_TODAY_ENTRIES", payload: [] });
    dispatch({ type: "SET_TODAY_SUMMARY", payload: null });
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  // Load today's data on mount
  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  const contextValue: MealDataContextType = {
    // State
    todayEntries: state.todayEntries,
    todaySummary: state.todaySummary,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    addMealEntry,
    updateMealEntry,
    deleteMealEntry,

    // Utility
    refreshData,
    clearCache,
  };

  return (
    <MealDataContext.Provider value={contextValue}>
      {children}
    </MealDataContext.Provider>
  );
}

export function useMealData(): MealDataContextType {
  const context = useContext(MealDataContext);
  if (context === undefined) {
    throw new Error("useMealData must be used within a MealDataProvider");
  }
  return context;
}

export { MealDataContext };
