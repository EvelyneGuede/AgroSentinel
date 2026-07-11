# 🌿 AgroSentinel

> **Plateforme mobile de diagnostic agricole par intelligence artificielle**  
> Application offline-first pour les producteurs de Cacao, Mangue et Tomate en Côte d'Ivoire.

---

## 📱 Aperçu

AgroSentinel est un prototype mobile Expo (React Native) qui permet aux agriculteurs de :
- **Diagnostiquer les maladies de leurs cultures** par photo via des modèles TFLite embarqués
- **Consulter la météo agricole** avec indices de risque de maladies
- **Cartographier localement** leurs diagnostics sur une carte
- **Simuler des scénarios économiques** (pertes, ROI, groupage logistique)
- **Accéder à des conseils agricoles** via un assistant vocal local

---

## 🏗️ Architecture

```
AgroSentinel/
├── assets/
│   ├── IA Cacao/          # Modèle TFLite cacao (2.4 MB) + labels
│   ├── IA Mangue/         # Modèle TFLite mangue (244 MB) + labels
│   └── IA Tomates/        # Modèle TFLite tomate (21 MB) + labels
├── src/
│   ├── components/        # AppHeader, BottomTabs, ServiceCard
│   ├── core/
│   │   ├── models/        # DiagnosticModel
│   │   └── services/      # tfliteService, databaseService, syncService, weatherService
│   ├── features/
│   │   ├── agronomy/      # DiagnosticScreen, SentinelMapScreen, VocalAdvisorScreen, WeatherPredictionScreen
│   │   ├── dashboard/     # NationalDashboardScreen
│   │   ├── logistics/     # MarketplaceScreen, ROICalculatorScreen, LogisticsGroupingScreen
│   │   └── shared/        # SplashScreen, OnboardingScreen, HomeScreen
│   └── theme/             # colors.ts
└── App.tsx
```

---

## 🧠 Inférence IA — Modèles TFLite

L'application embarque **3 modèles TensorFlow Lite** natifs pour la détection de maladies :

| Culture | Modèle | Classes détectées |
|---|---|---|
| 🍫 **Cacao** | `agro_sentinel_cacao.tflite` | BLACKPOD, FROSTY ROT, HEALTHY, MIRID |
| 🥭 **Mangue** | `model.tflite` | Anthracnose, Bacterial Canker, Cutting Weevil, Die Back, Gall Midge, Healthy, Powdery Mildew, Sooty Mould |
| 🍅 **Tomate** | `agro_sentinel_tomato.tflite` | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy |

### Pipeline d'inférence

1. **Redimensionnement** de l'image aux dimensions du modèle via `expo-image-manipulator` (dimensions lues dynamiquement depuis `model.inputs[0].shape`)
2. **Lecture binaire** du fichier JPEG via `expo-file-system` (base64)
3. **Décodage** des pixels RGBA via `jpeg-js`
4. **Normalisation** : `[0, 1]` pour `float32`, `[0, 255]` pour `uint8` (type lu dynamiquement)
5. **Inférence** via `react-native-fast-tflite`
6. **Résultat** : label + score de confiance + recommandations phytosanitaires structurées

> ⚠️ **Requires a development build** — l'inférence native ne fonctionne pas dans Expo Go.

---

## 🔒 Sécurité & Confidentialité

| Point | Statut |
|---|---|
| Données GPS | ✅ Arrondies à 3 décimales, consentement requis, `null` si refus |
| Stockage local | ✅ SQLite, purge automatique après 30 jours |
| Synchronisation distante | ✅ **Désactivée** — aucun envoi sans API authentifiée |
| Fausse position | ✅ Supprimée — GPS bloqué = coordonnées `null` |
| Permissions Android | ✅ Caméra + GPS uniquement (micro/stockage supprimés) |
| Token Mapbox | ✅ Supprimé — cartes sans fond distant |

---

## ✅ Ce qui est opérationnel

- [x] Capture photo (caméra et galerie) et pipeline d'inférence TFLite natif réel
- [x] Historique des diagnostics locaux (SQLite, 30 jours)
- [x] Météo agricole via **Open-Meteo** avec indices de risque (Mildiou, Pourriture Brune, Anthracnose)
- [x] Cartographie locale des diagnostics (`react-native-maps`)
- [x] Assistant vocal avec réponses locales prédéfinies (`expo-speech`)
- [x] Calculateur de scénario pertes/ROI en FCFA
- [x] Simulation de groupage logistique
- [x] Onboarding et splash screen animé

## 🚧 Étapes de mise en production

- [ ] Tests du pipeline d'inférence TFLite sur dataset métier validé
- [ ] API authentifiée (identité, JWT, validation serveur, journal d'audit, anti-rejeu)
- [ ] Chiffrement local des données sensibles (SQLite chiffré)
- [ ] Consentement RGPD, suppression et export des données
- [ ] Intégration paiement Mobile Money via prestataire certifié côté serveur
- [ ] Mise à jour Expo SDK 57 après la démo (11 vulnérabilités modérées transitives)

> ⚠️ Le marché B2B, le groupage, les indicateurs nationaux et l'assistant vocal sont des **simulations de démonstration**. Aucun paiement, aucune synchronisation nationale, aucun diagnostic clinique ne sont réels dans le prototype actuel.

---

## 🚀 Lancement

### Prérequis

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- Pour l'inférence TFLite native : **development build** (pas Expo Go)

### Installation

```bash
git clone <repo>
cd AgroSentinel
npm install
```

### Démarrage (Expo Go — sans inférence IA)

```bash
npx expo start
```

### Build de développement (avec inférence IA native)

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### Génération d’un APK Android avec EAS

1. Installer EAS CLI si nécessaire :

```bash
npm install -g eas-cli
```

2. Se connecter à Expo :

```bash
eas login
```

3. Construire l’APK de production :

```bash
npm run eas:build:android:prod
```

4. Construire un APK de développement interne :

```bash
npm run eas:build:android:dev
```

5. Construire un APK de prévisualisation :

```bash
npm run eas:build:android:preview
```

> Note : EAS se charge de la génération du keystore. Pour une signature personnalisée, utilisez `eas credentials`.

### Vérification TypeScript

```bash
npm run typecheck
```

---

## 📦 Stack Technique

| Technologie | Rôle |
|---|---|
| **Expo SDK 54** | Framework React Native |
| **react-native-fast-tflite** | Inférence TFLite native (JSI/Nitro) |
| **react-native-nitro-modules** | Pont natif haute performance |
| **expo-image-manipulator** | Redimensionnement d'images avant inférence |
| **expo-file-system** | Lecture binaire des fichiers image |
| **jpeg-js** | Décodage JPEG en pixels RGBA |
| **expo-sqlite** | Base de données locale des diagnostics |
| **expo-location** | Géolocalisation optionnelle |
| **expo-camera** | Capture photo |
| **expo-speech** | Synthèse vocale (assistant) |
| **react-native-maps** | Cartographie des diagnostics |
| **expo-linear-gradient** | Dégradés UI |
| **Open-Meteo** | API météo gratuite (sans clé) |

---

## 📋 Identifiants de l'Application

- **Android Package** : `ci.agrosentinel.inza`
- **iOS Bundle ID** : `ci.agrosentinel.inza`
- **Expo Slug** : `agrosentinel`

---

*AgroSentinel — MVP offline-first. L'IA embarquée au service de chaque parcelle.*
