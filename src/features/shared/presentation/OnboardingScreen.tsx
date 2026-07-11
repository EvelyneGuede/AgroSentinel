import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";

type Slide = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  badge: string;
};

const slides: Slide[] = [
  {
    title: "Diagnostic IA Local",
    description: "Prenez une photo de vos feuilles de Cacao, Mangue ou Tomate et notre IA locale analyse instantanément, hors-ligne et en toute confidentialité.",
    icon: "psychology",
    color: colors.green,
    badge: "AGRONOMIE"
  },
  {
    title: "Conseiller Vocal IA",
    description: "Obtenez des conseils précis par la voix pour agir vite, même sans réseau.",
    icon: "record-voice-over",
    color: colors.orange,
    badge: "ASSISTANCE"
  },
  {
    title: "Sécurité & Souveraineté",
    description: "Synchronisez vos données avec une expérience sécurisée et fiable pour protéger vos récoltes et votre patrimoine.",
    icon: "security",
    color: colors.greenMedium,
    badge: "ROBUSTE & SÉCURISÉ"
  }
];

type OnboardingScreenProps = {
  onComplete: () => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slide = slides[activeSlide];

  function handleNext() {
    if (activeSlide < slides.length - 1) {
      setActiveSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logoText}>
          Agro<Text style={{ color: colors.orange }}>Sentinel</Text>
        </Text>
        {activeSlide < slides.length - 1 && (
          <Pressable onPress={onComplete} style={styles.skipButton}>
            <Text style={styles.skipText}>Passer</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.slideContainer}>
        <View style={[styles.iconWrap, { backgroundColor: `${slide.color}15` }]}> 
          <MaterialIcons name={slide.icon} size={72} color={slide.color} />
        </View>
        
        <View style={[styles.badge, { backgroundColor: `${slide.color}10`, borderColor: `${slide.color}30` }]}> 
          <Text style={[styles.badgeText, { color: slide.color }]}>{slide.badge}</Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeSlide ? [styles.dotActive, { backgroundColor: slide.color }] : null
              ]}
            />
          ))}
        </View>

        <Pressable onPress={handleNext} style={[styles.nextButton, { backgroundColor: slide.color }]}> 
          <Text style={styles.nextButtonText}>
            {activeSlide === slides.length - 1 ? "COMMENCER" : "SUIVANT"}
          </Text>
          <MaterialIcons 
            name={activeSlide === slides.length - 1 ? "check" : "chevron-right"} 
            size={20} 
            color="#FFFFFF" 
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "space-between",
    paddingVertical: 20
  },
  topBar: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5
  },
  skipButton: {
    padding: 8
  },
  skipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  slideContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginVertical: 20
  },
  iconWrap: {
    width: 142,
    height: 142,
    borderRadius: 71,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 14
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  pagination: {
    flexDirection: "row"
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    marginRight: 8
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4
  },
  nextButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginRight: 6
  }
});
