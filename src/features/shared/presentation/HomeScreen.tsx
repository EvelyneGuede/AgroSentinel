import React, { ReactNode, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { BottomTabs, TabKey } from "../../../components/BottomTabs";
import { ServiceCard } from "../../../components/ServiceCard";
import { colors } from "../../../theme/colors";
import { Navigate } from "../../../types/navigation";

type HomeScreenProps = {
  navigate: Navigate;
  dashboard: ReactNode;
};

const titles: Record<TabKey, string> = {
  agronomy: "🌾 AGRONOMIE CONNECTEE",
  logistics: "📦 LOGISTIQUE & MARCHE",
  state: "📊 ETAT : SOUVERAINETE"
};

const tabColors: Record<TabKey, string> = {
  agronomy: colors.green,
  logistics: colors.amber,
  state: colors.blue
};

export function HomeScreen({ navigate, dashboard }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("agronomy");

  const body = useMemo(() => {
    if (activeTab === "state") return dashboard;
    if (activeTab === "logistics") return <LogisticsTab navigate={navigate} />;
    return <AgronomyTab navigate={navigate} />;
  }, [activeTab, dashboard, navigate]);

  return (
    <View style={styles.container}>
      <AppHeader title={titles[activeTab]} color={tabColors[activeTab]} />
      <View style={styles.body}>{body}</View>
      <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
    </View>
  );
}

function AgronomyTab({ navigate }: { navigate: Navigate }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>🏥 Santé & Diagnostic IA</Text>
      <Text style={styles.sectionSubtitle}>✅ Solutions 100% Offline au champ</Text>
      <View style={styles.spacer} />
      <ServiceCard
        title="📱 Diagnostic Phytosanitaire"
        subtitle="Analyse IA (TFLite) en moins de 2s"
        icon="camera-alt"
        color={colors.green}
        onPress={() => navigate("diagnostic")}
      />
      <ServiceCard
        title="🎤 Conseiller Vocal IA"
        subtitle="Vulgarisation & posologie vocale"
        icon="record-voice-over"
        color={colors.blue}
        onPress={() => navigate("vocal")}
      />
      <View style={styles.blockTitleWrap}>
        <Text style={styles.blockTitle}>☁️ Alertes & Predictions Cloud</Text>
      </View>
      <ServiceCard
        title="🗺️ Sentinelle Epidemique"
        subtitle="Cartographie des risques (regle 10km)"
        icon="map"
        color={colors.red}
        onPress={() => navigate("sentinel")}
      />
      <ServiceCard
        title="⛅ Meteo Agro-Predictive"
        subtitle="API satellites & indices fongiques"
        icon="wb-sunny"
        color={colors.orange}
        onPress={() => navigate("weather")}
      />
    </ScrollView>
  );
}

function LogisticsTab({ navigate }: { navigate: Navigate }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>💰 Valorisation Économique</Text>
      <Text style={styles.sectionSubtitle}>⚙️ Moteur financier & logistique</Text>
      <View style={styles.spacer} />
      <ServiceCard
        title="📊 Calculateur de ROI"
        subtitle="Conversion pertes volume en FCFA"
        icon="calculate"
        color={colors.amber}
        onPress={() => navigate("roi")}
      />
      <ServiceCard
        title="🚚 Groupage Logistique"
        subtitle="Planification premier kilometre"
        icon="local-shipping"
        color={colors.purple}
        onPress={() => navigate("logistics")}
      />
      <ServiceCard
        title="🛍️ Marche B2B Flash"
        subtitle="Stocks certifies & escrow Mobile Money"
        icon="shopping-bag"
        color={colors.teal}
        onPress={() => navigate("marketplace")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  body: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  sectionSubtitle: {
    color: colors.gray,
    marginTop: 3,
    fontSize: 14
  },
  spacer: {
    height: 18
  },
  blockTitleWrap: {
    marginTop: 8,
    marginBottom: 10
  },
  blockTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  }
});
