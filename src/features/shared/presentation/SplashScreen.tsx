import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Image, StyleSheet, View } from "react-native";
import { colors } from "../../../theme/colors";

type SplashScreenProps = {
  onDone: () => void;
};

export function SplashScreen({ onDone }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    // Séquence d'animations fluides
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        })
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ]).start();

    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone, logoOpacity, logoScale, textOpacity, textTranslateY]);

  return (
    <LinearGradient colors={[colors.white, colors.orangeLight, colors.greenLight]} style={styles.container}>
      <View style={styles.glow} />
      
      <Animated.View 
        style={[
          styles.logoShell, 
          { 
            opacity: logoOpacity,
            transform: [{ scale: logoScale }] 
          }
        ]}
      >
        <Image source={require("../../../../assets/logo.png")} resizeMode="contain" style={styles.logo} />
      </Animated.View>

      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }],
          alignItems: "center"
        }}
      >
        <Animated.Text style={styles.title}>
          Agro<Animated.Text style={styles.titleAccent}>Sentinel</Animated.Text>
        </Animated.Text>
        <Animated.Text style={styles.subtitle}>L'IA au service de la terre</Animated.Text>
      </Animated.View>

      <ActivityIndicator color={colors.green} size="large" style={styles.loader} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: `${colors.green}12`,
    top: 120,
    right: -40
  },
  logoShell: {
    width: 182,
    height: 182,
    borderRadius: 91,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.orange,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.orangeBorder
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70
  },
  title: {
    marginTop: 32,
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  titleAccent: {
    color: colors.orange
  },
  subtitle: {
    marginTop: 8,
    color: colors.greenMedium,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  loader: {
    marginTop: 48
  }
});
