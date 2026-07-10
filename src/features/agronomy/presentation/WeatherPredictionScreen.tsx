import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { AppHeader } from "../../../components/AppHeader";
import { AgroWeather, getAgroWeather } from "../../../core/services/weatherService";
import { colors } from "../../../theme/colors";

type WeatherPredictionScreenProps = {
  onBack: () => void;
};

const demoCities: Record<string, [number, number]> = {
  Yamoussoukro: [6.8276, -5.2767],
  Abidjan: [5.36, -4.0083],
  "Korhogo (Mangue)": [9.458, -5.6295],
  "Daloa (Cacao)": [6.8774, -6.4452],
  Bouake: [7.6833, -5.0333]
};

export function WeatherPredictionScreen({ onBack }: WeatherPredictionScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<AgroWeather | null>(null);
  const [statusMessage, setStatusMessage] = useState("Initialisation...");
  const [selectedCity, setSelectedCity] = useState("Yamoussoukro");

  useEffect(() => {
    loadWeather();
  }, []);

  async function loadWeather(city = selectedCity, useGps = false) {
    setIsLoading(true);
    setStatusMessage("Analyse satellite en cours...");

    let lat = demoCities[city][0];
    let lon = demoCities[city][1];

    if (useGps) {
      try {
        const position = await determinePosition();
        lat = position.latitude;
        lon = position.longitude;
        setStatusMessage("Position GPS Reelle");
      } catch {
        setStatusMessage(`GPS bloque : Mode Simulation (${city})`);
      }
    } else {
      setStatusMessage(`Mode Simulation (${city})`);
    }

    const data = await getAgroWeather(lat, lon);
    setWeatherData(data);
    setIsLoading(false);
  }

  function selectCity(city: string) {
    setSelectedCity(city);
    loadWeather(city, false);
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="⛅ Meteo Agro-Predictive"
        color={colors.orange}
        onBack={onBack}
        rightActions={
          <Pressable accessibilityLabel="Position GPS" onPress={() => loadWeather(selectedCity, true)} style={styles.gpsButton}>
            <MaterialIcons name="my-location" size={24} color="#FFFFFF" />
          </Pressable>
        }
      />
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.orange} size="large" />
          <Text style={styles.loadingText}>{statusMessage}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => loadWeather(selectedCity, false)} />}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityRow}>
            {Object.keys(demoCities).map((city) => (
              <Pressable
                key={city}
                onPress={() => selectCity(city)}
                style={[styles.cityChip, city === selectedCity && styles.cityChipSelected]}
              >
                <Text style={[styles.cityChipText, city === selectedCity && styles.cityChipTextSelected]}>{city}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {weatherData ? (
            <>
              <WeatherCard city={selectedCity} data={weatherData} status={statusMessage} />
              <Text style={styles.riskTitle}>Risques Maladies (Calcul IA)</Text>
              <RiskTile label="Mildiou (Tomate)" value={weatherData.mildiouRisk} color={colors.red} />
              <RiskTile label="Pourriture Brune (Cacao)" value={weatherData.brownRotRisk} color={colors.orange} />
              <RiskTile
                label="Anthracnose (Mangue)"
                value={weatherData.humidity > 70 ? 0.8 : 0.3}
                color={colors.blue}
              />
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function WeatherCard({ city, data, status }: { city: string; data: AgroWeather; status: string }) {
  return (
    <LinearGradient colors={["#F59E0B", "#C2410C"]} style={styles.weatherCard}>
      <Text style={styles.weatherCity}>{city.toUpperCase()}</Text>
      <Text style={styles.weatherTemp}>{data.temp.toFixed(1)}°C</Text>
      <Text style={styles.weatherCondition}>{data.condition}</Text>
      <Text style={styles.weatherStatus}>{status}</Text>
      <View style={styles.weatherInfoRow}>
        <InfoItem icon="water-drop" value={`${Math.round(data.humidity)}%`} label="Humidite" />
        <InfoItem icon="air" value="14 km/h" label="Vent" />
      </View>
    </LinearGradient>
  );
}

function InfoItem({
  icon,
  value,
  label
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.infoItem}>
      <MaterialIcons name={icon} color="rgba(255,255,255,0.78)" size={23} />
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function RiskTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.riskTile}>
      <View style={styles.riskHeader}>
        <Text style={styles.riskLabel}>{label}</Text>
        <Text style={[styles.riskScore, { color }]}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.riskTrack}>
        <View style={[styles.riskFill, { backgroundColor: color, width: `${Math.min(value * 100, 100)}%` }]} />
      </View>
    </View>
  );
}

async function determinePosition() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") throw new Error("GPS bloque");
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  gpsButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    color: colors.gray,
    fontStyle: "italic"
  },
  content: {
    padding: 20,
    paddingBottom: 32
  },
  cityRow: {
    gap: 8,
    paddingBottom: 16
  },
  cityChip: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  cityChipSelected: {
    borderColor: colors.orange,
    backgroundColor: "#FFF4E5"
  },
  cityChipText: {
    color: colors.gray,
    fontSize: 12,
    fontWeight: "800"
  },
  cityChipTextSelected: {
    color: colors.orange
  },
  weatherCard: {
    width: "100%",
    padding: 25,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: colors.orange,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  weatherCity: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "900"
  },
  weatherTemp: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "900",
    marginTop: 8
  },
  weatherCondition: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700"
  },
  weatherStatus: {
    marginTop: 8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 12
  },
  weatherInfoRow: {
    width: "100%",
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  infoItem: {
    alignItems: "center"
  },
  infoValue: {
    marginTop: 4,
    color: "#FFFFFF",
    fontWeight: "900"
  },
  infoLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11
  },
  riskTitle: {
    marginTop: 25,
    marginBottom: 14,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  riskTile: {
    marginBottom: 14,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10
  },
  riskLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  riskScore: {
    fontWeight: "900"
  },
  riskTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#EEF2F6"
  },
  riskFill: {
    height: "100%",
    borderRadius: 4
  }
});
