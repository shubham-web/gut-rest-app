import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  // Only apply background color if explicitly specified
  const shouldApplyBackground =
    lightColor !== undefined || darkColor !== undefined;
  const themeBackgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const backgroundColor = shouldApplyBackground
    ? themeBackgroundColor
    : undefined;

  return (
    <View
      style={[backgroundColor ? { backgroundColor } : {}, style]}
      {...otherProps}
    />
  );
}
