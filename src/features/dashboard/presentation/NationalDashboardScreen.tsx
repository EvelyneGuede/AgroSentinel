import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Region, UrlTile } from "react-native-maps";
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
    const success = await synchronizeData();
    setIsSyncing(false);
    Alert.alert(
      "Synchronisation",
      success
        ? "Synchronisation reussie avec la Gateway Nationale"
        : "Flux de donnees mis a jour (Mode Demo)"
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HeaderStats syncCount={syncCount} />
      <Text style={styles.sectionTitle}>Cartographie Epidemique Nationale (Temps Reel)</Text>
      <View style={styles.mapBox}>
        <MapView style={styles.map} initialRegion={nationalRegion}>
          <UrlTile maximumZ={19} urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Circle
            center={{ latitude: 6.8276, longitude: -5.2767 }}
            radius={15000}
            fillColor="rgba(183,28,28,0.32)"
            strokeColor={colors.red}
            strokeWidth={2}
          />
          {syncCount > 0 ? (
            <Circle
              center={{ latitude: 7.6833, longitude: -5.0333 }}
              radius={10000}
              fillColor="rgba(245,124,0,0.32)"
              strokeColor={colors.orange}
              strokeWidth={2}
            />
          ) : null}
        </MapView>
      </View>
      <Text style={styles.sectionTitle}>Flux d'Approvisionnement & Previsions</Text>
      <SupplyFlowCard
        product="Cacao"
        volume={`${1200 + syncCount * 10} T`}
        trend="+12%"
        status="Securise"
        color={colors.blue}
      />
      <SupplyFlowCard
        product="Vivrier (Tomate/Mais)"
        volume={`${450 + syncCount * 5} T`}
        trend="+25%"
        status="Flux Optimal"
        color={colors.green}
      />
      <Pressable disabled={isSyncing} onPress={handleSync} style={styles.syncButton}>
        {isSyncing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <MaterialIcons name="sync" size={22} color="#FFFFFF" />
        )}
        <Text style={styles.syncText}>LANCER LA SYNCHRONISATION NATIONALE</Text>
      </Pressable>
    </ScrollView>
  );
}

function HeaderStats({ syncCount }: { syncCount: number }) {
  return (
    <View style={styles.stats}>
      <StatItem 
        label="Alertes" 
        value={`${14 + syncCount}`} 
        icon="warning-amber" 
        color="#FF5252" 
        subtext="en temps réel"
      />
      <StatItem 
        label="Producteurs" 
        value={`${450 + syncCount}`} 
        icon="people" 
        color="#4CAF50"
        subtext="connectés"
      />
      <StatItem
        label="Impact CI"
        value={`${(1.2 + syncCount * 0.1).toFixed(1)} Md`}
        icon="trending-up"
        color="#69F0AE"
        subtext="FCFA à risque"
      />
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
      <View style={[styles.statIconBox, { backgroundColor: `${color}1A` }]}>
        <MaterialIcons name={icon} color={color} size={28} />
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
      <View style={[styles.supplyIcon, { backgroundColor: `${color}1A` }]}>
        <MaterialIcons name="inventory" color={color} size={24} />
      </View>
      <View style={styles.supplyCopy}>
        <Text style={styles.supplyProduct}>{product}</Text>
        <Text style={styles.supplyStatus}>Statut: {status}</Text>
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
  stats: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.blue
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  statValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  statLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12
  },
  statSubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 2
  },
  sectionTitle: {
    padding: 16,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  mapBox: {
    height: 350,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.blue,
    overflow: "hidden",
    backgroundColor: "#DDE7F2"
  },
  map: {
    flex: 1
  },
  supplyCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center"
  },
  supplyIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center"
  },
  supplyCopy: {
    flex: 1,
    paddingHorizontal: 12
  },
  supplyProduct: {
    color: colors.text,
    fontWeight: "900"
  },
  supplyStatus: {
    marginTop: 3,
    color: colors.gray
  },
  supplyNumbers: {
    alignItems: "flex-end"
  },
  supplyVolume: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  supplyTrend: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  syncButton: {
    minHeight: 58,
    marginHorizontal: 16,
    marginTop: 22,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  syncText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center"
  }
});
