import { MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
    await wait(2000);

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

    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      generateDynamicResponse("Que faire pour le cacao ?");
    }, 900);
  }

  return (
    <View style={styles.container}>
      <AppHeader title="🎤 Conseiller Vocal IA (Cloud)" color={colors.blue} onBack={onBack} />
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
          {isSearching ? <Bubble sender="JEYSI.AI" message="Recherche sur le net..." /> : null}
          {response ? <Bubble sender="JEYSI.AI" message={response} /> : null}
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
    return "Pour le Cacao : la campagne actuelle en Cote d'Ivoire montre une hausse des prix. Attention a la Pourriture Brune, traitez avec des fongicides cuivriques si l'humidite depasse 80%.";
  }
  if (q.includes("mangue")) {
    return "Pour la Mangue : la mouche des fruits est active. Utilisez des pieges a pheromones. La recolte a Korhogo commence bientot, prevoyez le stockage a l'ombre.";
  }
  if (q.includes("tomate")) {
    return "Pour la Tomate : le Mildiou est votre plus grand ennemi. Evitez l'arrosage par aspersion le soir. Le prix sur le marche de gros est de 450 FCFA le kg aujourd'hui.";
  }
  if (q.includes("meteo") || q.includes("pluie")) {
    return "Analyse satellite en cours... Le ciel sur votre zone est variable. Risque d'averses isolees d'ici ce soir. Protegez vos sechoirs.";
  }
  if (q.includes("qui es-tu") || q.includes("intelligence")) {
    return "Je suis JEYSI.AI, votre conseiller agricole intelligent. Je peux analyser vos cultures et me connecter aux donnees meteo mondiales pour vous aider.";
  }
  return "Question interessante. D'apres mes recherches sur le reseau AgriIntell, je vous suggere de verifier l'humidite de votre sol et de consulter nos alertes de la Sentinelle Epidemique.";
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
    height: 4,
    backgroundColor: colors.orange
  },
  messages: {
    flexGrow: 1,
    padding: 20
  },
  suggestionsContainer: {
    alignItems: "center",
    marginVertical: 30
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15
  },
  suggestionChip: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 8,
    width: "100%",
    alignItems: "center"
  },
  suggestionText: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: "600"
  },
  bubble: {
    maxWidth: "86%",
    marginVertical: 8,
    padding: 15,
    borderRadius: 8
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#D6E8FF"
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#DFF4E5"
  },
  sender: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 5
  },
  bubbleText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23
  },
  inputArea: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: "#FFFFFF"
  },
  micButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blue
  },
  micActive: {
    backgroundColor: colors.red
  }
});
