import React, { useEffect, useState } from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const API_PORT = 4000;
const PATIENTS_API_URL = `http://${API_HOST}:${API_PORT}/api/nurse/getHospitalPatients`;

const getSessionValue = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
};

const PatientRecordsScreen = () => {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);

  const fetchHospitalPatients = async () => {
    try {
      const token = await getSessionValue("JWTToken");
      const response = await axios.get(PATIENTS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const records = response.data?.patients || [];
      setPatients(records);
      setFilteredPatients(records);
    } catch (error) {
      console.error("Error fetching hospital patients:", error);
      setPatients([]);
      setFilteredPatients([]);
    }
  };

  useEffect(() => {
    fetchHospitalPatients();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchHospitalPatients();
    }, [])
  );

  // Function to filter patients based on search query
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === "") {
      setFilteredPatients(patients);
    } else {
      const filteredData = patients.filter((patient) =>
        patient.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPatients(filteredData);
    }
  };

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
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
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
              {!!item.contact && <Text style={styles.contact}>📞 {item.contact}</Text>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noResults}>No current hospital patients found</Text>
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
