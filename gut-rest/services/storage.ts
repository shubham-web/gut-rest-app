import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageService, AppSettings, AppError } from "../types";

/**
 * AsyncStorage service implementation for user preferences and app settings
 */
class StorageServiceImpl implements StorageService {
  private readonly prefix = "@gutrest:";

  /**
   * Get a setting value with fallback to default
   */
  async getSettings<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const fullKey = this.getFullKey(key);
      const value = await AsyncStorage.getItem(fullKey);

      if (value === null) {
        console.log(`[Storage] Key '${key}' not found, using default value`);
        return defaultValue;
      }

      const parsed = JSON.parse(value) as T;
      console.log(`[Storage] Retrieved setting '${key}':`, parsed);
      return parsed;
    } catch (error) {
      console.error(`[Storage] Failed to get setting '${key}':`, error);
      return defaultValue;
    }
  }

  /**
   * Set a setting value
   */
  async setSettings<T>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);

      await AsyncStorage.setItem(fullKey, serialized);
      console.log(`[Storage] Setting '${key}' saved successfully`);
    } catch (error) {
      console.error(`[Storage] Failed to set setting '${key}':`, error);
      throw this.createError(
        "STORAGE_SET_FAILED",
        `Failed to save setting '${key}'`,
        error
      );
    }
  }

  /**
   * Remove a specific setting
   */
  async removeSettings(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await AsyncStorage.removeItem(fullKey);
      console.log(`[Storage] Setting '${key}' removed successfully`);
    } catch (error) {
      console.error(`[Storage] Failed to remove setting '${key}':`, error);
      throw this.createError(
        "STORAGE_REMOVE_FAILED",
        `Failed to remove setting '${key}'`,
        error
      );
    }
  }

  /**
   * Clear all app settings
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(this.prefix));

      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
        console.log(`[Storage] Cleared ${appKeys.length} settings`);
      } else {
        console.log("[Storage] No settings to clear");
      }
    } catch (error) {
      console.error("[Storage] Failed to clear all settings:", error);
      throw this.createError(
        "STORAGE_CLEAR_FAILED",
        "Failed to clear all settings",
        error
      );
    }
  }

  /**
   * Get complete app settings with defaults
   */
  async getAppSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      theme: "system",
      notifications: true,
      defaultMealCategory: "medium_meal",
      fastingGoalHours: 16,
      firstLaunch: true,
      onboardingCompleted: false,
    };

    try {
      const settings = await this.getSettings("settings", defaultSettings);
      console.log("[Storage] Loaded app settings:", settings);
      return settings;
    } catch (error) {
      console.warn(
        "[Storage] Failed to load app settings, using defaults:",
        error
      );
      return defaultSettings;
    }
  }

  /**
   * Update app settings partially
   */
  async updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const currentSettings = await this.getAppSettings();
      const newSettings: AppSettings = {
        ...currentSettings,
        ...updates,
      };

      await this.setSettings("settings", newSettings);
      console.log("[Storage] App settings updated:", updates);
      return newSettings;
    } catch (error) {
      console.error("[Storage] Failed to update app settings:", error);
      throw this.createError(
        "SETTINGS_UPDATE_FAILED",
        "Failed to update app settings",
        error
      );
    }
  }

  /**
   * Reset app settings to defaults
   */
  async resetAppSettings(): Promise<AppSettings> {
    try {
      await this.removeSettings("settings");
      const defaultSettings = await this.getAppSettings();
      console.log("[Storage] App settings reset to defaults");
      return defaultSettings;
    } catch (error) {
      console.error("[Storage] Failed to reset app settings:", error);
      throw this.createError(
        "SETTINGS_RESET_FAILED",
        "Failed to reset app settings",
        error
      );
    }
  }

  /**
   * Store onboarding state
   */
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.updateAppSettings({ onboardingCompleted: completed });
  }

  /**
   * Check if this is the first app launch
   */
  async isFirstLaunch(): Promise<boolean> {
    const settings = await this.getAppSettings();
    return settings.firstLaunch;
  }

  /**
   * Mark app as launched (no longer first launch)
   */
  async markAsLaunched(): Promise<void> {
    await this.updateAppSettings({ firstLaunch: false });
  }

  /**
   * Store user theme preference
   */
  async setTheme(theme: AppSettings["theme"]): Promise<void> {
    await this.updateAppSettings({ theme });
  }

  /**
   * Get user theme preference
   */
  async getTheme(): Promise<AppSettings["theme"]> {
    const settings = await this.getAppSettings();
    return settings.theme;
  }

  /**
   * Store notification preference
   */
  async setNotifications(enabled: boolean): Promise<void> {
    await this.updateAppSettings({ notifications: enabled });
  }

  /**
   * Get notification preference
   */
  async getNotifications(): Promise<boolean> {
    const settings = await this.getAppSettings();
    return settings.notifications;
  }

  /**
   * Store default meal category preference
   */
  async setDefaultMealCategory(
    category: AppSettings["defaultMealCategory"]
  ): Promise<void> {
    await this.updateAppSettings({ defaultMealCategory: category });
  }

  /**
   * Get default meal category preference
   */
  async getDefaultMealCategory(): Promise<AppSettings["defaultMealCategory"]> {
    const settings = await this.getAppSettings();
    return settings.defaultMealCategory;
  }

  /**
   * Store fasting goal in hours
   */
  async setFastingGoal(hours: number): Promise<void> {
    if (hours < 8 || hours > 24) {
      throw this.createError(
        "INVALID_FASTING_GOAL",
        "Fasting goal must be between 8 and 24 hours"
      );
    }
    await this.updateAppSettings({ fastingGoalHours: hours });
  }

  /**
   * Get fasting goal in hours
   */
  async getFastingGoal(): Promise<number> {
    const settings = await this.getAppSettings();
    return settings.fastingGoalHours;
  }

  /**
   * Export all app data for backup/sharing
   */
  async exportData(): Promise<Record<string, any>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter((key) => key.startsWith(this.prefix));

      const data: Record<string, any> = {};

      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          const cleanKey = key.replace(this.prefix, "");
          data[cleanKey] = JSON.parse(value);
        }
      }

      console.log(`[Storage] Exported ${Object.keys(data).length} settings`);
      return data;
    } catch (error) {
      console.error("[Storage] Failed to export data:", error);
      throw this.createError(
        "EXPORT_FAILED",
        "Failed to export app data",
        error
      );
    }
  }

  /**
   * Import app data from backup
   */
  async importData(data: Record<string, any>): Promise<void> {
    try {
      const pairs: [string, string][] = [];

      for (const [key, value] of Object.entries(data)) {
        const fullKey = this.getFullKey(key);
        const serialized = JSON.stringify(value);
        pairs.push([fullKey, serialized]);
      }

      await AsyncStorage.multiSet(pairs);
      console.log(`[Storage] Imported ${pairs.length} settings`);
    } catch (error) {
      console.error("[Storage] Failed to import data:", error);
      throw this.createError(
        "IMPORT_FAILED",
        "Failed to import app data",
        error
      );
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    totalKeys: number;
    appKeys: number;
    estimatedSize: number;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter((key) => key.startsWith(this.prefix));

      let estimatedSize = 0;
      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          estimatedSize += key.length + value.length;
        }
      }

      return {
        totalKeys: allKeys.length,
        appKeys: appKeys.length,
        estimatedSize,
      };
    } catch (error) {
      console.error("[Storage] Failed to get storage info:", error);
      return {
        totalKeys: 0,
        appKeys: 0,
        estimatedSize: 0,
      };
    }
  }

  /**
   * Get full storage key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
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
export const storageService = new StorageServiceImpl();

// Export class for testing
export { StorageServiceImpl };

// Export convenience functions for common operations
export const StorageHelpers = {
  /**
   * Quick check if onboarding is completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    const settings = await storageService.getAppSettings();
    return settings.onboardingCompleted;
  },

  /**
   * Complete onboarding process
   */
  async completeOnboarding(): Promise<void> {
    await storageService.updateAppSettings({
      onboardingCompleted: true,
      firstLaunch: false,
    });
  },

  /**
   * Get user's preferred theme with system fallback
   */
  async getEffectiveTheme(): Promise<"light" | "dark"> {
    const theme = await storageService.getTheme();
    if (theme === "system") {
      // In a real app, you'd check the system theme here
      // For now, default to light
      return "light";
    }
    return theme;
  },
};
