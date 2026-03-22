import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import profileImage from "../assets/profile-image.jpg"; // Replace with actual profile image
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const API_PORT = 4000;
const API_URL = `http://${API_HOST}:${API_PORT}/api/user/getUserProfile`;

const getSessionValue = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
};
// Dummy schedule data
const scheduleData = [
  {
    id: "1",
    time: "9:00AM - 5:00PM",
    room: "6B",
    description: "Assess/Chart - Peds...",
  },
  {
    id: "2",
    time: "9:00AM - 5:00PM",
    room: "4A",
    description: "Assess/Chart - Peds...",
  },
];


// const NurseProfileScreen = () => {
//   const navigation = useNavigation(); // Get navigation instance


//   const handleLogout = () => {
//     navigation.reset({
//       index: 0,
//       routes: [{ name: "Login" }], // Reset navigation to Login screen
//     });
//   };



//   return (
//     <View style={styles.container}>
//       {/* Profile Section */}
//       <View style={styles.profileSection}>
//         <Image source={profileImage} style={styles.profileImage} />
//         <Text style={styles.name}>asdfghjk</Text>
//         <Text style={styles.info}>1234</Text>
//         <Text style={styles.info}>Registered Nurse (RN)</Text>
//         <Text style={styles.info}>Psychiatric & Mental Health Nursing</Text>
//       </View>

//       {/* Schedule Section */}
//       <Text style={styles.sectionTitle}>Schedule</Text>
//       <FlatList
//         data={scheduleData}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.scheduleItem}>
//             <Ionicons name="calendar-outline" size={24} color="black" />
//             <View style={styles.scheduleText}>
//               <Text style={styles.time}>{item.time}</Text>
//               <Text style={styles.room}>{item.room}</Text>
//               <Text style={styles.description}>{item.description}</Text>
//             </View>
//           </View>
//         )}
//       />
//       {/* Logout Button */}
//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutText}>Log Out</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };


const NurseProfileScreen = () => {
  const navigation = useNavigation();
  const [nurseData, setNurseData] = useState({ nurseName: "", department: "" });
  const [schedules, setSchedules] = useState([]);

  const fetchUserProfile = async () => {
    try {
      const token = await getSessionValue("JWTToken");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNurseData(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = await getSessionValue("JWTToken");
      const response = await axios.get(`http://${API_HOST}:${API_PORT}/api/user/getNurseSchedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(response.data?.schedules || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
      fetchSchedules();
    }, [])
  );

  const handleLogout = () => {
      navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
      });
  };

  return (
      <View style={styles.container}>
          <View style={styles.profileSection}>
              <Image source={profileImage} style={styles.profileImage} />
              <Text style={styles.name}>Name : {nurseData.nurseName}</Text>
              <Text style={styles.info}>Department : {nurseData.department}</Text>
              <Text style={styles.info}>Registered Nurse (RN)</Text>
              <Text style={styles.info}>Aster Medicity</Text>
          </View>

          <View style={styles.scheduleHeader}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <TouchableOpacity 
                  style={styles.editScheduleButton}
                  onPress={() => navigation.navigate("Schedule")}
              >
                  <Ionicons name="pencil" size={18} color="#4359d0" />
                  <Text style={styles.editScheduleText}>Edit</Text>
              </TouchableOpacity>
          </View>

          {schedules.length === 0 ? (
              <View style={styles.noScheduleContainer}>
                  <Text style={styles.noScheduleText}>No schedules added yet</Text>
                  <TouchableOpacity 
                      style={styles.addScheduleButton}
                      onPress={() => navigation.navigate("Schedule")}
                  >
                      <Text style={styles.addScheduleButtonText}>Add Schedule</Text>
                  </TouchableOpacity>
              </View>
          ) : (
              <FlatList
                  data={schedules}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                      <View style={styles.scheduleItem}>
                          <Ionicons name="calendar-outline" size={24} color="#4359d0" />
                          <View style={styles.scheduleText}>
                              <Text style={styles.time}>{item.dayOfWeek}</Text>
                              <Text style={styles.room}>{item.startTime} - {item.endTime}</Text>
                              <Text style={styles.description}>{item.shiftType} Shift</Text>
                          </View>
                      </View>
                  )}
              />
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
      </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginTop: 20,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
    color: "#383838",
  },
  info: {
    fontSize: 16,
    color: "#3D3D3D",
    marginTop: 4,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEFFD",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  scheduleText: {
    marginLeft: 10,
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
  },
  room: {
    fontSize: 14,
    color: "#383838",
  },
  description: {
    fontSize: 14,
    color: "#383838",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    padding: 12,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    alignSelf: "center", // Center the button horizontally
  },
  logoutText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  editScheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EDEFFD",
  },
  editScheduleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4359d0",
  },
  noScheduleContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  noScheduleText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
  },
  addScheduleButton: {
    backgroundColor: "#4359d0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addScheduleButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default NurseProfileScreen;
