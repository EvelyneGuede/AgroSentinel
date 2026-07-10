import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { colors } from "../../../theme/colors";

type ROICalculatorScreenProps = {
  onBack: () => void;
};

const yields: Record<string, number> = {
  Cacao: 550,
  Mais: 2000,
  Tomate: 15000,
  Anacarde: 800
};

export function ROICalculatorScreen({ onBack }: ROICalculatorScreenProps) {
  const [surface, setSurface] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Cacao");

  const result = useMemo(() => {
    const surfaceValue = Number.parseFloat(surface.replace(",", ".")) || 0;
    const priceValue = Number.parseFloat(price.replace(",", ".")) || 0;
    const yieldPerHa = yields[selectedCrop] ?? 500;
    const loss = surfaceValue * yieldPerHa * priceValue * 0.35;
    const gain = loss * 0.9;
    return { loss, gain };
  }, [price, selectedCrop, surface]);

  return (
    <View style={styles.container}>
      <AppHeader title="📊 Calculateur de Gain IA" color={colors.amber} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Parametres de la Parcelle</Text>
        <View style={styles.cropGrid}>
          {Object.keys(yields).map((crop) => {
            const selected = selectedCrop === crop;
            return (
              <Pressable
                key={crop}
                onPress={() => setSelectedCrop(crop)}
                style={[styles.cropChip, selected && styles.cropChipSelected]}
              >
                <Text style={[styles.cropText, selected && styles.cropTextSelected]}>{crop}</Text>
              </Pressable>
            );
          })}
        </View>
        <InputWithIcon
          icon="landscape"
          label="Surface (Hectares)"
          value={surface}
          onChangeText={setSurface}
          placeholder="Ex: 2.5"
        />
        <InputWithIcon
          icon="monetization-on"
          label="Prix du Marche (FCFA/kg)"
          value={price}
          onChangeText={setPrice}
          placeholder="Ex: 1500"
        />
        <View style={styles.divider} />
        <ResultCard
          title="RISQUE FINANCIER (SANS IA)"
          value={result.loss}
          color={colors.red}
          subtitle="Perte estimee due aux maladies non detectees."
        />
        <ResultCard
          title="VALEUR SAUVEE PAR AGRIINTELL"
          value={result.gain}
          color={colors.green}
          subtitle="Revenu additionnel grace au diagnostic precoce."
        />
        <Text style={styles.footer}>Donnees basees sur les rendements moyens de l'ANADER (CI)</Text>
      </ScrollView>
    </View>
  );
}

function InputWithIcon({
  icon,
  label,
  value,
  onChangeText,
  placeholder
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <MaterialIcons name={icon} size={23} color={colors.gray} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          style={styles.input}
        />
      </View>
    </View>
  );
}

function ResultCard({
  title,
  value,
  color,
  subtitle
}: {
  title: string;
  value: number;
  color: string;
  subtitle: string;
}) {
  return (
    <View style={[styles.resultCard, { borderColor: color, backgroundColor: `${color}0D` }]}>
      <Text style={[styles.resultTitle, { color }]}>{title}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.resultValue, { color }]}>
        {formatFCFA(value)} FCFA
      </Text>
      <Text style={[styles.resultSubtitle, { color }]}>{subtitle}</Text>
    </View>
  );
}

function formatFCFA(value: number) {
  return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    paddingBottom: 34
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14
  },
  cropGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16
  },
  cropChip: {
    minHeight: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  cropChipSelected: {
    borderColor: colors.amber,
    backgroundColor: "#FFF5DB"
  },
  cropText: {
    color: colors.gray,
    fontWeight: "800"
  },
  cropTextSelected: {
    color: colors.amber
  },
  inputWrap: {
    marginBottom: 14
  },
  inputLabel: {
    marginBottom: 6,
    color: colors.text,
    fontWeight: "800"
  },
  inputRow: {
    minHeight: 54,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16
  },
  divider: {
    height: 1,
    marginVertical: 20,
    backgroundColor: colors.border
  },
  resultCard: {
    marginBottom: 18,
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center"
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  resultValue: {
    width: "100%",
    marginTop: 10,
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center"
  },
  resultSubtitle: {
    marginTop: 10,
    opacity: 0.75,
    fontSize: 12,
    textAlign: "center"
  },
  footer: {
    marginTop: 18,
    color: colors.gray,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center"
  }
});
