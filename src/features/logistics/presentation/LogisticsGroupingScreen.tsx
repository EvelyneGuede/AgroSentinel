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
      <AppHeader title="🚚 Groupage Logistique Live" color={colors.purple} onBack={onBack} />
      <View style={styles.liveBanner}>
        <MaterialIcons name="sensors" size={24} color={colors.purple} />
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
        <Text style={[styles.volume, { color: isReady ? colors.green : colors.purple }]}>
          {volume.toFixed(1)} T
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: isReady ? colors.green : colors.purple
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
    padding: 15,
    backgroundColor: "#F3E8FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  liveText: {
    flex: 1,
    color: colors.purple,
    fontWeight: "900"
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 2
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  zoneTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  zoneSubtitle: {
    marginTop: 3,
    color: colors.gray,
    fontSize: 12
  },
  volume: {
    fontSize: 22,
    fontWeight: "900"
  },
  progressTrack: {
    height: 12,
    marginTop: 15,
    overflow: "hidden",
    borderRadius: 6,
    backgroundColor: "#EEF2F6"
  },
  progressFill: {
    height: "100%",
    borderRadius: 6
  },
  zoneFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  missing: {
    flex: 1,
    fontWeight: "900"
  },
  addButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.purple
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  },
  threshold: {
    marginTop: 4,
    color: colors.gray,
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
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  dialogTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  dialogCopy: {
    marginTop: 9,
    color: colors.gray,
    lineHeight: 20
  },
  dialogInputWrap: {
    marginTop: 15,
    minHeight: 54,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center"
  },
  dialogInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16
  },
  suffix: {
    color: colors.gray,
    fontWeight: "900"
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
    color: colors.gray,
    fontWeight: "800"
  },
  validateButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.purple
  },
  validateText: {
    color: "#FFFFFF",
    fontWeight: "900"
  }
});
