import React, { useState } from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const API_URL = `http://${API_HOST}:4000/api/user/verifyUser`;

const setSessionValue = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedLicense = licenseNumber.trim();

    if (!trimmedName || !trimmedLicense) {
      Alert.alert("Missing details", "Please enter both your name and license number.");
      return;
    }

    try {
      const response = await axios.post(API_URL, { name: trimmedName, licenseNumber: trimmedLicense });
      const userData = response.data;

      await setSessionValue("JWTToken", userData.token);
      await setSessionValue("nurseName", userData.user.name);
      await setSessionValue("nurseLicense", userData.user.licenseNumber);
      Alert.alert("Success", "Login successful");
      navigation.navigate("Main");
    } catch (error) {
      if (error.response?.data?.message) {
        Alert.alert("Login Failed", error.response.data.message);
        return;
      }
      Alert.alert(
        "Network error",
        `Unable to reach nurse backend at http://${API_HOST}:4000. Make sure nurse-backend is running.`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access Account</Text>
      <Text>Please enter your name and license number</Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your registered name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* License Number Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="document-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your license number"
          placeholderTextColor="#888"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 220,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: -50,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edeffd",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  forgotText: {
    color: "#4A63E7",
    alignSelf: "flex-end",
    marginTop: 10,
    marginLeft: 234,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4A63E7",
    paddingVertical: 12,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});

export default LoginScreen;
