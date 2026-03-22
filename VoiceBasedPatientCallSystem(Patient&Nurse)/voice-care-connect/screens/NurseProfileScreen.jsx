import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import profileImage from "../assets/profile-image.jpg"; // Replace with actual profile image
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const API_URL = `http://${API_HOST}:4000/api/user/getUserProfile`;
const SHIFTS_URL = `http://${API_HOST}:4000/api/user/getNurseSchedule`;


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


const getSessionValue = async (key) => {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

const NurseProfileScreen = () => {
  const navigation = useNavigation();
  const [nurseData, setNurseData] = useState({ nurseName: "", department: "", role: "", contactNumber: "", licenseNumber: "" });
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
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
        const response = await axios.get(SHIFTS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data?.schedules || response.data?.shifts || [];
        setSchedules(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching nurse schedule:", error);
        setSchedules([]);
      }
    };

    fetchUserProfile();
    fetchSchedules();
  }, []);

  const formatDate = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

          <Text style={styles.sectionTitle}>Schedule</Text>
          <FlatList
              data={schedules}
              keyExtractor={(item, index) => `${item.date || "shift"}-${item.startTime || ""}-${index}`}
              ListEmptyComponent={<Text style={styles.noScheduleText}>No schedules added yet.</Text>}
              renderItem={({ item }) => (
                  <View style={styles.scheduleItem}>
                      <Ionicons name="calendar-outline" size={24} color="black" />
                      <View style={styles.scheduleText}>
                    <Text style={styles.time}>{formatDate(item.date)}</Text>
                    <Text style={styles.room}>{`${item.startTime || ""} - ${item.endTime || ""}`}</Text>
                    <Text style={styles.description}>{`${item.location || ""}${item.facility ? ` | ${item.facility}` : ""}`}</Text>
                      </View>
                  </View>
              )}
          />
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
  noScheduleText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginVertical: 12,
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
});

export default NurseProfileScreen;
