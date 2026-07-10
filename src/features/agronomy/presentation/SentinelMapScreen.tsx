import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region, UrlTile } from "react-native-maps";
import { AppHeader } from "../../../components/AppHeader";
import { DiagnosticModel } from "../../../core/models/DiagnosticModel";
import { getAllDiagnostics } from "../../../core/services/databaseService";
import { colors } from "../../../theme/colors";

type SentinelMapScreenProps = {
  onBack: () => void;
};

const defaultRegion: Region = {
  latitude: 6.8276,
  longitude: -5.2767,
  latitudeDelta: 4.6,
  longitudeDelta: 4.6
};

export function SentinelMapScreen({ onBack }: SentinelMapScreenProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState<Region>(defaultRegion);

  useEffect(() => {
    determinePosition();
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  async function determinePosition() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") throw new Error("GPS indisponible");
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      setRegion((current) => ({
        ...current,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }));
    } catch {
      setRegion(defaultRegion);
    }
  }

  async function loadData() {
    const data = await getAllDiagnostics();
    setDiagnostics(data);
    setIsLoading(false);
  }

  return (
    <View style={styles.container}>
      <AppHeader title="🗺️ Sentinelle Epidemique Live" color={colors.red} onBack={onBack} />
      <View style={styles.mapWrap}>
        <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
          <UrlTile maximumZ={19} urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {diagnostics.map((diag, index) => (
            <Marker
              key={`${diag.id ?? index}-${diag.date}`}
              coordinate={{ latitude: diag.latitude, longitude: diag.longitude }}
            >
              <PulseMarker riskLevel={diag.riskLevel} label={diag.disease} />
            </Marker>
          ))}
          <Marker coordinate={{ latitude: 7.5399, longitude: -5.5471 }}>
            <PulseMarker riskLevel="Eleve" label="Cacao : Pourriture Brune" />
          </Marker>
          <Marker coordinate={{ latitude: 9.458, longitude: -5.6295 }}>
            <PulseMarker riskLevel="Moyen" label="Mangue : Anthracnose" />
          </Marker>
        </MapView>
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>📊 Légende d'Alertes</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#FF5252" }]} />
            <Text style={styles.legendText}>🔴 Critique</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#FF9800" }]} />
            <Text style={styles.legendText}>🟡 Moyen</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
            <Text style={styles.legendText}>🟢 Normal</Text>
          </View>
          <View style={styles.legendRow}>
            <MaterialIcons name="radar" color={colors.blue} size={16} />
            <Text style={styles.legendCount}>En direct: {diagnostics.length + 2}</Text>
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : null}
      </View>
      <Pressable onPress={loadData} style={styles.fab}>
        <MaterialIcons name="refresh" size={25} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function PulseMarker({ riskLevel, label }: { riskLevel: string; label: string }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const markerColor = riskLevel === "Eleve" ? colors.red : colors.orange;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true
      })
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.8] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <Pressable onPress={() => Alert.alert("Alerte", label)} style={styles.marker}>
      <Animated.View
        style={[
          styles.markerPulse,
          {
            backgroundColor: markerColor,
            opacity,
            transform: [{ scale }]
          }
        ]}
      />
      <MaterialIcons name="warning" color={markerColor} size={31} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  mapWrap: {
    flex: 1
  },
  map: {
    flex: 1
  },
  legend: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  legendTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 6
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.red
  },
  legendStrong: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900"
  },
  legendText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600"
  },
  legendCount: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900"
  },
  loading: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)"
  },
  loadingText: {
    color: colors.red,
    fontWeight: "900"
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
    elevation: 6
  },
  marker: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center"
  },
  markerPulse: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17
  }
});
