// ============================================================
// CareConnect Mobile - Application Config
// ============================================================

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// NOTE FOR DEMO:
// Because we are running on a physical device (via Expo Go),
// localhost will point to the phone itself, NOT your computer.
// Please replace this IP address with your computer's local Wi-Fi IP.
// Example: "http://192.168.1.15:5000/api"
//
// For Android Emulators, "http://10.0.2.2:5000/api" works.
// For iOS Simulators, "http://localhost:5000/api" works.

export const API_BASE_URL = "http://10.0.2.2:5000/api";

// Fallback patient ID for the hackathon demo if no login system is built
export const DEMO_PATIENT_ID = "69d8e00c1228569c07a2c636"; // Rajesh Mehta's Seeded ID

