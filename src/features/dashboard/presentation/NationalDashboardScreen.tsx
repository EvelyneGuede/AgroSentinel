import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import {
  getSyncCount,
  subscribeToSync,
  synchronizeData
} from "../../../core/services/syncService";
import { colors } from "../../../theme/colors";

const nationalRegion: Region = {
  latitude: 7.5399,
  longitude: -5.5471,
  latitudeDelta: 5.5,
  longitudeDelta: 5.5
};

export function NationalDashboardScreen() {
  const [syncCount, setSyncCount] = useState(getSyncCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSync(setSyncCount);
    return () => {
      unsubscribe();
    };
  }, []);

  async function handleSync() {
    setIsSyncing(true);
    const result = await synchronizeData();
    setIsSyncing(false);
    Alert.alert(
      "Synchronisation",
      result.message
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <HeaderStats syncCount={syncCount} />
      
      <Text style={styles.sectionTitle}>Cartographie locale — aucune donnée nationale</Text>
      
      <View style={styles.mapBox}>
        <MapView mapType="none" style={styles.map} initialRegion={nationalRegion}>
        </MapView>
      </View>
      
      <Text style={styles.sectionTitle}>Flux d'approvisionnement — simulation locale</Text>
      
      <SupplyFlowCard
        product="Cacao"
        volume={`${1200 + syncCount * 10} T`}
        trend="+12%"
        status="Simulation"
        color={colors.orange}
      />
      <SupplyFlowCard
        product="Vivrier (Tomate/Maïs)"
        volume={`${450 + syncCount * 5} T`}
        trend="+25%"
        status="Simulation"
        color={colors.green}
      />
      
      <Pressable disabled={isSyncing} onPress={handleSync} style={styles.syncButton}>
        {isSyncing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <MaterialIcons name="sync" size={20} color="#FFFFFF" />
        )}
        <Text style={styles.syncText}>VÉRIFIER LA CONFIGURATION DE SYNCHRONISATION</Text>
      </Pressable>
    </ScrollView>
  );
}

function HeaderStats({ syncCount }: { syncCount: number }) {
  return (
    <View style={styles.statsCard}>
      <View style={styles.stats}>
        <StatItem 
          label="Alertes" 
          value={syncCount > 0 ? `${syncCount}` : "—"}
          icon="warning" 
          color={colors.red} 
          subtext="données locales"
        />
        <StatItem 
          label="Producteurs" 
          value="—"
          icon="people" 
          color={colors.green}
          subtext="non connecté"
        />
        <StatItem
          label="Impact CI"
          value="—"
          icon="trending-up"
          color={colors.orange}
          subtext="non calculé"
        />
      </View>
    </View>
  );
}

function StatItem({
  label,
  value,
  icon,
  color,
  subtext
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  subtext?: string;
}) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon} color={color} size={24} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtext ? <Text style={styles.statSubtext}>{subtext}</Text> : null}
    </View>
  );
}

function SupplyFlowCard({
  product,
  volume,
  trend,
  status,
  color
}: {
  product: string;
  volume: string;
  trend: string;
  status: string;
  color: string;
}) {
  return (
    <View style={styles.supplyCard}>
      <View style={[styles.supplyIcon, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name="inventory" color={color} size={22} />
      </View>
      <View style={styles.supplyCopy}>
        <Text style={styles.supplyProduct}>{product}</Text>
        <Text style={styles.supplyStatus}>Statut : {status}</Text>
      </View>
      <View style={styles.supplyNumbers}>
        <Text style={styles.supplyVolume}>{volume}</Text>
        <Text style={styles.supplyTrend}>{trend}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 34,
    backgroundColor: colors.background
  },
  statsCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  stats: {
    paddingVertical: 18,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  statValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600"
  },
  statSubtext: {
    color: colors.subtle,
    fontSize: 9,
    marginTop: 1
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  mapBox: {
    height: 320,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    backgroundColor: colors.borderLight,
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  map: {
    flex: 1
  },
  supplyCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  supplyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  supplyCopy: {
    flex: 1,
    paddingHorizontal: 12
  },
  supplyProduct: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1
  },
  supplyStatus: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12
  },
  supplyNumbers: {
    alignItems: "flex-end"
  },
  supplyVolume: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  supplyTrend: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "700"
  },
  syncButton: {
    minHeight: 52,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.green,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  syncText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.2,
    textAlign: "center"
  }
});
