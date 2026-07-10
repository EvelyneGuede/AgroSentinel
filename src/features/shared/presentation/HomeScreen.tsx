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
  agronomy: "🌾 AGRONOMIE CONNECTÉE",
  logistics: "📦 LOGISTIQUE & MARCHÉ",
  state: "📊 ÉTAT : SOUVERAINETÉ"
};

const tabColors: Record<TabKey, string> = {
  agronomy: colors.green,
  logistics: colors.orange,
  state: colors.greenMedium
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
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>🏥 Santé & Diagnostic IA</Text>
      <Text style={styles.sectionSubtitle}>Solutions 100% Offline au champ</Text>
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
        color={colors.orange}
        onPress={() => navigate("vocal")}
      />
      
      <View style={styles.blockTitleWrap}>
        <Text style={styles.blockTitle}>☁️ Alertes & Prédictions Cloud</Text>
      </View>
      
      <ServiceCard
        title="🗺️ Sentinelle Épidémique"
        subtitle="Cartographie des risques (règle 10km)"
        icon="map"
        color={colors.red}
        onPress={() => navigate("sentinel")}
      />
      <ServiceCard
        title="⛅ Météo Agro-Prédictive"
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
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>💰 Valorisation Économique</Text>
      <Text style={styles.sectionSubtitle}>Moteur financier & logistique</Text>
      <View style={styles.spacer} />
      
      <ServiceCard
        title="📊 Calculateur de ROI"
        subtitle="Conversion pertes volume en FCFA"
        icon="calculate"
        color={colors.orange}
        onPress={() => navigate("roi")}
      />
      <ServiceCard
        title="🚚 Groupage Logistique"
        subtitle="Planification premier kilomètre"
        icon="local-shipping"
        color={colors.green}
        onPress={() => navigate("logistics")}
      />
      <ServiceCard
        title="🛍️ Marché B2B Flash"
        subtitle="Stocks certifiés & escrow Mobile Money"
        icon="shopping-bag"
        color={colors.greenMedium}
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
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  sectionSubtitle: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 13,
    fontWeight: "500"
  },
  spacer: {
    height: 14
  },
  blockTitleWrap: {
    marginTop: 18,
    marginBottom: 10
  },
  blockTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2
  }
});
