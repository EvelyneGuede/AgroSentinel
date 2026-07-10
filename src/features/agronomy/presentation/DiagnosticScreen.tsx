import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { DiagnosticModel } from "../../../core/models/DiagnosticModel";
import { getAllDiagnostics, insertDiagnostic } from "../../../core/services/databaseService";
import {
  ClassificationResult,
  CultureType,
  classifyImage,
  loadModel
} from "../../../core/services/tfliteService";
import { colors } from "../../../theme/colors";

type DiagnosticScreenProps = {
  onBack: () => void;
};

const cultures: { label: string; value: CultureType }[] = [
  { label: "CACAO", value: "cacao" },
  { label: "MANGUE", value: "mangue" },
  { label: "TOMATE", value: "tomate" }
];

export function DiagnosticScreen({ onBack }: DiagnosticScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<CultureType>("cacao");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [history, setHistory] = useState<DiagnosticModel[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  useEffect(() => {
    loadModel(selectedCulture).catch(() => undefined);
  }, [selectedCulture]);

  async function pickImage() {
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPermission.status !== "granted") {
      Alert.alert("Galerie bloquee", "Autorise l'acces aux photos pour lancer une analyse.");
      return;
    }

    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });

    if (!image.canceled && image.assets[0]?.uri) {
      await runAnalysis(image.assets[0].uri);
    }
  }

  async function runAnalysis(imageUri?: string) {
    setIsAnalyzing(true);
    setResult(null);

    try {
      let uriToAnalyze = imageUri;
      if (!uriToAnalyze && cameraRef.current && permission?.granted) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
        uriToAnalyze = photo?.uri;
      }

      if (!uriToAnalyze) throw new Error("Aucune image selectionnee");

      const position = await getPositionOrFallback();
      const classification = await classifyImage(uriToAnalyze, selectedCulture);
      const diagnostic: DiagnosticModel = {
        date: formatDate(new Date()),
        disease: classification.label,
        confidence: classification.confidence,
        latitude: position.latitude,
        longitude: position.longitude,
        recommendation: classification.recommendation,
        riskLevel: classification.risk_level,
        isSynced: false
      };

      await insertDiagnostic(diagnostic);
      setPreviewUri(uriToAnalyze);
      setResult(classification);
      Alert.alert("Diagnostic effectue", `Analyse ${selectedCulture.toUpperCase()} enregistree.`);
    } catch (error) {
      Alert.alert("Erreur", error instanceof Error ? error.message : "Analyse impossible");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function openHistory() {
    const diagnostics = await getAllDiagnostics();
    setHistory(diagnostics);
    setHistoryVisible(true);
  }

  const hasCameraPermission = permission?.granted;

  return (
    <View style={styles.container}>
      <AppHeader
        title="🏥 Diagnostic IA"
        color={colors.green}
        onBack={onBack}
        rightActions={
          <>
            <Pressable accessibilityLabel="Galerie" onPress={pickImage} style={styles.headerIcon}>
              <MaterialIcons name="photo-library" size={23} color={colors.text} />
            </Pressable>
            <Pressable accessibilityLabel="Historique" onPress={openHistory} style={styles.headerIcon}>
              <MaterialIcons name="history" size={24} color={colors.text} />
            </Pressable>
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cultureRow}>
          <Text style={styles.cultureLabel}>Culture :</Text>
          {cultures.map((culture) => {
            const selected = selectedCulture === culture.value;
            return (
              <Pressable
                key={culture.value}
                onPress={() => setSelectedCulture(culture.value)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{culture.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.cameraBox}>
          {hasCameraPermission ? (
            <CameraView ref={cameraRef} facing="back" mode="picture" style={styles.camera} />
          ) : previewUri ? (
            <Image source={{ uri: previewUri }} resizeMode="cover" style={styles.camera} />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <MaterialIcons name="camera-enhance" size={78} color="#98A2B3" />
              <Text style={styles.placeholderText}>Visez la feuille ou utilisez la galerie</Text>
              <Pressable onPress={requestPermission} style={styles.permissionButton}>
                <Text style={styles.permissionButtonText}>AUTORISER CAMERA</Text>
              </Pressable>
            </View>
          )}

          {isAnalyzing ? (
            <View style={styles.analysisOverlay}>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text style={styles.analysisText}>ANALYSE IA EN COURS...</Text>
            </View>
          ) : null}
        </View>

        {result ? <ResultCard result={result} /> : null}

        <View style={styles.actionRow}>
          <Pressable disabled={isAnalyzing} onPress={() => runAnalysis()} style={styles.captureButton}>
            <MaterialIcons name="camera-alt" size={22} color="#FFFFFF" />
            <Text style={styles.captureText}>CAPTURER</Text>
          </Pressable>
          <Pressable disabled={isAnalyzing} onPress={pickImage} style={styles.galleryButton}>
            <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>

      <HistorySheet
        diagnostics={history}
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
      />
    </View>
  );
}

function ResultCard({ result }: { result: ClassificationResult }) {
  const riskColor = result.risk_level === "Eleve" ? colors.red : result.risk_level === "Moyen" ? colors.orange : colors.green;
  const riskEmoji = result.risk_level === "Eleve" ? "🔴" : result.risk_level === "Moyen" ? "🟡" : "🟢";
  const confidenceVal = result.confidence * 100;
  const confidencePercent = confidenceVal.toFixed(1);
  
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultTitleRow}>
        <MaterialIcons name="verified" size={24} color={riskColor} />
        <Text style={styles.resultTitle}>{result.label}</Text>
      </View>
      <View style={styles.divider} />
      <View style={[styles.riskBox, { borderLeftColor: riskColor }]}>
        <Text style={styles.riskLabel}>⚠️ NIVEAU DE RISQUE</Text>
        <View style={styles.riskContent}>
          <Text style={[styles.riskValue, { color: riskColor }]}>{riskEmoji} {result.risk_level.toUpperCase()}</Text>
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceBarFill, { width: `${Math.min(confidenceVal, 100)}%`, backgroundColor: riskColor }]} />
          </View>
          <Text style={styles.confidenceText}>Confiance: {confidencePercent}%</Text>
        </View>
      </View>
      <Text style={styles.recommendationLabel}>💡 RECOMMANDATION :</Text>
      <Text style={styles.recommendation}>{result.recommendation}</Text>
    </View>
  );
}

function HistorySheet({
  diagnostics,
  visible,
  onClose
}: {
  diagnostics: DiagnosticModel[];
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Historique des Diagnostics</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={23} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.divider} />
          {diagnostics.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>Aucun diagnostic enregistre</Text>
            </View>
          ) : (
            <FlatList
              data={diagnostics}
              keyExtractor={(item, index) => `${item.id ?? index}`}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <MaterialIcons
                    name="eco"
                    size={25}
                    color={item.riskLevel === "Eleve" ? colors.red : colors.orange}
                  />
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyDisease}>{item.disease}</Text>
                    <Text style={styles.historyMeta}>
                      {item.date}
                      {"\n"}Loc: {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.historyScore}>{Math.round(item.confidence * 100)}%</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

async function getPositionOrFallback() {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") throw new Error("GPS bloque");
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch {
    return { latitude: 6.8276, longitude: -5.2767 };
  }
}

function formatDate(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 22
  },
  headerIcon: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  cultureRow: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 12
  },
  cultureLabel: {
    fontWeight: "900",
    color: colors.text,
    marginRight: 2
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  chipSelected: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeLight
  },
  chipText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12
  },
  chipTextSelected: {
    color: colors.orangeDark
  },
  cameraBox: {
    minHeight: 360,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111827",
    shadowColor: colors.green,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  camera: {
    flex: 1,
    minHeight: 360
  },
  cameraPlaceholder: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    backgroundColor: colors.borderLight
  },
  placeholderText: {
    marginTop: 8,
    textAlign: "center",
    color: colors.muted,
    fontWeight: "600"
  },
  permissionButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  analysisOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)"
  },
  analysisText: {
    marginTop: 14,
    color: "#FFFFFF",
    fontWeight: "700"
  },
  resultCard: {
    marginTop: 14,
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
  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  resultTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  resultLabel: {
    color: colors.muted,
    fontWeight: "700"
  },
  confidence: {
    color: colors.green,
    fontWeight: "700"
  },
  recommendationLabel: {
    marginTop: 12,
    color: colors.orangeDark,
    fontSize: 12,
    fontWeight: "700"
  },
  recommendation: {
    marginTop: 5,
    color: colors.text,
    lineHeight: 20
  },
  actionRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10
  },
  captureButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.green,
    shadowColor: colors.green,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  captureText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.1
  },
  galleryButton: {
    width: 54,
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  sheet: {
    maxHeight: "78%",
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.surface
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D0D5DD"
  },
  sheetHeader: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  sheetTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyHistory: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    color: colors.gray,
    fontWeight: "700"
  },
  historyItem: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center"
  },
  historyCopy: {
    flex: 1,
    paddingHorizontal: 10
  },
  historyDisease: {
    color: colors.text,
    fontWeight: "900"
  },
  historyMeta: {
    marginTop: 3,
    color: colors.gray,
    fontSize: 12,
    lineHeight: 17
  },
  historyScore: {
    color: colors.text,
    fontWeight: "900"
  },
  riskBox: {
    borderLeftWidth: 5,
    paddingLeft: 12,
    paddingVertical: 12,
    marginVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 8
  },
  riskContent: {
    gap: 8
  },
  riskValue: {
    fontSize: 20,
    fontWeight: "900"
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden"
  },
  confidenceBarFill: {
    height: "100%",
    borderRadius: 4
  },
  confidenceText: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: "600"
  }
});

