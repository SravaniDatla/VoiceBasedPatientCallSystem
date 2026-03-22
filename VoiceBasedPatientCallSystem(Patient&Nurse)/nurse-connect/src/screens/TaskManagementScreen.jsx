import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const API_PORT = 4000;
const GET_API_URL = `http://${API_HOST}:${API_PORT}/api/nurse/getPatientRequests`;
const UPDATE_API_URL = `http://${API_HOST}:${API_PORT}/api/nurse/updatePatientRequests`;

const getSessionValue = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
};

const TaskManagementScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [username, setUsername] = useState("Nurse");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  const formatPatientDetails = (task) => {
    const details = task?.patientDetails || {};
    const parts = [];

    if (details.patientId) parts.push(`ID: ${details.patientId}`);
    if (details.roomNo) parts.push(`Room: ${details.roomNo}`);
    if (details.phone) parts.push(`Phone: ${details.phone}`);

    return parts.join(" | ");
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setIsTaskModalVisible(true);
  };

  const closeTaskDetails = () => {
    setIsTaskModalVisible(false);
    setSelectedTask(null);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = await getSessionValue("JWTToken");
        const response = await axios.get(GET_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data || []);

        const name = (await getSessionValue("nurseName")) || (await getSessionValue("userName"));
        if (name) setUsername(name);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const toggleTask = async (taskId, currentStatus) => {
    let newStatus;
    if (currentStatus === "pending") {
      newStatus = "inProgress";
    } else if (currentStatus === "inProgress") {
      newStatus = "completed";
    }

    if (!newStatus) return;

    try {
      const token = await getSessionValue("JWTToken");
      await axios.put(
        UPDATE_API_URL,
        { requestId: taskId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "inProgress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks Status</Text>
        <Image source={require("../assets/profile-image.jpg")} style={styles.profileImage} />
      </View>

      <Text style={styles.welcomeText}>Welcome back, {username}</Text>

      <View style={styles.statusContainer}>
        <View style={styles.statusBox}>
          <FontAwesome name="clock-o" size={24} color="#4359d0" />
          <Text style={styles.statusText}>Pending - {pendingTasks.length}</Text>
        </View>
        <View style={styles.statusBox}>
          <FontAwesome name="arrow-right" size={24} color="#4359d0" />
          <Text style={styles.statusText}>In-progress - {inProgressTasks.length}</Text>
        </View>
        <View style={styles.statusBox}>
          <FontAwesome name="check-circle-o" size={24} color="#4359d0" />
          <Text style={styles.statusText}>Completed - {completedTasks.length}</Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Tasks</Text>
          {pendingTasks.map((task) => (
            <View key={task._id} style={styles.taskRow}>
              <TouchableOpacity style={styles.taskContent} onPress={() => openTaskDetails(task)}>
                <Text style={styles.taskText}>{task.request}</Text>
                {!!formatPatientDetails(task) && <Text style={styles.taskMetaText}>{formatPatientDetails(task)}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.statusActionButton} onPress={() => toggleTask(task._id, task.status)}>
                <FontAwesome name="square-o" size={22} color="#4359d0" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In-progress Tasks</Text>
          {inProgressTasks.map((task) => (
            <View key={task._id} style={styles.taskRow}>
              <TouchableOpacity style={styles.taskContent} onPress={() => openTaskDetails(task)}>
                <Text style={styles.taskText}>{task.request}</Text>
                {!!formatPatientDetails(task) && <Text style={styles.taskMetaText}>{formatPatientDetails(task)}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.statusActionButton} onPress={() => toggleTask(task._id, task.status)}>
                <FontAwesome name="arrow-right" size={22} color="#4359d0" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Tasks</Text>
          {completedTasks.map((task) => (
            <View style={styles.taskRow} key={task._id}>
              <TouchableOpacity style={styles.taskContent} onPress={() => openTaskDetails(task)}>
                <Text style={styles.completedTaskText}>{task.request}</Text>
                {!!formatPatientDetails(task) && <Text style={styles.taskMetaText}>{formatPatientDetails(task)}</Text>}
              </TouchableOpacity>
              <View style={styles.statusActionButton}>
                <FontAwesome name="check-circle" size={22} color="green" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={isTaskModalVisible} transparent animationType="fade" onRequestClose={closeTaskDetails}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Patient Task Details</Text>
            <Text style={styles.modalItem}>Patient: {selectedTask?.patientName || "Unknown"}</Text>
            <Text style={styles.modalItem}>Patient ID: {selectedTask?.patientDetails?.patientId || "N/A"}</Text>
            <Text style={styles.modalItem}>Room: {selectedTask?.patientDetails?.roomNo || "N/A"}</Text>
            <Text style={styles.modalItem}>Phone: {selectedTask?.patientDetails?.phone || "N/A"}</Text>
            <Text style={styles.modalItem}>Status: {selectedTask?.status || "pending"}</Text>
            <Text style={styles.modalItem}>What happened: {selectedTask?.requestText || selectedTask?.request || "No details"}</Text>

            <TouchableOpacity style={styles.closeButton} onPress={closeTaskDetails}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 36,
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
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 36,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  statusBox: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 17,
    marginTop: 5,
  },
  section: {
    backgroundColor: "#EDEFFD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#383838",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskContent: {
    flex: 1,
  },
  statusActionButton: {
    marginLeft: 10,
    paddingTop: 2,
    paddingHorizontal: 4,
  },
  taskText: {
    fontSize: 17,
    color: "#383838",
  },
  taskMetaText: {
    marginTop: 4,
    fontSize: 13,
    color: "#5E5E5E",
  },
  completedTaskText: {
    fontSize: 16,
    color: "blue",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#383838",
    marginBottom: 12,
  },
  modalItem: {
    fontSize: 15,
    color: "#383838",
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#4359d0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default TaskManagementScreen;
