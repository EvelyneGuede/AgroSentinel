import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
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

type GridServiceCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress: () => void;
};

function FadeInView({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true })
    ]);

    animation.start();
  }, [delay, opacity, translateY]);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export function GridServiceCard({ title, subtitle, icon, color, onPress }: GridServiceCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.gridCard, pressed && styles.gridCardPressed]}>
      <View style={[styles.gridIconWrap, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text numberOfLines={1} style={styles.gridTitle}>{title}</Text>
      <Text numberOfLines={2} style={styles.gridSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function AgronomyWelcomeHeader() {
  return (
    <View style={styles.welcomeCard}>
      <LinearGradient colors={["rgba(22, 168, 107, 0.16)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGlow} />
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>Plateforme de décision</Text>
          <Text style={styles.heroTitle}>Mettez l’IA au service de chaque parcelle</Text>
          <Text style={styles.heroSubtitle}>Analysez, anticipez et protégez vos cultures en un seul espace.</Text>
        </View>
        <View style={styles.heroPill}>
          <Text style={styles.heroPillText}>+3x efficacité</Text>
        </View>
      </View>

      <View style={styles.welcomeDivider} />

      <View style={styles.welcomeStats}>
        <View style={styles.welcomeStatItem}>
          <Text style={styles.welcomeStatVal}>12</Text>
          <Text style={styles.welcomeStatLbl}>Diagnostics</Text>
        </View>
        <View style={styles.welcomeStatDivider} />
        <View style={styles.welcomeStatItem}>
          <Text style={[styles.welcomeStatVal, { color: colors.red }]}>2</Text>
          <Text style={styles.welcomeStatLbl}>Alertes</Text>
        </View>
        <View style={styles.welcomeStatDivider} />
        <View style={styles.welcomeStatItem}>
          <Text style={[styles.welcomeStatVal, { color: colors.orange }]}>28°C</Text>
          <Text style={styles.welcomeStatLbl}>Météo</Text>
        </View>
      </View>
    </View>
  );
}

function AgronomyTab({ navigate }: { navigate: Navigate }) {
  return (
    <FadeInView delay={80}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AgronomyWelcomeHeader />

        <Text style={styles.sectionTitle}>🏥 Diagnostics IA</Text>
        <Text style={styles.sectionSubtitle}>Outils d’analyses au champ</Text>
        <View style={styles.spacer} />

        <View style={styles.grid}>
          <GridServiceCard
            title="Diagnostic"
            subtitle="Analyse IA locale ultra-rapide"
            icon="camera-alt"
            color={colors.green}
            onPress={() => navigate("diagnostic")}
          />
          <GridServiceCard
            title="Conseiller Vocal"
            subtitle="Assistance par commande vocale"
            icon="record-voice-over"
            color={colors.orange}
            onPress={() => navigate("vocal")}
          />
        </View>

        <View style={styles.blockTitleWrap}>
          <Text style={styles.blockTitle}>☁️ Alertes & Prédictions</Text>
        </View>

        <ServiceCard
          title="🗺️ Sentinelle Épidémique"
          subtitle="Cartographie des risques régionaux"
          icon="map"
          color={colors.red}
          onPress={() => navigate("sentinel")}
        />
        <ServiceCard
          title="⛅ Météo Agro-Prédictive"
          subtitle="API météo & indices d’humidité"
          icon="wb-sunny"
          color={colors.orange}
          onPress={() => navigate("weather")}
        />
      </ScrollView>
    </FadeInView>
  );
}

function LogisticsWelcomeHeader() {
  return (
    <View style={styles.welcomeCard}>
      <LinearGradient colors={["rgba(249, 115, 22, 0.16)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGlow} />
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>Commerce & logistique</Text>
          <Text style={styles.heroTitle}>Valorisez votre production dès la récolte</Text>
          <Text style={styles.heroSubtitle}>Suivez les prix, optimisez vos coûts et sécurisez vos ventes.</Text>
        </View>
        <View style={[styles.heroPill, { borderColor: colors.orangeBorder }]}> 
          <Text style={[styles.heroPillText, { color: colors.orangeDark }]}>Prix du jour</Text>
        </View>
      </View>

      <View style={styles.welcomeDivider} />

      <View style={styles.welcomeStats}>
        <View style={styles.welcomeStatItem}>
          <Text style={[styles.welcomeStatVal, { color: colors.orange }]}>1 500 F</Text>
          <Text style={styles.welcomeStatLbl}>Cacao / kg</Text>
        </View>
        <View style={styles.welcomeStatDivider} />
        <View style={styles.welcomeStatItem}>
          <Text style={[styles.welcomeStatVal, { color: colors.greenMedium }]}>450 F</Text>
          <Text style={styles.welcomeStatLbl}>Tomate / kg</Text>
        </View>
        <View style={styles.welcomeStatDivider} />
        <View style={styles.welcomeStatItem}>
          <Text style={[styles.welcomeStatVal, { color: colors.green }]}>90%</Text>
          <Text style={styles.welcomeStatLbl}>Indice ROI</Text>
        </View>
      </View>
    </View>
  );
}

function LogisticsTab({ navigate }: { navigate: Navigate }) {
  return (
    <FadeInView delay={80}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LogisticsWelcomeHeader />

        <Text style={styles.sectionTitle}>💰 Outils Financiers</Text>
        <Text style={styles.sectionSubtitle}>Optimisation et rentabilité</Text>
        <View style={styles.spacer} />

        <View style={styles.grid}>
          <GridServiceCard
            title="Calculateur ROI"
            subtitle="Calcul des pertes en FCFA"
            icon="calculate"
            color={colors.orange}
            onPress={() => navigate("roi")}
          />
          <GridServiceCard
            title="Groupage"
            subtitle="Planification logistique"
            icon="local-shipping"
            color={colors.green}
            onPress={() => navigate("logistics")}
          />
        </View>

        <View style={styles.blockTitleWrap}>
          <Text style={styles.blockTitle}>🛍️ Vente & Commerce B2B</Text>
        </View>

        <ServiceCard
          title="🛍️ Marché B2B Flash"
          subtitle="Vente de stocks certifiés par Mobile Money"
          icon="shopping-bag"
          color={colors.greenMedium}
          onPress={() => navigate("marketplace")}
        />
      </ScrollView>
    </FadeInView>
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
    paddingBottom: 32
  },
  welcomeCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    overflow: "hidden"
  },
  heroGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: 24
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
    zIndex: 1
  },
  heroCopy: {
    flex: 1,
    paddingRight: 8
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: colors.greenDark,
    textTransform: "uppercase"
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginTop: 4,
    lineHeight: 23
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 17
  },
  heroPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.greenMedium
  },
  welcomeDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14
  },
  welcomeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  welcomeStatItem: {
    flex: 1,
    alignItems: "center"
  },
  welcomeStatVal: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  welcomeStatLbl: {
    fontSize: 10,
    color: colors.subtle,
    marginTop: 2,
    fontWeight: "600"
  },
  welcomeStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
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
    height: 12
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12
  },
  gridCard: {
    flex: 1,
    minHeight: 146,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  gridCardPressed: {
    opacity: 0.94,
    borderColor: colors.border,
    transform: [{ scale: 0.98 }]
  },
  gridIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  gridTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  gridSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15
  },
  blockTitleWrap: {
    marginTop: 10,
    marginBottom: 10
  },
  blockTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2
  }
});
