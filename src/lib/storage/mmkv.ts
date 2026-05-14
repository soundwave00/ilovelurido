// AsyncStorage wrapper — sostituisce MMKV per compatibilità con Expo Go.
// MMKV richiede JSI non disponibile in Expo Go.
import AsyncStorage from '@react-native-async-storage/async-storage';

export { AsyncStorage as storage };
