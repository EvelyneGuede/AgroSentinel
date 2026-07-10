const baseUrl = "https://api.open-meteo.com/v1/forecast";

export type AgroWeather = {
  temp: number;
  humidity: number;
  condition: string;
  mildiouRisk: number;
  brownRotRisk: number;
  city: string;
};

function getWeatherCondition(code: number) {
  if (code === 0) return "Ciel degage";
  if (code <= 3) return "Partiellement nuageux";
  if (code <= 67) return "Pluie";
  return "Variable";
}

export async function getAgroWeather(lat: number, lon: number): Promise<AgroWeather> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const url = `${baseUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,relative_humidity_2m&forecast_days=3`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error("Erreur API");

    const data = await response.json();
    const humidity = Number(data.current.relative_humidity_2m);
    const temp = Number(data.current.temperature_2m);

    return {
      temp,
      humidity,
      condition: getWeatherCondition(Number(data.current.weather_code)),
      mildiouRisk: humidity > 75 && temp > 15 && temp < 25 ? 0.8 : 0.2,
      brownRotRisk: humidity > 80 ? 0.9 : 0.3,
      city: `Position : ${lat.toFixed(2)}, ${lon.toFixed(2)}`
    };
  } catch {
    return {
      temp: 27.5,
      humidity: 80,
      condition: "Donnees locales",
      mildiouRisk: 0.5,
      brownRotRisk: 0.4,
      city: "Mode Secours (Hors-ligne)"
    };
  }
}
