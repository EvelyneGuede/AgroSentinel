const reactNativeMapsComponents = [
  "AIRMap",
  "AIRMapCallout",
  "AIRMapCalloutSubview",
  "AIRMapCircle",
  "AIRMapHeatmap",
  "AIRMapLocalTile",
  "AIRMapMarker",
  "AIRMapOverlay",
  "AIRMapPolygon",
  "AIRMapPolyline",
  "AIRMapUrlTile",
  "AIRMapWMSTile"
];

// react-native-maps utilise encore ces vues avec l'Interop Layer de Fabric.
// Cette déclaration est nécessaire avec React Native 0.81 / Expo SDK 54.
module.exports = {
  project: {
    android: {
      unstable_reactLegacyComponentNames: reactNativeMapsComponents
    },
    ios: {
      unstable_reactLegacyComponentNames: reactNativeMapsComponents
    }
  }
};
