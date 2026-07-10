import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AppHeaderProps = {
  title: string;
  color: string;
  onBack?: () => void;
  rightActions?: React.ReactNode;
};

export function AppHeader({ title, color, onBack, rightActions }: AppHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor: color }]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable accessibilityLabel="Retour" onPress={onBack} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{rightActions}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  side: {
    width: 76,
    flexDirection: "row",
    alignItems: "center"
  },
  right: {
    justifyContent: "flex-end"
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  }
});
