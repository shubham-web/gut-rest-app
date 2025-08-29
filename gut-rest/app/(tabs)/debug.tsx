import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Table, Row, Rows } from "react-native-table-component";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { databaseService } from "@/services/database";

interface TableInfo {
  name: string;
  sql: string;
}

interface TableData {
  tableName: string;
  columns: string[];
  rows: any[];
}

export default function DebugScreen() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor(
    { light: "rgba(0, 0, 0, 0.2)", dark: "rgba(255, 255, 255, 0.2)" },
    "text"
  );
  const headerBgColor = useThemeColor(
    { light: "rgba(0, 0, 0, 0.05)", dark: "rgba(255, 255, 255, 0.05)" },
    "text"
  );

  const loadDebugData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await databaseService.initialize();

      // Get table schemas
      const tableSchemas = await databaseService.getTableSchemas();
      setTables(tableSchemas);

      // Get data from all tables
      const allTableData: TableData[] = [];

      for (const table of tableSchemas) {
        const data = await databaseService.getTableData(table.name);
        allTableData.push({
          tableName: table.name,
          columns: data.columns,
          rows: data.rows,
        });
      }

      setTableData(allTableData);
    } catch (err) {
      console.error("Failed to load debug data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load debug data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const clearDatabase = () => {
    Alert.alert(
      "Clear Database",
      "Are you sure you want to clear all data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await databaseService.clearAllData();
              await loadDebugData();
              Alert.alert("Success", "Database cleared successfully");
            } catch (err) {
              Alert.alert("Error", "Failed to clear database");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadDebugData();
  }, []);

  const renderTableSchema = (table: TableInfo) => (
    <ThemedView key={`schema-${table.name}`} style={styles.tableContainer}>
      <ThemedText type="subtitle" style={styles.tableName}>
        📋 {table.name.toUpperCase()} Schema
      </ThemedText>
      <ThemedView style={styles.sqlContainer}>
        <ThemedText type="default" style={styles.sqlText}>
          {table.sql}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const calculateColumnWidth = (
    columnName: string,
    data: TableData
  ): number => {
    // Calculate width based on column name and sample data
    let maxLength = columnName.length;
    const sampleRows = data.rows.slice(0, 10);

    for (const row of sampleRows) {
      const cellContent = row[columnName];
      if (cellContent) {
        maxLength = Math.max(maxLength, String(cellContent).length);
      }
    }

    // Convert to pixel width with some padding
    return Math.min(Math.max(maxLength * 8 + 24, 80), 200);
  };

  const renderTableData = (data: TableData) => {
    const isExpanded = expandedTables.has(data.tableName);

    // Calculate column widths
    const columnWidths = data.columns.map((col) =>
      calculateColumnWidth(col, data)
    );

    // Prepare data for react-native-table-component
    const tableHead = data.columns;
    const tableData = data.rows.slice(0, 50).map((row) =>
      data.columns.map((col) => {
        const value = row[col];
        return value !== null && value !== undefined ? String(value) : "NULL";
      })
    );

    return (
      <ThemedView key={`data-${data.tableName}`} style={styles.tableContainer}>
        <TouchableOpacity
          onPress={() => toggleTableExpansion(data.tableName)}
          style={styles.tableHeader}
        >
          <ThemedText type="subtitle" style={styles.tableName}>
            🗄️ {data.tableName.toUpperCase()} Data ({data.rows.length} rows)
          </ThemedText>
          <ThemedText type="default" style={styles.expandIcon}>
            {isExpanded ? "▼" : "▶"}
          </ThemedText>
        </TouchableOpacity>

        {isExpanded && (
          <>
            {data.columns.length > 0 && (
              <ThemedView style={styles.columnsContainer}>
                <ThemedText type="default" style={styles.columnsTitle}>
                  Columns:
                </ThemedText>
                <ThemedText type="default" style={styles.columnsText}>
                  {data.columns.join(", ")}
                </ThemedText>
              </ThemedView>
            )}

            {data.columns.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.tableScrollView}
              >
                <Table
                  borderStyle={{ borderWidth: 1, borderColor: borderColor }}
                >
                  <Row
                    data={tableHead}
                    style={[
                      styles.tableHead,
                      { backgroundColor: headerBgColor },
                    ]}
                    textStyle={[styles.tableHeadText, { color: textColor }]}
                    widthArr={columnWidths}
                  />
                  <Rows
                    data={tableData}
                    textStyle={[styles.tableText, { color: textColor }]}
                    style={styles.tableRow}
                    widthArr={columnWidths}
                  />
                </Table>
              </ScrollView>
            )}

            {data.rows.length > 50 && (
              <ThemedView style={styles.truncatedMessage}>
                <ThemedText type="default" style={styles.truncatedText}>
                  ... and {data.rows.length - 50} more rows (showing first 50)
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Database Debug</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          View database tables, schemas, and data
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadDebugData}
            tintColor="#4FC3F7"
            colors={["#4FC3F7"]}
          />
        }
      >
        <ThemedView style={styles.content}>
          {error && (
            <ThemedView style={styles.errorCard}>
              <ThemedText type="subtitle" style={styles.errorTitle}>
                ⚠️ Error Loading Debug Data
              </ThemedText>
              <ThemedText type="default" style={styles.errorText}>
                {error}
              </ThemedText>
            </ThemedView>
          )}

          {/* Action Buttons */}
          <ThemedView style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={loadDebugData}
            >
              <ThemedText type="default" style={styles.actionButtonText}>
                🔄 Refresh Data
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={clearDatabase}
            >
              <ThemedText
                type="default"
                style={[styles.actionButtonText, styles.dangerButtonText]}
              >
                🗑️ Clear Database
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Database Info */}
          {!isLoading && tables.length > 0 && (
            <ThemedView style={styles.infoCard}>
              <ThemedText type="subtitle" style={styles.infoTitle}>
                📊 Database Summary
              </ThemedText>
              <ThemedText type="default" style={styles.infoText}>
                • Tables: {tables.length}
              </ThemedText>
              <ThemedText type="default" style={styles.infoText}>
                • Total Records:{" "}
                {tableData.reduce((sum, table) => sum + table.rows.length, 0)}
              </ThemedText>
            </ThemedView>
          )}

          {/* Table Schemas */}
          {!isLoading && tables.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Table Schemas
              </ThemedText>
              {tables.map(renderTableSchema)}
            </ThemedView>
          )}

          {/* Table Data */}
          {!isLoading && tableData.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Table Data
              </ThemedText>
              {tableData.map(renderTableData)}
            </ThemedView>
          )}

          {/* Empty State */}
          {!isLoading && tables.length === 0 && (
            <ThemedView style={styles.emptyState}>
              <ThemedText type="title" style={styles.emptyStateEmoji}>
                🗃️
              </ThemedText>
              <ThemedText type="subtitle" style={styles.emptyStateTitle}>
                No Database Tables Found
              </ThemedText>
              <ThemedText type="default" style={styles.emptyStateDescription}>
                The database might not be initialized or there might be an
                error. Pull to refresh to try again.
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Bottom spacing for tab bar */}
        <ThemedView style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  bottomSpacer: {
    height: 100, // Space for tab bar
  },
  errorCard: {
    backgroundColor: "rgba(255, 99, 99, 0.1)",
    borderColor: "rgba(255, 99, 99, 0.3)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  errorTitle: {
    marginBottom: 8,
    color: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(79, 195, 247, 0.1)",
    borderColor: "rgba(79, 195, 247, 0.3)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#4FC3F7",
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "rgba(255, 99, 99, 0.1)",
    borderColor: "rgba(255, 99, 99, 0.3)",
  },
  dangerButtonText: {
    color: "#FF6B6B",
  },
  infoCard: {
    backgroundColor: "rgba(128, 128, 128, 0.08)",
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    marginBottom: 8,
  },
  infoText: {
    opacity: 0.8,
    marginBottom: 2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  tableContainer: {
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableName: {
    fontSize: 16,
    fontWeight: "600",
  },
  expandIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  sqlContainer: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 4,
    padding: 12,
  },
  sqlText: {
    fontFamily: "monospace",
    fontSize: 12,
    opacity: 0.8,
  },
  columnsContainer: {
    gap: 4,
  },
  columnsTitle: {
    fontWeight: "600",
    opacity: 0.8,
  },
  columnsText: {
    opacity: 0.7,
    fontSize: 12,
  },
  tableScrollView: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHead: {
    height: 50,
  },
  tableHeadText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center" as const,
    paddingHorizontal: 8,
    textTransform: "uppercase" as const,
    paddingVertical: 4,
  },
  tableRow: {
    height: 40,
  },
  tableText: {
    fontSize: 11,
    textAlign: "center" as const,
    paddingHorizontal: 8,
    fontFamily: "monospace",
    paddingVertical: 4,
  },
  truncatedMessage: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: 4,
    marginTop: 8,
  },
  truncatedText: {
    opacity: 0.7,
    fontStyle: "italic",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateDescription: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    maxWidth: 300,
  },
});
