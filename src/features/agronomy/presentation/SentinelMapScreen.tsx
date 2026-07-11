import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { OfflineMapPanel } from "../../../components/OfflineMapPanel";
import { DiagnosticModel } from "../../../core/models/DiagnosticModel";
import { getAllDiagnostics } from "../../../core/services/databaseService";
import { colors } from "../../../theme/colors";

type SentinelMapScreenProps = {
  onBack: () => void;
};

function hasCoordinates(diagnostic: DiagnosticModel): diagnostic is DiagnosticModel & { latitude: number; longitude: number } {
  return diagnostic.latitude !== null && diagnostic.longitude !== null;
}

export function SentinelMapScreen({ onBack }: SentinelMapScreenProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadData();
    const timer = setInterval(() => void loadData(), 10000);
    return () => clearInterval(timer);
  }, []);

  async function loadData() {
    try {
      setDiagnostics(await getAllDiagnostics());
    } catch {
      // La carte reste disponible même si l'historique local est indisponible.
      setDiagnostics([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Sentinelle épidémique — données locales" color={colors.red} onBack={onBack} />
      <View style={styles.mapWrap}>
        <OfflineMapPanel
          emptyLabel="Aucun diagnostic géolocalisé pour le moment."
          markers={diagnostics.filter(hasCoordinates).map((diag, index) => ({
            id: `${diag.id ?? index}-${diag.date}`,
            label: diag.disease,
            riskLevel: diag.riskLevel,
            onPress: () => Alert.alert("Alerte", diag.disease)
          }))}
        />
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Légende des diagnostics locaux</Text>
          <Legend color="#FF5252" label="Critique" />
          <Legend color="#FF9800" label="Moyen" />
          <Legend color="#4CAF50" label="Normal" />
          <View style={styles.legendRow}>
            <MaterialIcons name="radar" color={colors.blue} size={16} />
            <Text style={styles.legendCount}>Données locales : {diagnostics.length}</Text>
          </View>
        </View>
        {isLoading ? <View style={styles.loading}><Text style={styles.loadingText}>Chargement...</Text></View> : null}
      </View>
      <Pressable onPress={() => void loadData()} style={styles.fab}>
        <MaterialIcons name="refresh" size={25} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapWrap: { flex: 1, padding: 16 },
  legend: {
    position: "absolute", top: 30, left: 28, padding: 12, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.94)", elevation: 4
  },
  legendTitle: { color: colors.text, fontSize: 12, fontWeight: "900", marginBottom: 6 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 4 },
  legendDot: { width: 11, height: 11, borderRadius: 6 },
  legendText: { color: colors.text, fontSize: 11, fontWeight: "600" },
  legendCount: { color: colors.blue, fontSize: 11, fontWeight: "800" },
  loading: {
    position: "absolute", top: 16, right: 16, bottom: 16, left: 16,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.65)", borderRadius: 16
  },
  loadingText: { color: colors.red, fontWeight: "900" },
  fab: {
    position: "absolute", right: 28, bottom: 28, width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.red, elevation: 6
  }
});
