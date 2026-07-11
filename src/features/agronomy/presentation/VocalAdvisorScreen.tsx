import { MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { colors } from "../../../theme/colors";

type VocalAdvisorScreenProps = {
  onBack: () => void;
};

export function VocalAdvisorScreen({ onBack }: VocalAdvisorScreenProps) {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [input, setInput] = useState("");

  async function generateDynamicResponse(query: string) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setIsSearching(true);
    setText(cleanQuery);
    await wait(250);

    const responseText = buildResponse(cleanQuery);
    setResponse(responseText);
    setIsSearching(false);
    Speech.speak(responseText, { language: "fr-FR", pitch: 1, rate: 0.78 });
  }

  function submitInput() {
    if (!input.trim()) return;
    generateDynamicResponse(input);
    setInput("");
  }

  function handleMicrophonePress() {
    if (input.trim()) {
      submitInput();
      return;
    }

    Alert.alert("Saisie vocale non disponible", "Cette démo ne transcrit pas le microphone. Saisissez votre question au clavier.");
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Conseiller agricole — démo locale" color={colors.orange} onBack={onBack} />
      {isSearching ? <View style={styles.progressBar} /> : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.messages}>
          {!text && !response ? (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>💬 Questions rapides :</Text>
              <Pressable
                onPress={() => generateDynamicResponse("Quand traiter le cacao ?")}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>🌾 Traitement cacao</Text>
              </Pressable>
              <Pressable
                onPress={() => generateDynamicResponse("Comment identifier la rouille sur la mangue ?")}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>🥭 Maladies mangue</Text>
              </Pressable>
              <Pressable
                onPress={() => generateDynamicResponse("Quel pesticide pour les tomates ?")}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>🍅 Traitement tomate</Text>
              </Pressable>
              <Pressable
                onPress={() => generateDynamicResponse("Comment améliorer mon rendement ?")}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>📈 Rendement</Text>
              </Pressable>
            </View>
          ) : null}
          <Bubble sender="Vous" message={text} isUser />
          {isSearching ? <Bubble sender="Assistant local" message="Préparation d'une réponse de démonstration..." /> : null}
          {response ? <Bubble sender="Assistant local" message={response} /> : null}
        </ScrollView>
        <View style={styles.inputArea}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={submitInput}
            placeholder="Posez votre question..."
            placeholderTextColor="#98A2B3"
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable onPress={handleMicrophonePress} style={[styles.micButton, isListening && styles.micActive]}>
            {isSearching ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <MaterialIcons name={isListening ? "mic" : "mic-none"} size={25} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({
  sender,
  message,
  isUser = false
}: {
  sender: string;
  message: string;
  isUser?: boolean;
}) {
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.sender}>{sender}</Text>
      <Text style={styles.bubbleText}>{message || "..."}</Text>
    </View>
  );
}

function buildResponse(query: string) {
  const q = query.toLowerCase();
  if (q.includes("cacao")) {
    return "Conseil général : surveillez les cabosses et réduisez l'humidité par l'entretien de la parcelle. Faites confirmer tout traitement par un conseiller agricole local et utilisez uniquement des produits homologués.";
  }
  if (q.includes("mangue")) {
    return "Conseil général : inspectez régulièrement les fruits et retirez les fruits abîmés. Un conseiller local pourra confirmer la cause et les mesures adaptées à votre zone.";
  }
  if (q.includes("tomate")) {
    return "Conseil général : évitez de mouiller le feuillage le soir et surveillez l'apparition de taches. Cette démo ne fournit ni diagnostic ni prix de marché en temps réel.";
  }
  if (q.includes("meteo") || q.includes("pluie")) {
    return "Consultez l'écran météo pour les données disponibles. Cette conversation ne fournit pas de prévision locale en temps réel.";
  }
  if (q.includes("qui es-tu") || q.includes("intelligence")) {
    return "Je suis l'assistant local de démonstration d'AgroSentinel. Je fournis des conseils généraux, sans diagnostic clinique ni données de marché en temps réel.";
  }
  return "Conseil général de démonstration : observez vos cultures, notez les symptômes et sollicitez un technicien agricole avant tout traitement.";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboard: {
    flex: 1
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.orange
  },
  messages: {
    flexGrow: 1,
    padding: 16
  },
  suggestionsContainer: {
    alignItems: "center",
    marginVertical: 20
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.2
  },
  suggestionChip: {
    backgroundColor: colors.orangeLight,
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginVertical: 6,
    width: "100%",
    alignItems: "center"
  },
  suggestionText: {
    color: colors.orangeDark,
    fontSize: 14,
    fontWeight: "700"
  },
  bubble: {
    maxWidth: "85%",
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.orangeLight,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.orangeBorder
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.greenLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.greenBorder
  },
  sender: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    opacity: 0.8
  },
  bubbleText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  inputArea: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    color: colors.text,
    backgroundColor: colors.white
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  micActive: {
    backgroundColor: colors.red
  }
});
