import { databaseService } from "../database";
import { storageService } from "../storage";
import { TimeCalculationService } from "../TimeCalculationService";
import { MealEntry, MealCategory } from "../../types";

/**
 * Test suite for the data layer implementation
 * Run this to verify database, storage, and time calculation services work correctly
 */
export class DataLayerTest {
  private testResults: { test: string; passed: boolean; error?: string }[] = [];

  /**
   * Run all tests and return results
   */
  async runAllTests(): Promise<{
    passed: number;
    failed: number;
    results: any[];
  }> {
    console.log("🧪 Starting GutRest Data Layer Tests...\n");
    this.testResults = [];

    // Database tests
    await this.testDatabaseInitialization();
    await this.testMealEntryOperations();
    await this.testDatabaseQueries();

    // Storage tests
    await this.testStorageOperations();
    await this.testAppSettingsOperations();

    // Time calculation tests
    await this.testTimeCalculations();
    await this.testFastingCalculations();

    // Cleanup
    await this.cleanupTestData();

    // Summary
    const passed = this.testResults.filter((r) => r.passed).length;
    const failed = this.testResults.filter((r) => !r.passed).length;

    console.log("\n📊 Test Summary:");
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total: ${this.testResults.length}`);

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.testResults
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`  - ${r.test}: ${r.error}`));
    }

    return {
      passed,
      failed,
      results: this.testResults,
    };
  }

  /**
   * Test database initialization
   */
  private async testDatabaseInitialization(): Promise<void> {
    try {
      await databaseService.initialize();
      this.recordTest("Database Initialization", true);
      console.log("✅ Database initialized successfully");
    } catch (error) {
      this.recordTest("Database Initialization", false, error?.toString());
      console.log("❌ Database initialization failed:", error);
    }
  }

  /**
   * Test meal entry CRUD operations
   */
  private async testMealEntryOperations(): Promise<void> {
    const testDate = new Date().toISOString().split("T")[0];
    const now = Date.now();
    const testEntry = {
      category: "medium_meal" as MealCategory,
      timestamp: now,
      date: testDate,
      notes: "Test meal entry",
      createdAt: now,
      updatedAt: now,
    };

    try {
      // Test INSERT
      const inserted = await databaseService.insertMealEntry(testEntry);
      if (!inserted.id || inserted.category !== testEntry.category) {
        throw new Error("Insert returned invalid data");
      }
      this.recordTest("Insert Meal Entry", true);
      console.log("✅ Meal entry inserted successfully");

      // Test UPDATE
      await databaseService.updateMealEntry(inserted.id, {
        notes: "Updated test meal entry",
      });
      this.recordTest("Update Meal Entry", true);
      console.log("✅ Meal entry updated successfully");

      // Test SELECT
      const entries = await databaseService.getMealEntriesByDate(testDate);
      const foundEntry = entries.find((e) => e.id === inserted.id);
      if (!foundEntry || foundEntry.notes !== "Updated test meal entry") {
        throw new Error("Updated entry not found or not updated correctly");
      }
      this.recordTest("Select Meal Entry", true);
      console.log("✅ Meal entry selected successfully");

      // Store ID for cleanup
      (this as any).testEntryId = inserted.id;
    } catch (error) {
      this.recordTest("Meal Entry CRUD Operations", false, error?.toString());
      console.log("❌ Meal entry operations failed:", error);
    }
  }

  /**
   * Test database queries and analytics
   */
  private async testDatabaseQueries(): Promise<void> {
    const testDate = new Date().toISOString().split("T")[0];

    try {
      // Test daily summary
      const summary = await databaseService.getDailySummary(testDate);
      if (!summary || summary.date !== testDate) {
        throw new Error("Daily summary returned invalid data");
      }
      this.recordTest("Daily Summary Query", true);
      console.log("✅ Daily summary query successful");

      // Test date range query
      const entries = await databaseService.getMealEntriesInRange(
        testDate,
        testDate
      );
      if (!Array.isArray(entries)) {
        throw new Error("Date range query returned invalid data");
      }
      this.recordTest("Date Range Query", true);
      console.log("✅ Date range query successful");
    } catch (error) {
      this.recordTest("Database Queries", false, error?.toString());
      console.log("❌ Database queries failed:", error);
    }
  }

  /**
   * Test storage operations
   */
  private async testStorageOperations(): Promise<void> {
    const testKey = "test_key";
    const testValue = { message: "Hello, Storage!", timestamp: Date.now() };

    try {
      // Test SET
      await storageService.setSettings(testKey, testValue);
      this.recordTest("Storage Set", true);
      console.log("✅ Storage set operation successful");

      // Test GET
      const retrieved = (await storageService.getSettings(testKey, null)) as
        | typeof testValue
        | null;
      if (!retrieved || retrieved.message !== testValue.message) {
        throw new Error("Retrieved value does not match stored value");
      }
      this.recordTest("Storage Get", true);
      console.log("✅ Storage get operation successful");

      // Test REMOVE
      await storageService.removeSettings(testKey);
      const afterRemove = await storageService.getSettings(testKey, "default");
      if (afterRemove !== "default") {
        throw new Error("Value was not removed properly");
      }
      this.recordTest("Storage Remove", true);
      console.log("✅ Storage remove operation successful");
    } catch (error) {
      this.recordTest("Storage Operations", false, error?.toString());
      console.log("❌ Storage operations failed:", error);
    }
  }

  /**
   * Test app settings operations
   */
  private async testAppSettingsOperations(): Promise<void> {
    try {
      // Test get default settings
      const defaultSettings = await storageService.getAppSettings();
      if (!defaultSettings || typeof defaultSettings.theme !== "string") {
        throw new Error("Default settings not returned correctly");
      }
      this.recordTest("Get Default App Settings", true);
      console.log("✅ Default app settings retrieved successfully");

      // Test update settings
      const updatedSettings = await storageService.updateAppSettings({
        theme: "dark",
        fastingGoalHours: 18,
      });
      if (
        updatedSettings.theme !== "dark" ||
        updatedSettings.fastingGoalHours !== 18
      ) {
        throw new Error("Settings were not updated correctly");
      }
      this.recordTest("Update App Settings", true);
      console.log("✅ App settings updated successfully");

      // Reset to defaults for cleanup
      await storageService.resetAppSettings();
      this.recordTest("Reset App Settings", true);
      console.log("✅ App settings reset successfully");
    } catch (error) {
      this.recordTest("App Settings Operations", false, error?.toString());
      console.log("❌ App settings operations failed:", error);
    }
  }

  /**
   * Test time calculations
   */
  private async testTimeCalculations(): Promise<void> {
    try {
      // Create test meal entries
      const now = Date.now();
      const entries: MealEntry[] = [
        {
          id: "test1",
          category: "medium_meal",
          timestamp: now - 3 * 60 * 60 * 1000, // 3 hours ago
          date: new Date().toISOString().split("T")[0],
          notes: "First meal",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "test2",
          category: "light_meal",
          timestamp: now - 1 * 60 * 60 * 1000, // 1 hour ago
          date: new Date().toISOString().split("T")[0],
          notes: "Second meal",
          createdAt: now,
          updatedAt: now,
        },
      ];

      // Test gap calculations
      const gaps = TimeCalculationService.calculateGaps(entries);
      if (gaps.length !== 1 || gaps[0].durationMs !== 2 * 60 * 60 * 1000) {
        throw new Error("Gap calculation incorrect");
      }
      this.recordTest("Time Gap Calculation", true);
      console.log("✅ Time gap calculation successful");

      // Test duration formatting
      const formatted = TimeCalculationService.formatDuration(
        2 * 60 * 60 * 1000
      );
      if (formatted !== "2h") {
        throw new Error(
          `Duration formatting incorrect: expected '2h', got '${formatted}'`
        );
      }
      this.recordTest("Duration Formatting", true);
      console.log("✅ Duration formatting successful");

      // Test eating window calculation
      const eatingWindow =
        TimeCalculationService.calculateEatingWindow(entries);
      if (eatingWindow !== 2 * 60 * 60 * 1000) {
        throw new Error("Eating window calculation incorrect");
      }
      this.recordTest("Eating Window Calculation", true);
      console.log("✅ Eating window calculation successful");
    } catch (error) {
      this.recordTest("Time Calculations", false, error?.toString());
      console.log("❌ Time calculations failed:", error);
    }
  }

  /**
   * Test fasting calculations
   */
  private async testFastingCalculations(): Promise<void> {
    try {
      const now = Date.now();
      const lastEntry: MealEntry = {
        id: "last",
        category: "heavy_meal",
        timestamp: now - 18 * 60 * 60 * 1000, // 18 hours ago
        date: new Date(now - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        createdAt: now,
        updatedAt: now,
      };

      const firstEntry: MealEntry = {
        id: "first",
        category: "fruit",
        timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
        date: new Date().toISOString().split("T")[0],
        createdAt: now,
        updatedAt: now,
      };

      // Test fasting window calculation
      const fastingWindow = TimeCalculationService.calculateFastingWindow(
        lastEntry,
        firstEntry
      );
      if (!fastingWindow || !fastingWindow.isIntermittentFasting) {
        throw new Error("Fasting window calculation incorrect");
      }
      this.recordTest("Fasting Window Calculation", true);
      console.log("✅ Fasting window calculation successful");

      // Test current fasting status
      const fastingStatus = TimeCalculationService.getCurrentFastingStatus(
        lastEntry,
        16
      );
      if (!fastingStatus.isCurrentlyFasting || !fastingStatus.goalReached) {
        throw new Error("Current fasting status calculation incorrect");
      }
      this.recordTest("Current Fasting Status", true);
      console.log("✅ Current fasting status calculation successful");
    } catch (error) {
      this.recordTest("Fasting Calculations", false, error?.toString());
      console.log("❌ Fasting calculations failed:", error);
    }
  }

  /**
   * Clean up test data
   */
  private async cleanupTestData(): Promise<void> {
    try {
      // Delete test entry if it exists
      if ((this as any).testEntryId) {
        await databaseService.deleteMealEntry((this as any).testEntryId);
        console.log("🧹 Test data cleaned up");
      }
      this.recordTest("Cleanup", true);
    } catch (error) {
      this.recordTest("Cleanup", false, error?.toString());
      console.log("⚠️ Cleanup failed:", error);
    }
  }

  /**
   * Record test result
   */
  private recordTest(testName: string, passed: boolean, error?: string): void {
    this.testResults.push({
      test: testName,
      passed,
      error,
    });
  }

  /**
   * Quick smoke test for integration
   */
  static async quickTest(): Promise<boolean> {
    try {
      console.log("🚀 Running quick smoke test...");

      // Initialize database
      await databaseService.initialize();
      console.log("✅ Database ready");

      // Test storage
      await storageService.setSettings("smoke_test", { success: true });
      const result = (await storageService.getSettings("smoke_test", null)) as {
        success: boolean;
      } | null;
      if (!result?.success) throw new Error("Storage test failed");
      console.log("✅ Storage ready");

      // Test time calculations
      const formatted = TimeCalculationService.formatDuration(3600000);
      if (formatted !== "1h") throw new Error("Time calculation test failed");
      console.log("✅ Time calculations ready");

      console.log("🎉 Smoke test passed - Data layer is ready!");
      return true;
    } catch (error) {
      console.error("💥 Smoke test failed:", error);
      return false;
    }
  }
}

// Export test runner
export const dataLayerTest = new DataLayerTest();
