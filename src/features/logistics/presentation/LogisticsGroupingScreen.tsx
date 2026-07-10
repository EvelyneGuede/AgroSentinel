import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { colors } from "../../../theme/colors";

type LogisticsGroupingScreenProps = {
  onBack: () => void;
};

type Volumes = Record<string, number>;

const initialVolumes: Volumes = {
  "Zone Daloa": 5.5,
  "Zone Yamoussoukro": 3.2,
  "Zone Soubre": 12.8,
  "Zone Korhogo": 1.5
};

export function LogisticsGroupingScreen({ onBack }: LogisticsGroupingScreenProps) {
  const [volumes, setVolumes] = useState<Volumes>(initialVolumes);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [tonnage, setTonnage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setVolumes((current) => {
        const nextSoubre = current["Zone Soubre"] + 0.2;
        return {
          ...current,
          "Zone Soubre": nextSoubre >= 15 ? 0 : nextSoubre
        };
      });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  function openRegister(zone: string) {
    setSelectedZone(zone);
    setTonnage("");
  }

  function registerHarvest() {
    const value = Number.parseFloat(tonnage.replace(",", "."));
    if (!selectedZone || Number.isNaN(value) || value <= 0) return;
    setVolumes((current) => ({
      ...current,
      [selectedZone]: (current[selectedZone] ?? 0) + value
    }));
    setSelectedZone(null);
    Alert.alert("Groupage mis a jour", `${value} T enregistrees pour ${selectedZone}.`);
  }

  return (
    <View style={styles.container}>
      <AppHeader title="🚚 Groupage Logistique Live" color={colors.green} onBack={onBack} />
      <View style={styles.liveBanner}>
        <MaterialIcons name="sensors" size={24} color={colors.orange} />
        <Text style={styles.liveText}>Mise a jour en direct des collectes regionales</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {Object.entries(volumes).map(([zone, volume]) => (
          <ZoneCard key={zone} zone={zone} volume={volume} onAdd={() => openRegister(zone)} />
        ))}
        <Text style={styles.threshold}>Seuil de rentabilite camion : 15 Tonnes</Text>
      </ScrollView>

      <Modal transparent visible={Boolean(selectedZone)} animationType="fade" onRequestClose={() => setSelectedZone(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Ma Recolte - {selectedZone}</Text>
            <Text style={styles.dialogCopy}>Indiquez le tonnage a collecter aujourd'hui.</Text>
            <View style={styles.dialogInputWrap}>
              <TextInput
                autoFocus
                value={tonnage}
                onChangeText={setTonnage}
                keyboardType="numeric"
                placeholder="Volume"
                placeholderTextColor="#98A2B3"
                style={styles.dialogInput}
              />
              <Text style={styles.suffix}>T</Text>
            </View>
            <View style={styles.dialogActions}>
              <Pressable onPress={() => setSelectedZone(null)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>
              <Pressable onPress={registerHarvest} style={styles.validateButton}>
                <Text style={styles.validateText}>VALIDER L'ENVOI</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ZoneCard({ zone, volume, onAdd }: { zone: string; volume: number; onAdd: () => void }) {
  const threshold = 15;
  const progress = Math.min(volume / threshold, 1);
  const isReady = progress >= 1;

  return (
    <View style={styles.zoneCard}>
      <View style={styles.zoneHeader}>
        <View>
          <Text style={styles.zoneTitle}>{zone}</Text>
          <Text style={styles.zoneSubtitle}>Collecte en cours...</Text>
        </View>
        <Text style={[styles.volume, { color: isReady ? colors.green : colors.orange }]}>
          {volume.toFixed(1)} T
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: isReady ? colors.green : colors.orange
            }
          ]}
        />
      </View>
      <View style={styles.zoneFooter}>
        <Text style={[styles.missing, { color: isReady ? colors.green : colors.orange }]}>
          {isReady ? "CAMION PRET !" : `Manque ${(threshold - volume).toFixed(1)} T`}
        </Text>
        <Pressable onPress={onAdd} style={styles.addButton}>
          <MaterialIcons name="add-shopping-cart" size={18} color="#FFFFFF" />
          <Text style={styles.addText}>AJOUTER</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  liveBanner: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.orangeLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  liveText: {
    flex: 1,
    color: colors.orangeDark,
    fontWeight: "700"
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.green
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900"
  },
  content: {
    padding: 16,
    paddingBottom: 34
  },
  zoneCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  zoneTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  zoneSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12
  },
  volume: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  progressTrack: {
    height: 8,
    marginTop: 15,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: colors.borderLight
  },
  progressFill: {
    height: "100%",
    borderRadius: 4
  },
  zoneFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  missing: {
    fontSize: 12,
    fontWeight: "700"
  },
  addButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700"
  },
  threshold: {
    marginTop: 4,
    color: colors.subtle,
    fontStyle: "italic",
    textAlign: "center"
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  dialog: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  dialogTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  dialogCopy: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 18,
    fontSize: 13
  },
  dialogInputWrap: {
    marginTop: 15,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center"
  },
  dialogInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16
  },
  suffix: {
    color: colors.muted,
    fontWeight: "700"
  },
  dialogActions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10
  },
  cancelButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelText: {
    color: colors.muted,
    fontWeight: "700"
  },
  validateButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  validateText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
