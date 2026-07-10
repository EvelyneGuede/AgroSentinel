import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";

type SplashScreenProps = {
  onDone: () => void;
};

export function SplashScreen({ onDone }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <LinearGradient colors={[colors.greenLight, colors.greenMedium, colors.greenDark]} style={styles.container}>
      <View style={styles.logoShell}>
        <Image source={require("../../../../assets/logo.jpeg")} resizeMode="contain" style={styles.logo} />
      </View>
      <Text style={styles.title}>AgriIntell CI</Text>
      <Text style={styles.subtitle}>L'IA au service de la terre</Text>
      <ActivityIndicator color="#FFFFFF" size="large" style={styles.loader} />
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
  logoShell: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9
  },
  logo: {
    width: 170,
    height: 170,
    borderRadius: 85
  },
  title: {
    marginTop: 38,
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    fontSize: 16,
    fontStyle: "italic"
  },
  loader: {
    marginTop: 58
  }
});
