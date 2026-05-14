// Milano centro
export const MILANO_REGION = {
  latitude: 45.464664,
  longitude: 9.18854,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
} as const;

// Radius default per la query nearby_luridi (2 km, come da schema)
export const DEFAULT_NEARBY_RADIUS_M = 2000;

// Soglie cluster (numero marker) per zoom — usato da react-native-map-clustering
export const CLUSTER_RADIUS = 50; // pixel
export const CLUSTER_MIN_POINTS = 2;
