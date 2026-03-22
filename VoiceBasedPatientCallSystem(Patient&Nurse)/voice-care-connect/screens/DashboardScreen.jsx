import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Platform, ScrollView } from "react-native";
import profileImage from "../assets/profile-image.jpg";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const SHIFTS_URL = `http://${API_HOST}:4000/api/user/getNurseSchedule`;

const getSessionValue = async (key) => {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

const DashboardScreen = () => {
  const [nurseName, setNurseName] = useState("Nurse");
  const [department, setDepartment] = useState("N/A");
  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const storedName = await getSessionValue("nurseName");
        if (storedName) setNurseName(storedName);

        const token = await getSessionValue("JWTToken");
        if (!token) return;

        const shiftsRes = await axios.get(SHIFTS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const shifts = shiftsRes.data?.shifts || shiftsRes.data || [];
        setUpcomingShifts(Array.isArray(shifts) ? shifts.slice(0, 5) : []);
      } catch (error) {
        console.error("Error loading nurse dashboard shifts:", error.message);
        setUpcomingShifts([]);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Main Nurse Dashboard</Text>
        <Image source={profileImage} style={styles.profileImage} />
      </View>

      {/* Nurse summary */}
      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nurse Summary</Text>
          <Text style={styles.shiftText}>Name: {nurseName}</Text>
          <Text style={styles.shiftText}>Department: {department}</Text>
          <Text style={styles.shiftText}>Pending Tasks: {pendingCount}</Text>
          <Text style={styles.shiftText}>In-progress Tasks: {inProgressCount}</Text>
          <Text style={styles.shiftText}>Completed Tasks: {completedCount}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed By You</Text>
          {completedTasks.length === 0 ? (
            <Text style={styles.emptyText}>No completed patient requirements yet.</Text>
          ) : (
            completedTasks.map((task) => (
              <View key={task.id} style={styles.completedItem}>
                <Text style={styles.completedText}>{task.patientName}: {task.text}</Text>
                {task.time ? <Text style={styles.completedTime}>{task.time}</Text> : null}
              </View>
            ))
          )}
        </View>
      </View>

      {/* Upcoming Shifts */}
      <View style={styles.sectionContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
          {upcomingShifts.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming shifts scheduled.</Text>
          ) : (
            upcomingShifts.map((shift, index) => {
              const shiftDate = shift.date
                ? new Date(shift.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).toUpperCase()
                : "";
              const shiftTime = `${shift.startTime || ""}${
                shift.endTime ? "-" + shift.endTime : ""
              }`;
              const location = `${shift.location || ""}${
                shift.facility ? " | " + shift.facility : ""
              }`;

              return (
                <View key={index} style={styles.shiftItem}>
                  {shiftDate && <Text style={styles.shiftDate}>{shiftDate}</Text>}
                  <Text style={styles.shiftText}>
                    {shiftTime}
                    {location && ` | ${location}`}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#383838",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  section: {
    backgroundColor: "#EDEFFD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 28,
    color: "#273377",
  },
  shiftText: {
    fontSize: 16,
    marginBottom: 12,
    color: "#1F2937",
  },
  shiftItem: {
    borderTopWidth: 1,
    borderTopColor: "#D7DCF4",
    paddingTop: 10,
    marginTop: 10,
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#273377",
    marginBottom: 6,
  },
  completedItem: {
    borderTopWidth: 1,
    borderTopColor: "#D7DCF4",
    paddingTop: 10,
    marginTop: 10,
  },
  completedText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  completedTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default DashboardScreen;
