import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GlobalStyles } from "@/styles/globals";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
  size?: "small" | "medium" | "large";
  centerContent?: boolean;
  children?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  subtitle,
  isLoading = false,
  isEmpty = false,
  emptyText = "--",
  size = "medium",
  centerContent = false,
  children,
}: StatCardProps) {
  const getValueStyle = () => {
    switch (size) {
      case "small":
        return styles.valueSmall;
      case "large":
        return styles.valueLarge;
      default:
        return styles.valueMedium;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ThemedView style={centerContent ? styles.centerContent : undefined}>
          <ThemedText type="subtitle" style={getValueStyle()}>
            --
          </ThemedText>
          {subtitle && (
            <ThemedText type="default" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          )}
        </ThemedView>
      );
    }

    if (isEmpty) {
      return (
        <ThemedView style={centerContent ? styles.centerContent : undefined}>
          <ThemedText
            type="subtitle"
            style={[getValueStyle(), styles.emptyValue]}
          >
            {emptyText}
          </ThemedText>
          {subtitle && (
            <ThemedText
              type="default"
              style={[styles.subtitle, styles.emptyText]}
            >
              {subtitle}
            </ThemedText>
          )}
        </ThemedView>
      );
    }

    return (
      <ThemedView style={centerContent ? styles.centerContent : undefined}>
        <ThemedText type="subtitle" style={getValueStyle()}>
          {value}
        </ThemedText>
        {subtitle && (
          <ThemedText type="default" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
        {children}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="default" style={styles.title}>
        {title}
      </ThemedText>
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  centerContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  valueSmall: {
    fontSize: 20,
    fontWeight: "bold",
  },
  valueMedium: {
    fontSize: 28,
    fontWeight: "bold",
  },
  valueLarge: {
    fontSize: 36,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
    textAlign: "center",
  },
  emptyValue: {
    opacity: 0.5,
  },
  emptyText: {
    opacity: 0.4,
  },
});
