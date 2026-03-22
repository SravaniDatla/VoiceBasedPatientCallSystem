import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import profileImage from "../assets/profile-image.jpg";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const ADMIN_PATIENTS_URL = `http://${API_HOST}:5001/api/patients`;

const PatientRecordsScreen = () => {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(ADMIN_PATIENTS_URL);
        const mapped = (response.data || []).map((p) => ({
          id: p._id,
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Unknown",
          room: p.roomNo || "N/A",
          description: p.medicalHistory || "No medical history",
          contact: p.contactNumber || "Not available",
          dob: p.dateOfBirth,
          gender: p.gender || "N/A",
          email: p.email || "",
        }));
        setPatients(mapped);
      } catch (error) {
        console.error("Error fetching patients:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const text = searchQuery.trim().toLowerCase();
    if (!text) return patients;
    return patients.filter((patient) => patient.name.toLowerCase().includes(text));
  }, [patients, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Patient Records</Text>
        <TouchableOpacity>
          <Image source={profileImage} style={styles.profileImage} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color="gray"
              style={styles.clearIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={
              () => navigation.navigate("RecordDetails", { patient: item }) // ✅ Now navigation is defined
            }
          >
            <Ionicons name="person-outline" size={24} color="black" />
            <View style={styles.info}>
              <Text style={styles.name}>
                {item.name}, {item.room}
              </Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.contact}>📞 {item.contact}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noResults}>{loading ? "Loading patients..." : "No patients found"}</Text>
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 29,
    fontWeight: "bold",
    color: "#383838",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edeffd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  clearIcon: {
    marginLeft: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEFFD",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  info: {
    marginLeft: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    color: "#383838",
    marginTop: 5,
    marginBottom: 4,
  },
  contact: {
    fontSize: 15,
    color: "#007AFF",
    marginTop: 4,
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
});

export default PatientRecordsScreen;
