import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import axios from "axios";

// Use localhost for web, and LAN IP for physical devices.
const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const API_PORT = 5000;
const API_URL = `http://${API_HOST}:${API_PORT}/api/auth/login`;

const AccessAccount = ({ setPage, setUser }) => { // Accept setUser as a prop
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  const handleLogin = async () => {
    const trimmedName = name.trim();
    const trimmedDob = dob.trim();

    if (!trimmedName || !trimmedDob) {
      Alert.alert("Missing details", "Please enter both name and DOB.");
      return;
    }

    try {
      const response = await axios.post(API_URL, { name: trimmedName, dob: trimmedDob });
      const userData = response.data; // Get user data from backend response

      setUser(userData); // Store user details in App.js state
      Alert.alert("Success", "Login successful");
      setPage("patientDashboard");
    } catch (error) {
      if (error.response?.data?.message) {
        Alert.alert("Login failed", error.response.data.message);
        return;
      }

      Alert.alert(
        "Network error",
        `Unable to reach backend at http://${API_HOST}:${API_PORT}. Start patient-backend and try again.`
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => setPage('home')}>
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Access Account</Text>
        <Text style={styles.subtitle}>Use the details registered by the admin to access the system</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#BDBDBD" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your registered name"
            placeholderTextColor="#BDBDBD"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="calendar" size={20} color="#BDBDBD" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your DOB (YYYY-MM-DD)"
            placeholderTextColor="#BDBDBD"
            value={dob}
            onChangeText={setDob}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6759FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  content: {
    width: "100%",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#6759FF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AccessAccount;
