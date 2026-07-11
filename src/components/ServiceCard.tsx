import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type ServiceCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress: () => void;
};

export function ServiceCard({ title, subtitle, icon, color, onPress }: ServiceCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.chevronWrap}>
        <MaterialIcons name="chevron-right" size={20} color={colors.subtle} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 86,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: "hidden"
  },
  pressed: {
    opacity: 0.9,
    borderColor: colors.border,
    transform: [{ scale: 0.98 }]
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 4
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    paddingHorizontal: 12
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  }
});