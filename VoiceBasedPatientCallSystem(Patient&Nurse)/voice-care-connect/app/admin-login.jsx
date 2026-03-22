import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const AdminLogin = ({ setPage, adminLoginUrl }) => {
  const handleOpenAdminLogin = async () => {
    try {
      await Linking.openURL(`${adminLoginUrl}/login`);
    } catch (error) {
      Alert.alert(
        "Unable to open Admin Login",
        `Could not open ${adminLoginUrl}/login. Make sure the Admin frontend is running.`
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <TouchableOpacity style={styles.backButton} onPress={() => setPage("home")}>
        <Feather name="arrow-left" size={22} color="#ECF2FF" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>
          Secure administrative access to hospital records, analytics, and control center.
        </Text>

        <View style={styles.infoBox}>
          <Feather name="shield" size={18} color="#1E2A68" />
          <Text style={styles.infoText}>Destination: {adminLoginUrl}/login</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenAdminLogin}>
          <Text style={styles.primaryButtonText}>Open Admin Login</Text>
          <Feather name="external-link" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => setPage("home")}>
          <Text style={styles.secondaryButtonText}>Back to Role Selector</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B4C",
    justifyContent: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  topGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#3451E6",
    top: -100,
    right: -80,
    opacity: 0.32,
  },
  bottomGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#10A8C4",
    left: -70,
    bottom: -90,
    opacity: 0.2,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 34,
    left: 18,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  card: {
    backgroundColor: "#F9FBFF",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#18245E",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#4C5688",
  },
  infoBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7DFF8",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: "#1E2A68",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: "#1B2D89",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1E2A68",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default AdminLogin;
