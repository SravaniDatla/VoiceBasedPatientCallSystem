import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ProfilePage = ({ setPage, user }) => {
  const patient = user?.user || user || {};

  const patientName = patient?.name || 'Guest';
  const patientDob = patient?.dob || 'DOB not available';
  const patientId = patient?._id || 'ID not available';
  const room = patient?.room || patient?.roomNo || 'Room not assigned';
  const phone = patient?.phone || 'Phone not available';

  const renderDetailRow = (icon, label, value) => (
    <View style={styles.detailRow}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={16} color="#6759FF" />
      </View>
      <View style={styles.detailTextWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setPage('patientDashboard')}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Patient Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{patientName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.nameText}>{patientName}</Text>
          <Text style={styles.roleText}>Patient</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          {renderDetailRow('calendar', 'Date of Birth', patientDob)}
          {renderDetailRow('user', 'Patient ID', patientId)}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Hospital Information</Text>
          {renderDetailRow('home', 'Room', room)}
          {renderDetailRow('phone', 'Phone', phone)}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => setPage('home')}>
          <Feather name="log-out" size={20} color="#6759FF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('patientDashboard')}>
          <Feather name="home" size={22} color="#BDBDBD" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('voiceRequestPage')}>
          <Feather name="mic" size={22} color="#BDBDBD" />
          <Text style={styles.navText}>Voice Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('profilePage')}>
          <Feather name="user" size={22} color="#6759FF" />
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('services')}>
          <Feather name="grid" size={22} color="#BDBDBD" />
          <Text style={styles.navText}>Services</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#6759FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  roleText: {
    fontSize: 15,
    color: '#6B7280',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  logoutButtonText: {
    color: '#6759FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 4,
  },
  activeNavText: {
    color: '#6759FF',
  },
});

export default ProfilePage;
