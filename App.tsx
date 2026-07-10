import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { initializeDatabase } from "./src/core/services/databaseService";
import { DiagnosticScreen } from "./src/features/agronomy/presentation/DiagnosticScreen";
import { SentinelMapScreen } from "./src/features/agronomy/presentation/SentinelMapScreen";
import { VocalAdvisorScreen } from "./src/features/agronomy/presentation/VocalAdvisorScreen";
import { WeatherPredictionScreen } from "./src/features/agronomy/presentation/WeatherPredictionScreen";
import { NationalDashboardScreen } from "./src/features/dashboard/presentation/NationalDashboardScreen";
import { LogisticsGroupingScreen } from "./src/features/logistics/presentation/LogisticsGroupingScreen";
import { MarketplaceScreen } from "./src/features/logistics/presentation/MarketplaceScreen";
import { ROICalculatorScreen } from "./src/features/logistics/presentation/ROICalculatorScreen";
import { HomeScreen } from "./src/features/shared/presentation/HomeScreen";
import { SplashScreen } from "./src/features/shared/presentation/SplashScreen";
import { colors } from "./src/theme/colors";
import { AppScreen } from "./src/types/navigation";

export default function App() {
  const [stack, setStack] = useState<AppScreen[]>(["splash"]);
  const currentScreen = stack[stack.length - 1];

  useEffect(() => {
    initializeDatabase().catch(() => undefined);
  }, []);

  const navigate = useCallback((screen: AppScreen) => {
    setStack((previous) => (screen === "home" ? ["home"] : [...previous, screen]));
  }, []);

  const goBack = useCallback(() => {
    setStack((previous) => (previous.length <= 1 ? ["home"] : previous.slice(0, -1)));
  }, []);

  const content = useMemo(() => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen onDone={() => navigate("home")} />;
      case "diagnostic":
        return <DiagnosticScreen onBack={goBack} />;
      case "vocal":
        return <VocalAdvisorScreen onBack={goBack} />;
      case "sentinel":
        return <SentinelMapScreen onBack={goBack} />;
      case "weather":
        return <WeatherPredictionScreen onBack={goBack} />;
      case "roi":
        return <ROICalculatorScreen onBack={goBack} />;
      case "logistics":
        return <LogisticsGroupingScreen onBack={goBack} />;
      case "marketplace":
        return <MarketplaceScreen onBack={goBack} />;
      case "home":
      default:
        return <HomeScreen navigate={navigate} dashboard={<NationalDashboardScreen />} />;
    }
  }, [currentScreen, goBack, navigate]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.green} />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.green
  }
});
