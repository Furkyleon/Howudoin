import { Platform } from 'react-native';

export const API_URL = Platform.select({
    ios: 'http://localhost:8080', // iOS simülatöründe localhost
    android: 'http://10.0.2.2:8080', // Android emülatörü için localhost
});