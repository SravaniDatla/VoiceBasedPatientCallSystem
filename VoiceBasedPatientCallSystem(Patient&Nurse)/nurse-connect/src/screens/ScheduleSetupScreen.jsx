import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const API_PORT = 4000;
const UPDATE_SCHEDULE_URL = `http://${API_HOST}:${API_PORT}/api/user/updateNurseSchedule`;
const GET_SCHEDULE_URL = `http://${API_HOST}:${API_PORT}/api/user/getNurseSchedule`;

const getSessionValue = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
};

const setSessionValue = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const ScheduleSetupScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    shiftType: "Morning",
    startTime: "09:00",
    endTime: "17:00",
    dayOfWeek: "Monday",
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const shiftTypes = ["Morning", "Afternoon", "Night"];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = await getSessionValue("JWTToken");
      const response = await axios.get(GET_SCHEDULE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(response.data?.schedules || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const openModal = (index = null) => {
    if (index !== null) {
      setFormData(schedules[index]);
      setEditingIndex(index);
    } else {
      setFormData({
        shiftType: "Morning",
        startTime: "09:00",
        endTime: "17:00",
        dayOfWeek: "Monday",
      });
      setEditingIndex(null);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingIndex(null);
  };

  const saveSchedule = async () => {
    if (!formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    const updatedSchedules = editingIndex !== null
      ? schedules.map((s, i) => (i === editingIndex ? formData : s))
      : [...schedules, formData];

    try {
      const token = await getSessionValue("JWTToken");
      await axios.put(
        UPDATE_SCHEDULE_URL,
        { schedules: updatedSchedules },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSchedules(updatedSchedules);
      closeModal();
      Alert.alert("Success", "Schedule saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save schedule.");
      console.error("Error saving schedule:", error);
    }
  };

  const deleteSchedule = (index) => {
    Alert.alert("Confirm", "Delete this schedule?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const updatedSchedules = schedules.filter((_, i) => i !== index);
          try {
            const token = await getSessionValue("JWTToken");
            await axios.put(
              UPDATE_SCHEDULE_URL,
              { schedules: updatedSchedules },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setSchedules(updatedSchedules);
          } catch (error) {
            Alert.alert("Error", "Failed to delete schedule.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#383838" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Your Work Schedule</Text>

        {schedules.length === 0 ? (
          <Text style={styles.emptyText}>No schedules added yet. Add your first schedule below.</Text>
        ) : (
          schedules.map((schedule, index) => (
            <View key={index} style={styles.scheduleCard}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.dayText}>{schedule.dayOfWeek}</Text>
                <Text style={styles.timeText}>
                  {schedule.startTime} - {schedule.endTime}
                </Text>
                <Text style={styles.shiftText}>{schedule.shiftType} Shift</Text>
              </View>
              <View style={styles.scheduleActions}>
                <TouchableOpacity onPress={() => openModal(index)} style={styles.editButton}>
                  <Ionicons name="pencil" size={20} color="#4359d0" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteSchedule(index)} style={styles.deleteButton}>
                  <Ionicons name="trash" size={20} color="#E63946" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add-circle-outline" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add Schedule</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingIndex !== null ? "Edit" : "Add"} Schedule</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={28} color="#383838" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Day of Week</Text>
              <View style={styles.pickerContainer}>
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerButton,
                      formData.dayOfWeek === day && styles.pickerButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, dayOfWeek: day })}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        formData.dayOfWeek === day && styles.pickerButtonTextActive,
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Shift Type</Text>
              <View style={styles.shiftContainer}>
                {shiftTypes.map((shift) => (
                  <TouchableOpacity
                    key={shift}
                    style={[
                      styles.shiftButton,
                      formData.shiftType === shift && styles.shiftButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, shiftType: shift })}
                  >
                    <Text
                      style={[
                        styles.shiftButtonText,
                        formData.shiftType === shift && styles.shiftButtonTextActive,
                      ]}
                    >
                      {shift}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                value={formData.startTime}
                onChangeText={(text) => setFormData({ ...formData, startTime: text })}
              />

              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                value={formData.endTime}
                onChangeText={(text) => setFormData({ ...formData, endTime: text })}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveSchedule}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#383838",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#383838",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
    fontSize: 14,
  },
  scheduleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDEFFD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#383838",
  },
  timeText: {
    fontSize: 14,
    color: "#4359d0",
    marginTop: 4,
    fontWeight: "600",
  },
  shiftText: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  scheduleActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4359d0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#383838",
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#383838",
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  pickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  pickerButtonActive: {
    backgroundColor: "#4359d0",
    borderColor: "#4359d0",
  },
  pickerButtonText: {
    fontSize: 12,
    color: "#383838",
    fontWeight: "600",
  },
  pickerButtonTextActive: {
    color: "#FFF",
  },
  shiftContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  shiftButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  shiftButtonActive: {
    backgroundColor: "#4359d0",
    borderColor: "#4359d0",
  },
  shiftButtonText: {
    fontSize: 12,
    color: "#383838",
    fontWeight: "600",
  },
  shiftButtonTextActive: {
    color: "#FFF",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: "#F9F9F9",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#383838",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4359d0",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default ScheduleSetupScreen;
