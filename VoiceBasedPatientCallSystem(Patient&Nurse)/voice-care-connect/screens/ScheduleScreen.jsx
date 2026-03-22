import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { MaterialCommunityIcons } from "react-native-vector-icons";

const API_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const SHIFTS_URL = `http://${API_HOST}:4000/api/user/getNurseSchedule`;
const UPDATE_SHIFTS_URL = `http://${API_HOST}:4000/api/user/updateNurseSchedule`;

const getSessionValue = async (key) => {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

const ScheduleScreen = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nurseName, setNurseName] = useState("Nurse");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [facility, setFacility] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const storedName = await getSessionValue("nurseName");
      if (storedName) setNurseName(storedName);

      const token = await getSessionValue("JWTToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const shiftsRes = await axios.get(SHIFTS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const shiftsData = shiftsRes.data?.schedules || shiftsRes.data?.shifts || shiftsRes.data || [];
      setShifts(Array.isArray(shiftsData) ? shiftsData : []);
    } catch (error) {
      console.error("Error loading schedule:", error.message);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatShiftDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
  };

  const renderShiftCard = (shift, index) => {
    const shiftDate = formatShiftDate(shift.date);
    const shiftTime = `${shift.startTime || ""}${
      shift.endTime ? " - " + shift.endTime : ""
    }`;
    const location = `${shift.location || ""}${
      shift.facility ? " | " + shift.facility : ""
    }`;

    return (
      <View key={index} style={styles.shiftCard}>
        <View style={styles.shiftHeader}>
          <View style={styles.shiftDateContainer}>
            <MaterialCommunityIcons name="calendar" size={16} color="#4A63E7" />
            <Text style={styles.shiftDate}>{shiftDate}</Text>
          </View>
          <View
            style={[
              styles.shiftStatus,
              { backgroundColor: shift.status === "confirmed" ? "#D4EDDA" : "#FFF3CD" },
            ]}
          >
            <Text
              style={[
                styles.shiftStatusText,
                { color: shift.status === "confirmed" ? "#155724" : "#856404" },
              ]}
            >
              {shift.status || "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.shiftDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{shiftTime}</Text>
          </View>
          {location && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{location}</Text>
            </View>
          )}
          {shift.notes && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="note-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{shift.notes}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const clearForm = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setFacility("");
    setNotes("");
  };

  const handleAddSchedule = async () => {
    const trimmedDate = date.trim();
    const trimmedStart = startTime.trim();
    const trimmedEnd = endTime.trim();
    const trimmedLocation = location.trim();
    const trimmedFacility = facility.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedDate || !trimmedStart || !trimmedEnd) {
      Alert.alert("Missing details", "Date, start time, and end time are required.");
      return;
    }

    try {
      setSaving(true);
      const token = await getSessionValue("JWTToken");
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        setSaving(false);
        return;
      }

      const newShift = {
        date: trimmedDate,
        startTime: trimmedStart,
        endTime: trimmedEnd,
        location: trimmedLocation,
        facility: trimmedFacility,
        notes: trimmedNotes,
        status: "pending",
      };

      const nextSchedules = [newShift, ...shifts];
      await axios.put(
        UPDATE_SHIFTS_URL,
        { schedules: nextSchedules },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShifts(nextSchedules);
      clearForm();
      Alert.alert("Success", "Schedule added successfully.");
    } catch (error) {
      console.error("Error saving schedule:", error.message);
      Alert.alert("Save failed", "Unable to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A63E7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Work Schedule</Text>
        <Text style={styles.subtitle}>{nurseName}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add New Schedule</Text>
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Start (e.g. 07:30)"
            value={startTime}
            onChangeText={setStartTime}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="End (e.g. 16:00)"
            value={endTime}
            onChangeText={setEndTime}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Location (e.g. 4A North)"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Facility (e.g. HCC)"
          value={facility}
          onChangeText={setFacility}
        />
        <TextInput
          style={styles.input}
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule} disabled={saving}>
          <Text style={styles.addButtonText}>{saving ? "Saving..." : "Add Schedule"}</Text>
        </TouchableOpacity>
      </View>

      {shifts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No scheduled shifts</Text>
          <Text style={styles.emptySubtext}>
            Check back later for upcoming assignments
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadScheduleData}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.shiftsContainer}>
          <View style={styles.shiftsHeader}>
            <Text style={styles.shiftsTitle}>
              {shifts.length} Shift{shifts.length !== 1 ? "s" : ""} Scheduled
            </Text>
          </View>
          {shifts.map((shift, index) => renderShiftCard(shift, index))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E2A68",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E2A68",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E3E7F2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    color: "#333",
    backgroundColor: "#FAFBFF",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#4A63E7",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
  shiftsContainer: {
    marginTop: 16,
  },
  shiftsHeader: {
    marginBottom: 12,
  },
  shiftsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  shiftCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  shiftDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A63E7",
    marginLeft: 6,
  },
  shiftStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shiftStatusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  shiftDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  refreshButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#4A63E7",
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ScheduleScreen;
