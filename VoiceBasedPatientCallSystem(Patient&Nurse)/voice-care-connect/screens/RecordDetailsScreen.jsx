import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import profileImage from "../assets/profile-PATIENT.png";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const REQUEST_HISTORY_URL = `http://${API_HOST}:5000/api/patientRequests/history`;
const ASSIGN_REQUEST_URL = `http://${API_HOST}:4000/api/nurse/assignPatientRequest`;

const getSessionValue = async (key) => {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

const RecordDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { patient } = route.params; // Getting patient data from navigation
  const [interactions, setInteractions] = useState([]);

  const loadHistory = async () => {
    try {
      if (!patient?.name) return;
      const response = await axios.get(`${REQUEST_HISTORY_URL}/${encodeURIComponent(patient.name)}`);
      const rows = (response.data || []).map((item) => ({
        id: item._id,
        date: new Date(item.timestamp).toLocaleDateString(),
        nurse:
          item.assignedNurseName ||
          (item.assignedNurseId ? `#${item.assignedNurseId}` : "Unassigned"),
        assignedNurseId: item.assignedNurseId || "",
        action: item.requestText,
        status: item.status || "pending",
      }));
      setInteractions(rows);
    } catch (error) {
      console.error("Error loading patient interactions:", error.message);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [patient?.name]);

  const assignToMe = async (requestId) => {
    try {
      const token = await getSessionValue("JWTToken");
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        return;
      }

      await axios.put(
        ASSIGN_REQUEST_URL,
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Assigned", "Task assigned to you.");
      await loadHistory();
    } catch (error) {
      const msg = error?.response?.data?.message || "Unable to assign task.";
      Alert.alert("Assignment failed", msg);
    }
  };

  const assignAllToMe = async () => {
    try {
      const token = await getSessionValue("JWTToken");
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        return;
      }

      const unassigned = interactions.filter((item) => !item.assignedNurseId);
      if (unassigned.length === 0) {
        Alert.alert("No unassigned tasks", "All tasks for this patient are already assigned.");
        return;
      }

      await Promise.all(
        unassigned.map((item) =>
          axios.put(
            ASSIGN_REQUEST_URL,
            { requestId: item.id },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      Alert.alert("Assigned", "All unassigned tasks were assigned to you.");
      await loadHistory();
    } catch (error) {
      const msg = error?.response?.data?.message || "Unable to assign all tasks.";
      Alert.alert("Assignment failed", msg);
    }
  };

  const dobText = patient?.dob ? new Date(patient.dob).toLocaleDateString() : "N/A";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Records Management</Text>
        <Ionicons name="ellipsis-vertical" size={24} color="black" />
      </View>

      {/* Patient Info */}
      <View style={styles.patientInfo}>
        <Image source={profileImage} style={styles.profileImage} />
        <Text style={styles.patientName}>{patient.name}</Text>
        <Text style={styles.patientDetails}>Patient ID: {patient.id}</Text>
        <Text style={styles.patientDetails}>DOB: {dobText} | Sex: {patient.gender || "N/A"}</Text>
        <Text style={styles.admittedFor}>
          <Text style={styles.boldText}>Admitted for: </Text>{patient.description || "No details"}
        </Text>
      </View>

      {/* Nurse Interactions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>NURSE INTERACTION</Text>
        <TouchableOpacity style={styles.assignAllButton} onPress={assignAllToMe}>
          <Text style={styles.assignAllButtonText}>Assign All To Me</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={interactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.interactionCard}>
            <View style={styles.interactionRow}>
              <Ionicons name="time-outline" size={20} color="#007AFF" />
              <Text style={styles.interactionDate}>{item.date}</Text>
              <Text style={styles.nurseName}>Nurse {item.nurse}</Text>
            </View>
            <Text style={styles.interactionAction}>{item.action}</Text>
            <Text style={styles.statusText}>Status: {item.status}</Text>
            {!item.assignedNurseId ? (
              <TouchableOpacity style={styles.assignButton} onPress={() => assignToMe(item.id)}>
                <Text style={styles.assignButtonText}>Assign To Me</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No interactions yet</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  patientInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  patientName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  patientDetails: {
    fontSize: 16,
    color: "gray",
    marginTop: 2,
  },
  admittedFor: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
  },
  boldText: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assignAllButton: {
    backgroundColor: "#1f7a4f",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assignAllButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  interactionCard: {
    backgroundColor: "#EDEFFD",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  interactionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  interactionDate: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  nurseName: {
    fontSize: 16,
    marginLeft: 10,
  },
  interactionAction: {
    fontSize: 15,
    color: "#383838",
  },
  statusText: {
    marginTop: 4,
    color: "#007AFF",
    fontWeight: "600",
  },
  assignButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#4359d0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assignButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 12,
    color: "gray",
  },
});

export default RecordDetailsScreen;
