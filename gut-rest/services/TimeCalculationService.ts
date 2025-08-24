import {
  MealEntry,
  TimeGap,
  FastingWindow,
  DailySummary,
  DailyStats,
} from "../types";

/**
 * Service for calculating time gaps, fasting windows, and meal timing statistics
 */
export class TimeCalculationService {
  /**
   * Calculate gaps between consecutive meal entries
   * @param entries Array of meal entries sorted by timestamp
   * @returns Array of time gaps between consecutive meals
   */
  static calculateGaps(entries: MealEntry[]): TimeGap[] {
    if (entries.length < 2) {
      return [];
    }

    // Ensure entries are sorted by timestamp
    const sortedEntries = [...entries].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const gaps: TimeGap[] = [];

    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const startTime = sortedEntries[i].timestamp;
      const endTime = sortedEntries[i + 1].timestamp;
      const durationMs = endTime - startTime;

      gaps.push({
        startTime,
        endTime,
        durationMs,
        durationFormatted: this.formatDuration(durationMs),
      });
    }

    console.log(
      `[TimeCalculation] Calculated ${gaps.length} gaps for ${entries.length} entries`
    );
    return gaps;
  }

  /**
   * Calculate fasting window between the last entry of previous day and first entry of current day
   * @param lastEntryYesterday Last meal entry from previous day (optional)
   * @param firstEntryToday First meal entry from current day (optional)
   * @returns FastingWindow object or null if calculation not possible
   */
  static calculateFastingWindow(
    lastEntryYesterday: MealEntry | null,
    firstEntryToday: MealEntry | null
  ): FastingWindow | null {
    if (!lastEntryYesterday || !firstEntryToday) {
      console.log(
        "[TimeCalculation] Cannot calculate fasting window: missing entries"
      );
      return null;
    }

    const startTime = lastEntryYesterday.timestamp;
    const endTime = firstEntryToday.timestamp;
    const durationMs = endTime - startTime;

    // Sanity check: fasting window should be positive and reasonable (< 48 hours)
    if (durationMs <= 0 || durationMs > 48 * 60 * 60 * 1000) {
      console.warn(
        "[TimeCalculation] Invalid fasting window duration:",
        durationMs
      );
      return null;
    }

    const fastingWindow: FastingWindow = {
      startTime,
      endTime,
      durationMs,
      durationFormatted: this.formatDuration(durationMs),
      isIntermittentFasting: durationMs >= 16 * 60 * 60 * 1000, // 16+ hours
    };

    console.log("[TimeCalculation] Calculated fasting window:", {
      duration: fastingWindow.durationFormatted,
      isIF: fastingWindow.isIntermittentFasting,
    });

    return fastingWindow;
  }

  /**
   * Format duration in milliseconds to human-readable format
   * @param milliseconds Duration in milliseconds
   * @returns Formatted string like "3h 20m" or "45m"
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 0) {
      return "0m";
    }

    const totalMinutes = Math.floor(milliseconds / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Format duration with more precision for longer periods
   * @param milliseconds Duration in milliseconds
   * @returns Formatted string like "1d 3h 20m" for long durations
   */
  static formatLongDuration(milliseconds: number): string {
    if (milliseconds < 0) {
      return "0m";
    }

    const totalMinutes = Math.floor(milliseconds / (60 * 1000));
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }

    return parts.length > 0 ? parts.join(" ") : "0m";
  }

  /**
   * Get comprehensive daily statistics from a daily summary
   * @param summary Daily summary with entries and gaps
   * @returns Daily statistics object
   */
  static getDailyStats(summary: DailySummary): DailyStats {
    const { gaps, fastingWindow, entries } = summary;

    let shortestGap: TimeGap | null = null;
    let longestGap: TimeGap | null = null;
    let averageGap = 0;
    let fastingStreak = 0;

    if (gaps.length > 0) {
      // Find shortest and longest gaps
      shortestGap = gaps.reduce((shortest, current) =>
        current.durationMs < shortest.durationMs ? current : shortest
      );

      longestGap = gaps.reduce((longest, current) =>
        current.durationMs > longest.durationMs ? current : longest
      );

      // Calculate average gap
      const totalGapMs = gaps.reduce((sum, gap) => sum + gap.durationMs, 0);
      averageGap = totalGapMs / gaps.length;
    }

    // Calculate fasting streak (simple implementation - could be enhanced)
    if (fastingWindow?.isIntermittentFasting) {
      fastingStreak = 1; // This would need to be calculated across multiple days
    }

    const stats: DailyStats = {
      shortestGap,
      longestGap,
      averageGap,
      totalGaps: gaps.length,
      fastingStreak,
      totalIntakeToday: entries.length,
    };

    console.log("[TimeCalculation] Calculated daily stats:", {
      totalGaps: stats.totalGaps,
      averageGap: this.formatDuration(stats.averageGap),
      totalIntake: stats.totalIntakeToday,
    });

    return stats;
  }

  /**
   * Calculate eating window (time between first and last meal of the day)
   * @param entries Array of meal entries for a day
   * @returns Eating window duration in milliseconds, or 0 if less than 2 entries
   */
  static calculateEatingWindow(entries: MealEntry[]): number {
    if (entries.length < 2) {
      return 0;
    }

    const sortedEntries = [...entries].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    const firstEntry = sortedEntries[0];
    const lastEntry = sortedEntries[sortedEntries.length - 1];

    return lastEntry.timestamp - firstEntry.timestamp;
  }

  /**
   * Determine if a gap qualifies as a significant break (configurable threshold)
   * @param gap Time gap to evaluate
   * @param thresholdHours Minimum hours to consider significant (default: 3)
   * @returns True if gap is significant
   */
  static isSignificantGap(gap: TimeGap, thresholdHours: number = 3): boolean {
    const thresholdMs = thresholdHours * 60 * 60 * 1000;
    return gap.durationMs >= thresholdMs;
  }

  /**
   * Get time until next recommended meal based on last entry and target gap
   * @param lastEntry Last meal entry
   * @param targetGapHours Target hours between meals (default: 4)
   * @returns Milliseconds until next recommended meal, or 0 if time has passed
   */
  static getTimeUntilNextMeal(
    lastEntry: MealEntry,
    targetGapHours: number = 4
  ): number {
    const targetGapMs = targetGapHours * 60 * 60 * 1000;
    const nextMealTime = lastEntry.timestamp + targetGapMs;
    const now = Date.now();

    return Math.max(0, nextMealTime - now);
  }

  /**
   * Analyze eating patterns for insights
   * @param summaries Array of daily summaries to analyze
   * @returns Pattern analysis object
   */
  static analyzeEatingPatterns(summaries: DailySummary[]) {
    if (summaries.length === 0) {
      return {
        averageEatingWindow: 0,
        averageMealsPerDay: 0,
        averageFastingHours: 0,
        intermittentFastingDays: 0,
        consistencyScore: 0,
      };
    }

    let totalEatingWindowMs = 0;
    let totalMealsPerDay = 0;
    let totalFastingMs = 0;
    let ifDays = 0;
    let validEatingWindows = 0;
    let validFastingWindows = 0;

    for (const summary of summaries) {
      totalMealsPerDay += summary.totalEntries;

      // Calculate eating window
      if (summary.entries.length >= 2) {
        const eatingWindow = this.calculateEatingWindow(summary.entries);
        totalEatingWindowMs += eatingWindow;
        validEatingWindows++;
      }

      // Track fasting data
      if (summary.fastingWindow) {
        totalFastingMs += summary.fastingWindow.durationMs;
        validFastingWindows++;

        if (summary.fastingWindow.isIntermittentFasting) {
          ifDays++;
        }
      }
    }

    const averageEatingWindow =
      validEatingWindows > 0 ? totalEatingWindowMs / validEatingWindows : 0;

    const averageMealsPerDay = totalMealsPerDay / summaries.length;

    const averageFastingMs =
      validFastingWindows > 0 ? totalFastingMs / validFastingWindows : 0;

    // Simple consistency score based on meal count variance
    const mealCounts = summaries.map((s) => s.totalEntries);
    const avgMeals =
      mealCounts.reduce((sum, count) => sum + count, 0) / mealCounts.length;
    const variance =
      mealCounts.reduce(
        (sum, count) => sum + Math.pow(count - avgMeals, 2),
        0
      ) / mealCounts.length;
    const consistencyScore = Math.max(0, 100 - variance * 20); // Scale to 0-100

    return {
      averageEatingWindow: averageEatingWindow,
      averageEatingWindowFormatted: this.formatDuration(averageEatingWindow),
      averageMealsPerDay: Math.round(averageMealsPerDay * 10) / 10,
      averageFastingHours:
        Math.round((averageFastingMs / (60 * 60 * 1000)) * 10) / 10,
      intermittentFastingDays: ifDays,
      intermittentFastingPercentage: Math.round(
        (ifDays / summaries.length) * 100
      ),
      consistencyScore: Math.round(consistencyScore),
      totalDaysAnalyzed: summaries.length,
    };
  }

  /**
   * Get current fasting status based on last meal entry
   * @param lastEntry Last meal entry
   * @param fastingGoalHours Target fasting duration (default: 16)
   * @returns Current fasting status
   */
  static getCurrentFastingStatus(
    lastEntry: MealEntry | null,
    fastingGoalHours: number = 16
  ) {
    if (!lastEntry) {
      return {
        isCurrentlyFasting: false,
        currentFastDuration: 0,
        currentFastFormatted: "0m",
        timeToGoal: 0,
        timeToGoalFormatted: "0m",
        goalReached: false,
        progressPercentage: 0,
      };
    }

    const now = Date.now();
    const currentFastDuration = now - lastEntry.timestamp;
    const goalMs = fastingGoalHours * 60 * 60 * 1000;
    const timeToGoal = Math.max(0, goalMs - currentFastDuration);
    const progressPercentage = Math.min(
      100,
      (currentFastDuration / goalMs) * 100
    );

    return {
      isCurrentlyFasting: currentFastDuration > 0,
      currentFastDuration,
      currentFastFormatted: this.formatDuration(currentFastDuration),
      timeToGoal,
      timeToGoalFormatted: this.formatDuration(timeToGoal),
      goalReached: currentFastDuration >= goalMs,
      progressPercentage: Math.round(progressPercentage),
    };
  }

  /**
   * Convert duration string back to milliseconds (utility for parsing)
   * @param durationString Formatted duration string like "3h 20m"
   * @returns Duration in milliseconds
   */
  static parseDuration(durationString: string): number {
    const hourMatch = durationString.match(/(\d+)h/);
    const minuteMatch = durationString.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    return (hours * 60 + minutes) * 60 * 1000;
  }
}

// Export default instance for convenience
export const timeCalculationService = TimeCalculationService;
