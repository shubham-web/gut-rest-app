import * as SQLite from "expo-sqlite";
import {
  DatabaseService,
  MealEntry,
  DailySummary,
  TimeGap,
  FastingWindow,
  DatabaseResult,
  AppError,
} from "../types";

/**
 * SQLite database service implementation for GutRest app
 */
class DatabaseServiceImpl implements DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize the database and create tables with indexes
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log("[Database] Already initialized");
        return;
      }

      // Open or create database
      this.db = await SQLite.openDatabaseAsync("gutrest.db");
      console.log("[Database] Database opened successfully");

      // Create tables
      await this.createTables();

      this.isInitialized = true;
      console.log("[Database] Initialization completed");
    } catch (error) {
      console.error("[Database] Initialization failed:", error);
      throw this.createError(
        "DB_INIT_FAILED",
        "Failed to initialize database",
        error
      );
    }
  }

  /**
   * Create database tables and indexes
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Create meal_entries table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_entries (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Create indexes for performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_meal_entries_date 
      ON meal_entries(date);
    `);

    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_meal_entries_timestamp 
      ON meal_entries(timestamp);
    `);

    // Create composite index for date + timestamp queries
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_meal_entries_date_timestamp 
      ON meal_entries(date, timestamp);
    `);

    console.log("[Database] Tables and indexes created successfully");
  }

  /**
   * Insert a new meal entry
   */
  async insertMealEntry(entry: Omit<MealEntry, "id">): Promise<MealEntry> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const id = this.generateId();
      const now = Date.now();

      const mealEntry: MealEntry = {
        id,
        ...entry,
        createdAt: now,
        updatedAt: now,
      };

      await this.db.runAsync(
        `INSERT INTO meal_entries 
         (id, category, timestamp, date, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          mealEntry.id,
          mealEntry.category,
          mealEntry.timestamp,
          mealEntry.date,
          mealEntry.notes || null,
          mealEntry.createdAt,
          mealEntry.updatedAt,
        ]
      );

      console.log("[Database] Meal entry inserted:", id);
      return mealEntry;
    } catch (error) {
      console.error("[Database] Insert failed:", error);
      throw this.createError(
        "INSERT_FAILED",
        "Failed to insert meal entry",
        error
      );
    }
  }

  /**
   * Update an existing meal entry
   */
  async updateMealEntry(
    id: string,
    updates: Partial<MealEntry>
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const updatedAt = Date.now();
      const setClause = [];
      const values = [];

      // Build dynamic UPDATE query
      if (updates.category !== undefined) {
        setClause.push("category = ?");
        values.push(updates.category);
      }
      if (updates.timestamp !== undefined) {
        setClause.push("timestamp = ?");
        values.push(updates.timestamp);
      }
      if (updates.date !== undefined) {
        setClause.push("date = ?");
        values.push(updates.date);
      }
      if (updates.notes !== undefined) {
        setClause.push("notes = ?");
        values.push(updates.notes);
      }

      setClause.push("updated_at = ?");
      values.push(updatedAt, id);

      if (setClause.length === 1) {
        // Only updated_at to change, no actual updates
        return;
      }

      const query = `UPDATE meal_entries SET ${setClause.join(
        ", "
      )} WHERE id = ?`;
      const result = await this.db.runAsync(query, values);

      if (result.changes === 0) {
        throw this.createError(
          "ENTRY_NOT_FOUND",
          `Meal entry with id ${id} not found`
        );
      }

      console.log("[Database] Meal entry updated:", id);
    } catch (error) {
      console.error("[Database] Update failed:", error);
      throw error instanceof Error && error.message.includes("ENTRY_NOT_FOUND")
        ? error
        : this.createError(
            "UPDATE_FAILED",
            "Failed to update meal entry",
            error
          );
    }
  }

  /**
   * Delete a meal entry
   */
  async deleteMealEntry(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.runAsync(
        "DELETE FROM meal_entries WHERE id = ?",
        [id]
      );

      if (result.changes === 0) {
        throw this.createError(
          "ENTRY_NOT_FOUND",
          `Meal entry with id ${id} not found`
        );
      }

      console.log("[Database] Meal entry deleted:", id);
    } catch (error) {
      console.error("[Database] Delete failed:", error);
      throw error instanceof Error && error.message.includes("ENTRY_NOT_FOUND")
        ? error
        : this.createError(
            "DELETE_FAILED",
            "Failed to delete meal entry",
            error
          );
    }
  }

  /**
   * Get meal entries for a specific date
   */
  async getMealEntriesByDate(date: string): Promise<MealEntry[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const rows = await this.db.getAllAsync(
        "SELECT * FROM meal_entries WHERE date = ? ORDER BY timestamp ASC",
        [date]
      );

      return rows.map(this.mapRowToMealEntry);
    } catch (error) {
      console.error("[Database] Get entries by date failed:", error);
      throw this.createError(
        "QUERY_FAILED",
        "Failed to retrieve meal entries",
        error
      );
    }
  }

  /**
   * Get meal entries within a date range
   */
  async getMealEntriesInRange(
    startDate: string,
    endDate: string
  ): Promise<MealEntry[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const rows = await this.db.getAllAsync(
        "SELECT * FROM meal_entries WHERE date >= ? AND date <= ? ORDER BY timestamp ASC",
        [startDate, endDate]
      );

      return rows.map(this.mapRowToMealEntry);
    } catch (error) {
      console.error("[Database] Get entries in range failed:", error);
      throw this.createError(
        "QUERY_FAILED",
        "Failed to retrieve meal entries in range",
        error
      );
    }
  }

  /**
   * Get daily summary with gaps and fasting window
   */
  async getDailySummary(date: string): Promise<DailySummary> {
    const entries = await this.getMealEntriesByDate(date);

    const summary: DailySummary = {
      date,
      entries,
      totalEntries: entries.length,
      gaps: [],
    };

    if (entries.length > 0) {
      summary.firstIntake = entries[0].timestamp;
      summary.lastIntake = entries[entries.length - 1].timestamp;

      // Calculate gaps between entries
      summary.gaps = this.calculateTimeGaps(entries);

      // Calculate fasting window (overnight fasting)
      summary.fastingWindow = await this.calculateFastingWindow(date, entries);
    }

    return summary;
  }

  /**
   * Get weekly summaries starting from a date
   */
  async getWeeklySummaries(startDate: string): Promise<DailySummary[]> {
    const summaries: DailySummary[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      const summary = await this.getDailySummary(dateStr);
      summaries.push(summary);
    }

    return summaries;
  }

  /**
   * Get table schemas for debugging
   */
  async getTableSchemas(): Promise<{ name: string; sql: string }[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const rows = await this.db.getAllAsync(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );

      return rows.map((row: any) => ({
        name: row.name,
        sql: row.sql,
      }));
    } catch (error) {
      console.error("[Database] Get table schemas failed:", error);
      throw this.createError(
        "QUERY_FAILED",
        "Failed to retrieve table schemas",
        error
      );
    }
  }

  /**
   * Get table data for debugging
   */
  async getTableData(
    tableName: string
  ): Promise<{ columns: string[]; rows: any[] }> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Get column information
      const columnInfo = await this.db.getAllAsync(
        `PRAGMA table_info(${tableName})`
      );
      const columns = columnInfo.map((col: any) => col.name);

      // Get all data from the table
      const rows = await this.db.getAllAsync(`SELECT * FROM ${tableName}`);

      return {
        columns,
        rows,
      };
    } catch (error) {
      console.error("[Database] Get table data failed:", error);
      throw this.createError(
        "QUERY_FAILED",
        `Failed to retrieve data from table ${tableName}`,
        error
      );
    }
  }

  /**
   * Clear all data from database (for debugging)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Get all table names except sqlite system tables
      const tables = await this.db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );

      // Delete all data from each table
      for (const table of tables) {
        await this.db.runAsync(`DELETE FROM ${(table as any).name}`);
      }

      console.log("[Database] All data cleared successfully");
    } catch (error) {
      console.error("[Database] Clear all data failed:", error);
      throw this.createError(
        "DELETE_FAILED",
        "Failed to clear database data",
        error
      );
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log("[Database] Connection closed");
    }
  }

  /**
   * Calculate time gaps between consecutive meal entries
   */
  private calculateTimeGaps(entries: MealEntry[]): TimeGap[] {
    if (entries.length < 2) return [];

    const gaps: TimeGap[] = [];

    for (let i = 0; i < entries.length - 1; i++) {
      const startTime = entries[i].timestamp;
      const endTime = entries[i + 1].timestamp;
      const durationMs = endTime - startTime;

      gaps.push({
        startTime,
        endTime,
        durationMs,
        durationFormatted: this.formatDuration(durationMs),
      });
    }

    return gaps;
  }

  /**
   * Calculate overnight fasting window
   */
  private async calculateFastingWindow(
    date: string,
    todayEntries: MealEntry[]
  ): Promise<FastingWindow | undefined> {
    // Get yesterday's date
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    try {
      const yesterdayEntries = await this.getMealEntriesByDate(yesterdayStr);

      if (yesterdayEntries.length === 0 || todayEntries.length === 0) {
        return undefined;
      }

      const lastIntakeYesterday =
        yesterdayEntries[yesterdayEntries.length - 1].timestamp;
      const firstIntakeToday = todayEntries[0].timestamp;
      const durationMs = firstIntakeToday - lastIntakeYesterday;

      return {
        startTime: lastIntakeYesterday,
        endTime: firstIntakeToday,
        durationMs,
        durationFormatted: this.formatDuration(durationMs),
        isIntermittentFasting: durationMs >= 16 * 60 * 60 * 1000, // 16+ hours
      };
    } catch (error) {
      console.warn("[Database] Could not calculate fasting window:", error);
      return undefined;
    }
  }

  /**
   * Format duration in milliseconds to human readable format
   */
  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Map database row to MealEntry object
   */
  private mapRowToMealEntry(row: any): MealEntry {
    return {
      id: row.id,
      category: row.category,
      timestamp: row.timestamp,
      date: row.date,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Generate unique ID for meal entries
   */
  private generateId(): string {
    return `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create standardized error object
   */
  private createError(code: string, message: string, details?: any): AppError {
    return {
      code,
      message,
      details,
      timestamp: Date.now(),
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseServiceImpl();

// Export class for testing
export { DatabaseServiceImpl };
