import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export type OfflineMapMarker = {
  id: string;
  label: string;
  riskLevel?: string;
  onPress?: () => void;
};

type OfflineMapPanelProps = {
  markers?: OfflineMapMarker[];
  emptyLabel: string;
  title?: string;
};

// Cette carte locale ne dépend ni de Google Maps ni des services Play. Elle est
// volontairement utilisable hors connexion et évite les crashs natifs observés
// sur certains téléphones Android pendant la démonstration.
export function OfflineMapPanel({ markers = [], emptyLabel, title = "Vue locale hors connexion" }: OfflineMapPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid} />
      <View style={[styles.route, styles.routeOne]} />
      <View style={[styles.route, styles.routeTwo]} />
      <View style={styles.header}>
        <MaterialIcons name="map" size={18} color={colors.greenDark} />
        <Text style={styles.title}>{title}</Text>
      </View>

      {markers.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="location-off" size={30} color={colors.subtle} />
          <Text style={styles.emptyText}>{emptyLabel}</Text>
        </View>
      ) : (
        markers.slice(0, 8).map((marker, index) => {
          const left = `${12 + ((index * 31) % 70)}%` as `${number}%`;
          const top = `${28 + ((index * 19) % 52)}%` as `${number}%`;
          const critical = marker.riskLevel === "Eleve" || marker.riskLevel === "Critique";
          const markerColor = critical ? colors.red : colors.orange;

          return (
            <Pressable
              key={marker.id}
              onPress={marker.onPress}
              style={[styles.pin, { left, top, backgroundColor: markerColor }]}
            >
              <MaterialIcons name="warning" size={18} color="#FFFFFF" />
              <Text numberOfLines={1} style={styles.pinLabel}>{marker.label}</Text>
            </Pressable>
          );
        })
      )}
      <Text style={styles.caption}>{markers.length} alerte{markers.length > 1 ? "s" : ""} locale{markers.length > 1 ? "s" : ""}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 280,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#E9F6EE",
    borderWidth: 1,
    borderColor: "#B8DDC4"
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
    backgroundColor: "#D9EEDF"
  },
  route: {
    position: "absolute",
    height: 7,
    width: "125%",
    borderRadius: 8,
    backgroundColor: "#B7D8C0",
    transform: [{ rotate: "-20deg" }]
  },
  routeOne: { top: "43%", left: "-18%" },
  routeTwo: { top: "68%", left: "-15%", transform: [{ rotate: "18deg" }] },
  header: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  title: { color: colors.greenDark, fontSize: 12, fontWeight: "800" },
  empty: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32
  },
  emptyText: { marginTop: 10, color: colors.muted, textAlign: "center", fontSize: 13, fontWeight: "600" },
  pin: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  pinLabel: {
    position: "absolute",
    top: 40,
    width: 92,
    paddingHorizontal: 4,
    color: colors.text,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center"
  },
  caption: {
    position: "absolute",
    right: 12,
    bottom: 10,
    color: colors.greenDark,
    fontSize: 11,
    fontWeight: "800"
  }
});
