import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

interface FloatingActionButtonProps {
  onPress?: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const backgroundColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "background");

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default behavior: navigate to quick-add modal
      router.push("/quick-add");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[styles.button, { backgroundColor }]}
        onPress={handlePress}
        android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
      >
        <IconSymbol size={24} name="plus" color={textColor} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90, // Position above tab bar (typical tab bar height is ~80px)
    right: 20,
    zIndex: 9999, // Ensure it's above everything
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // Higher elevation for Android
    shadowColor: "#000", // iOS shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
