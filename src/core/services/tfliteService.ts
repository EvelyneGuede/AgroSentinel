import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import jpeg from "jpeg-js";

export type CultureType = "cacao" | "mangue" | "tomate";

export type ClassificationResult = {
  label: string;
  confidence: number;
  recommendation: string;
  risk_level: string;
};

const modelAssets = {
  cacao: require("../../../assets/IA Cacao/agro_sentinel_cacao.tflite"),
  mangue: require("../../../assets/IA Mangue/model.tflite"),
  tomate: require("../../../assets/IA Tomates/agro_sentinel_tomato.tflite")
};

const labelsByCulture: Record<CultureType, string[]> = {
  cacao: ["BLACKPOD", "FROSTY ROT", "HEALTHY", "MIRID"],
  mangue: [
    "Anthracnose",
    "Bacterial Canker",
    "Cutting Weevil",
    "Die Back",
    "Gall Midge",
    "Healthy",
    "Powdery Mildew",
    "Sooty Mould"
  ],
  tomate: [
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
  ]
};

// Cache pour conserver les modèles chargés et éviter de les recharger à chaque inférence
const modelCache: { [key in CultureType]?: TensorflowModel } = {};

export async function loadModel(type: CultureType): Promise<TensorflowModel> {
  if (modelCache[type]) {
    return modelCache[type]!;
  }
  const modelAsset = modelAssets[type];
  const loadedModel = await loadTensorflowModel(modelAsset, []);
  modelCache[type] = loadedModel;
  return loadedModel;
}

export async function classifyImage(
  imageUri: string | null,
  culture: CultureType
): Promise<ClassificationResult> {
  if (!imageUri) throw new Error("Aucune image à analyser.");

  // 1. Chargement du modèle
  const model = await loadModel(culture);

  // 2. Récupération dynamique des dimensions et types attendus par le modèle
  const inputTensor = model.inputs[0];
  if (!inputTensor) {
    throw new Error(`Le modèle ${culture} ne contient aucun tenseur d'entrée.`);
  }

  // La forme (shape) est généralement [batch, height, width, channels]
  const [, inputHeight, inputWidth, channels] = inputTensor.shape;
  const dataType = inputTensor.dataType;

  if (channels !== 3) {
    throw new Error(`Seuls les modèles RGB (3 canaux) sont supportés (reçu: ${channels} canaux).`);
  }

  // 3. Prétraitement de l'image (redimensionnement et conversion forcée en JPEG)
  const manipResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: inputWidth, height: inputHeight } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );

  // 4. Lecture du fichier JPEG redimensionné sous forme binaire
  const base64Data = await FileSystem.readAsStringAsync(manipResult.uri, {
    encoding: "base64"
  });
  
  const jpegBytes = decodeBase64(base64Data);

  // 5. Décodage de l'image JPEG en pixels RGBA
  const rawImageData = jpeg.decode(jpegBytes, { useTArray: true });
  const { width, height, data } = rawImageData;

  if (width !== inputWidth || height !== inputHeight) {
    throw new Error(`Erreur lors du redimensionnement de l'image : ${width}x${height} au lieu de ${inputWidth}x${inputHeight}`);
  }

  // 6. Extraction des canaux RGB et normalisation selon le type attendu
  const numPixels = width * height;
  let inputBuffer: Float32Array | Uint8Array;

  if (dataType === "uint8") {
    inputBuffer = new Uint8Array(numPixels * 3);
    for (let i = 0; i < numPixels; i++) {
      inputBuffer[i * 3] = data[i * 4];         // R
      inputBuffer[i * 3 + 1] = data[i * 4 + 1]; // G
      inputBuffer[i * 3 + 2] = data[i * 4 + 2]; // B
    }
  } else {
    // float32 - normalisation standard [0, 1]
    inputBuffer = new Float32Array(numPixels * 3);
    for (let i = 0; i < numPixels; i++) {
      inputBuffer[i * 3] = data[i * 4] / 255.0;         // R
      inputBuffer[i * 3 + 1] = data[i * 4 + 1] / 255.0; // G
      inputBuffer[i * 3 + 2] = data[i * 4 + 2] / 255.0; // B
    }
  }

  // 7. Exécution de l'inférence
  const outputs = await model.run([inputBuffer.buffer as ArrayBuffer]);
  const outputTensor = outputs[0];

  if (!outputTensor || outputTensor.byteLength === 0) {
    throw new Error("Le modèle n'a produit aucun tenseur de sortie.");
  }

  // Résolution du tableau typé approprié pour lire le tenseur de sortie
  const outputTensorMeta = model.outputs[0];
  const outputDataType = outputTensorMeta?.dataType || "float32";

  let outputArray: Float32Array | Uint8Array;
  if (outputDataType === "uint8") {
    outputArray = new Uint8Array(outputTensor);
  } else {
    outputArray = new Float32Array(outputTensor);
  }

  if (outputArray.length === 0) {
    throw new Error("Le tableau de sortie du modèle est vide.");
  }

  // 8. Recherche du score maximum
  let maxIdx = 0;
  let maxVal = outputArray[0];
  for (let i = 1; i < outputArray.length; i++) {
    if (outputArray[i] > maxVal) {
      maxVal = outputArray[i];
      maxIdx = i;
    }
  }

  const confidence = outputDataType === "uint8" ? maxVal / 255.0 : maxVal;

  // 9. Mappage avec les étiquettes et recommandations
  const labels = labelsByCulture[culture];
  if (!labels || maxIdx >= labels.length) {
    throw new Error(`Index de classification ${maxIdx} hors limites pour ${culture}.`);
  }

  const detectedLabel = labels[maxIdx];
  const cleanDetectedLabel = cleanLabel(detectedLabel);
  const recommendation = getRecommendation(detectedLabel);
  const riskLevel = confidence > 0.75 ? "Eleve" : confidence > 0.45 ? "Moyen" : "Faible";

  return {
    label: cleanDetectedLabel,
    confidence: Math.min(Math.max(confidence, 0.0), 1.0),
    recommendation,
    risk_level: riskLevel
  };
}

