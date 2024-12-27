import { Platform } from 'react-native';
import * as Device from 'expo-device';

const hostIP = '10.51.39.173'; // Replace with your local network IP (WiFi network IP)

export const API_URL = Platform.select({
    ios: Device.isDevice
        ? `http://${hostIP}:8080` // Physical iPhone uses the host IP
        : 'http://localhost:8080', // iOS simulator uses localhost

    android: Device.isDevice
        ? `http://${hostIP}:8080` // Physical Android device uses the host IP
        : 'http://10.0.2.2:8080', // Emulator uses this special IP to access the host

    default: `http://192.168.96.1:8080`, // For web browsers or other platforms
});

