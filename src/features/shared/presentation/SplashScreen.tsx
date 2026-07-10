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
    <LinearGradient colors={[colors.white, colors.orangeLight]} style={styles.container}>
      <View style={styles.logoShell}>
        <Image source={require("../../../../assets/logo.png")} resizeMode="contain" style={styles.logo} />
      </View>
      <Text style={styles.title}>
        AgriIntell<Text style={styles.titleAccent}> CI</Text>
      </Text>
      <Text style={styles.subtitle}>L'IA au service de la terre</Text>
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
  logoShell: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.orange,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.orangeBorder
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75
  },
  title: {
    marginTop: 32,
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  titleAccent: {
    color: colors.orange
  },
  subtitle: {
    marginTop: 6,
    color: colors.greenMedium,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2
  },
  loader: {
    marginTop: 48
  }
});
