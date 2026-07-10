import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type TabKey = "agronomy" | "logistics" | "state";

type Tab = {
  key: TabKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

const tabs: Tab[] = [
  { key: "agronomy", label: "Agronomie", icon: "psychology", color: colors.green },
  { key: "logistics", label: "Logistique", icon: "local-shipping", color: colors.orange },
  { key: "state", label: "État", icon: "analytics", color: colors.greenMedium }
];

type BottomTabsProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

export function BottomTabs({ activeTab, onChange }: BottomTabsProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, isActive && { backgroundColor: `${tab.color}10` }]}>
              <MaterialIcons name={tab.icon} size={24} color={isActive ? tab.color : colors.gray} />
            </View>
            <Text style={[styles.label, { color: isActive ? tab.color : colors.muted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { TabKey };

const styles = StyleSheet.create({
  container: {
    minHeight: 70,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  iconWrap: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: -0.1
  }
});
