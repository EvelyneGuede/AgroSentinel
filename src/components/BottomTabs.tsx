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
            <View style={[styles.iconWrap, isActive && { backgroundColor: `${tab.color}16` }]}> 
              <MaterialIcons name={tab.icon} size={22} color={isActive ? tab.color : colors.gray} />
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
    minHeight: 78,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
    shadowColor: "#09111C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  iconWrap: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: -0.1
  }
});
