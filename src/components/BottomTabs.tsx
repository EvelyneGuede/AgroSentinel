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
  { key: "logistics", label: "Logistique", icon: "local-shipping", color: colors.amber },
  { key: "state", label: "Etat", icon: "analytics", color: colors.blue }
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
            <MaterialIcons name={tab.icon} size={25} color={isActive ? tab.color : "#98A2B3"} />
            <Text style={[styles.label, { color: isActive ? tab.color : "#667085" }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { TabKey };

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  label: {
    fontSize: 12,
    fontWeight: "700"
  }
});