function decodeBase64(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = cleanBase64.length * 0.75;
  if (cleanBase64[cleanBase64.length - 1] === "=") {
    bufferLength--;
    if (cleanBase64[cleanBase64.length - 2] === "=") {
      bufferLength--;
    }
  }

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const base640 = lookup[cleanBase64.charCodeAt(i)];
    const base641 = lookup[cleanBase64.charCodeAt(i + 1)];
    const base642 = lookup[cleanBase64.charCodeAt(i + 2)];
    const base643 = lookup[cleanBase64.charCodeAt(i + 3)];

    bytes[p++] = (base640 << 2) | (base641 >> 4);
    if (p < bufferLength) bytes[p++] = ((base641 & 15) << 4) | (base642 >> 2);
    if (p < bufferLength) bytes[p++] = ((base642 & 3) << 6) | base643;
  }
  return bytes;
}

function cleanLabel(label: string): string {
  return label.replace("Tomato___", "").replaceAll("_", " ");
}

function getRecommendation(label: string): string {
  const l = label.toLowerCase();
  
  const header = "⚠️ IMPORTANT : Consultez un agent ANADER ou un conseiller agricole agréé pour valider les dosages et les homologations en vigueur dans votre zone.\n\n";

  if (l.includes("blackpod")) {
    return header +
      "💡 Action immédiate : Récoltez toutes les cabosses atteintes tous les 2 à 3 jours pour interrompre le cycle. Retirez et enterrez les résidus infectés sous au moins 30 cm de terre.\n\n" +
      "🚜 Prévention : Taillez régulièrement les cacaoyers pour favoriser la pénétration de la lumière et de l'air (réduit l'humidité ambiante).\n\n" +
      "🛡️ Traitement : En cas de forte pression, un traitement fongicide à base de cuivre peut être envisagé. Lisez attentivement la notice, respectez les doses et le délai avant récolte (DAR).";
  }
  if (l.includes("frosty rot") || l.includes("frosty")) {
    return header +
      "💡 Action immédiate : Repérez et éliminez avec précaution les cabosses momifiées avant qu'elles ne libèrent leurs spores poudreuses blanches. Évitez de secouer le cacaoyer.\n\n" +
      "🚜 Prévention : Maintenez un ombrage adéquat (environ 30-40%) et éliminez les mauvaises herbes qui maintiennent l'humidité au sol.\n\n" +
      "🛡️ Traitement : Pas de traitement chimique curatif efficace recommandé. Le contrôle mécanique précoce reste la méthode principale.";
  }
  if (l.includes("mirid")) {
    return header +
      "💡 Action immédiate : Inspectez le tronc et les gourmands pour détecter la présence de mirides (punaises).\n\n" +
      "🚜 Prévention : Effectuez des tailles de formation pour aérer la couronne des arbres.\n\n" +
      "🛡️ Traitement : Si le seuil de nuisibilité est dépassé, appliquez un insecticide homologué spécifique aux mirides du cacaoyer, de préférence tôt le matin ou en fin d'après-midi. Respectez scrupuleusement les équipements de protection individuelle (EPI).";
  }
  if (l.includes("anthracnose")) {
    return header +
      "💡 Action immédiate : Taillez les rameaux secs et récoltez/détruisez les fruits présentant des taches noires concaves.\n\n" +
      "🚜 Prévention : Évitez les blessures sur les fruits et pratiquez une taille d'aération après la récolte principale.\n\n" +
      "🛡️ Traitement : Des pulvérisations préventives à base de cuivre ou d'un fongicide homologué peuvent être appliquées juste après la floraison. Suivez les recommandations d'un conseiller pour le DAR.";
  }
  if (l.includes("bacterial canker") || l.includes("bacterial_canker")) {
    return header +
      "💡 Action immédiate : Coupez les branches présentant des chancres suintants en taillant au moins 10-15 cm dans le bois sain. Désinfectez systématiquement les outils de coupe à l'alcool à 70° entre chaque arbre.\n\n" +
      "🚜 Prévention : Évitez les tailles sévères en période de pluies et appliquez un mastic de cicatrisation sur les grosses plaies.\n\n" +
      "🛡️ Traitement : Les traitements cupriques (bouillie bordelaise) peuvent aider à limiter la propagation bactérienne après la taille.";
  }
  if (l.includes("cutting weevil") || l.includes("cutting_weevil")) {
    return header +
      "💡 Action immédiate : Ramassez et détruisez les bourgeons et jeunes pousses coupés tombés au sol pour éliminer les larves.\n\n" +
      "🚜 Prévention : Labourez superficiellement le sol autour de l'arbre pour perturber la nymphose du ravageur.\n\n" +
      "🛡️ Traitement : Les interventions chimiques sont rarement justifiées en culture familiale. Si nécessaire, demandez conseil pour un insecticide biologique à base de Bacillus thuringiensis ou d'azadirachtine (Neem).";
  }
  if (l.includes("die back") || l.includes("die_back")) {
    return header +
      "💡 Action immédiate : Taillez et brûlez les rameaux dépéris en coupant largement en dessous de la zone sèche.\n\n" +
      "🚜 Prévention : Améliorez le drainage du sol et apportez une fertilisation équilibrée pour renforcer la vigueur de l'arbre.\n\n" +
      "🛡️ Traitement : Appliquez un fongicide cicatrisant homologué sur les plaies de coupe.";
  }
  if (l.includes("gall midge") || l.includes("gall_midge")) {
    return header +
      "💡 Action immédiate : Ramassez les inflorescences et petits fruits déformés montrant des galles.\n\n" +
      "🚜 Prévention : Favorisez la présence d'auxiliaires naturels en évitant l'usage d'insecticides à large spectre.\n\n" +
      "🛡️ Traitement : Consultez un spécialiste pour l'utilisation d'insecticides systémiques spécifiques si l'infestation menace la floraison.";
  }
  if (l.includes("powdery mildew") || l.includes("powdery_mildew")) {
    return header +
      "💡 Action immédiate : Retirez les feuilles et inflorescences recouvertes d'un feutrage blanc poudreux.\n\n" +
      "🚜 Prévention : Espacez les plants ou élaguez les arbres pour réduire l'humidité et favoriser l'ensoleillement.\n\n" +
      "🛡️ Traitement : Appliquez du soufre mouillable dès l'apparition des premiers symptômes ou à la floraison. Attention aux températures élevées lors de l'application pour éviter les brûlures foliaires.";
  }
  if (l.includes("sooty mould") || l.includes("sooty_mould")) {
    return header +
      "💡 Action immédiate : La fumagine est un champignon qui se développe sur le miellat sécrété par des insectes piqueurs (pucerons, cochenilles). Identifiez et ciblez ces ravageurs.\n\n" +
      "🚜 Prévention : Favorisez l'aération de l'arbre pour réduire le développement des populations d'insectes.\n\n" +
      "🛡️ Traitement : Traitez les insectes vecteurs avec du savon noir ou des huiles blanches horticoles homologuées. La fumagine disparaîtra d'elle-même.";
  }
  if (l.includes("bacterial_spot")) {
    return header +
      "💡 Action immédiate : Éliminez les feuilles et les fruits présentant de petites taches sombres entourées d'un halo jaune. Ne travaillez pas dans la parcelle quand le feuillage est mouillé.\n\n" +
      "🚜 Prévention : Utilisez des semences certifiées saines et pratiquez la rotation des cultures.\n\n" +
      "🛡️ Traitement : Des applications préventives de cuivre peuvent limiter la propagation en saison humide.";
  }
  if (l.includes("early_blight")) {
    return header +
      "💡 Action immédiate : Supprimez les feuilles basales montrant des taches brunes concentriques (cibles).\n\n" +
      "🚜 Prévention : Paillez le sol pour limiter les éclaboussures d'eau et espacez suffisamment les plants.\n\n" +
      "🛡️ Traitement : Un fongicide homologué à base de cuivre ou de mancozèbe peut être préconisé en période chaude et humide.";
  }
  if (l.includes("late_blight")) {
    return header +
      "💡 Action immédiate : Arrachez et détruisez d'urgence les plants lourdement atteints (taches huileuses vert-grisâtre à brun sombre) pour protéger le reste de la parcelle.\n\n" +
      "🚜 Prévention : Évitez l'arrosage par aspersion (préférez le goutte-à-goutte) et assurez une bonne ventilation.\n\n" +
      "🛡️ Traitement : Un traitement fongicide curatif/systémique homologué est indispensable dès les premières alertes climatiques humides et fraîches.";
  }
  if (l.includes("leaf_mold")) {
    return header +
      "💡 Action immédiate : Supprimez les feuilles avec un feutrage olive/grisâtre sur la face inférieure.\n\n" +
      "🚜 Prévention : Cultivez des variétés résistantes et réduisez l'humidité sous abri en aérant au maximum.\n\n" +
      "🛡️ Traitement : Des fongicides préventifs peuvent être appliqués en cas de récurrence dans la zone.";
  }
  if (l.includes("septoria_leaf_spot")) {
    return header +
      "💡 Action immédiate : Retirez les feuilles basses portant de petites taches grises à centre clair et bordure sombre.\n\n" +
      "🚜 Prévention : Irriguez au pied du plant sans mouiller les feuilles et éliminez les débris de culture en fin de saison.\n\n" +
      "🛡️ Traitement : Les traitements fongicides cupriques sont généralement efficaces en couverture préventive.";
  }
  if (l.includes("spider_mites")) {
    return header +
      "💡 Action immédiate : Éliminez les feuilles jaunies et sèches présentant de fines toiles d'araignée sur la face inférieure.\n\n" +
      "🚜 Prévention : Maintenez une bonne humidité ambiante ou arrosez légèrement le feuillage le matin si le climat est excessivement sec (ce ravageur déteste l'humidité).\n\n" +
      "🛡️ Traitement : Utilisez des acaricides biologiques à base d'huiles de Neem ou introduisez des acariens prédateurs auxiliaires (Phytoseiulus).";
  }
  if (l.includes("target_spot")) {
    return header +
      "💡 Action immédiate : Supprimez les feuilles atteintes de petites taches circulaires brunâtres.\n\n" +
      "🚜 Prévention : Assurez une fertilisation équilibrée et une bonne aération de la canopée.\n\n" +
      "🛡️ Traitement : Pulvérisez un fongicide homologué préventif si le climat reste chaud et humide.";
  }
  if (l.includes("yellow_leaf_curl")) {
    return header +
      "💡 Action immédiate : Éliminez immédiatement les plants infectés présentant un enroulement sévère des feuilles et un nanisme.\n\n" +
      "🚜 Prévention : Ce virus est transmis par l'aleurode (mouche blanche). Installez des pièges collants jaunes et utilisez des filets anti-insectes fins.\n\n" +
      "🛡️ Traitement : Pas de traitement curatif direct contre le virus. Contrôlez l'aleurode avec du savon noir ou des traitements insecticides biologiques homologués.";
  }
  if (l.includes("mosaic_virus")) {
    return header +
      "💡 Action immédiate : Arrachez et détruisez les plants montrant une décoloration en mosaïque vert clair/vert foncé sur les feuilles.\n\n" +
      "🚜 Prévention : Lavez-vous soigneusement les mains et désinfectez les outils au phosphate trisodique ou au lait écrémé lors des manipulations (le virus se transmet mécaniquement).\n\n" +
      "🛡️ Traitement : Pas de traitement curatif. Utilisez des variétés de tomates résistantes aux virus (TMV/ToMV).";
  }
  if (l.includes("healthy") || l.includes("sain")) {
    return "💡 Plante saine : Félicitations ! Votre culture ne présente aucun symptôme pathologique.\n\n" +
      "🚜 Conseils : Continuez une inspection visuelle hebdomadaire, pratiquez un arrosage régulier au pied et veillez à un désherbage propre pour éviter toute infestation future.";
  }

  return header + `💡 Diagnostic identifié : ${cleanLabel(label)}.\n\n` +
    `🚜 Recommandation : Nous vous recommandons de consulter rapidement un technicien ANADER pour obtenir un protocole de diagnostic et de lutte précis.`;
}
