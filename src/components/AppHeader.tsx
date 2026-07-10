import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type AppHeaderProps = {
  title: string;
  color: string;
  onBack?: () => void;
  rightActions?: React.ReactNode;
};

export function AppHeader({ title, color, onBack, rightActions }: AppHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={[styles.accentLine, { backgroundColor: color }]} />
      <View style={styles.headerBody}>
        <View style={styles.side}>
          {onBack ? (
            <Pressable accessibilityLabel="Retour" onPress={onBack} style={styles.iconButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <View style={[styles.side, styles.right]}>{rightActions}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  accentLine: {
    height: 3,
    width: "100%",
  },
  headerBody: {
    minHeight: 56,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  side: {
    width: 60,
    flexDirection: "row",
    alignItems: "center",
  },
  right: {
    justifyContent: "flex-end",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.borderLight,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
});
