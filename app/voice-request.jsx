import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const VoiceRequestPage = ({ setPage }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setPage('patientDashboard')}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Voice Request</Text>
      </View>

      <TouchableOpacity style={styles.voiceInputContainer} onPress={() => console.log('Voice command initiated')}>
        <Feather name="mic" size={60} color="#6759FF" />
        <Text style={styles.voiceInputText}>Tap to Speak to record</Text>
      </TouchableOpacity>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('home')}>
          <Feather name="home" size={24} color="#BDBDBD" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('voiceRequestPage')}>
          <Feather name="mic" size={24} color="#6759FF" />
          <Text style={styles.navText}>Voice Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('profilePage')}>
          <Feather name="user" size={24} color="#BDBDBD" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('services')}>
          <Feather name="th-large" size={24} color="#BDBDBD" />
          <Text style={styles.navText}>Services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'space-between', // To push bottom navigation to the bottom
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  voiceInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1, // Take up remaining space
    marginBottom: 20, // Space above bottom navigation
  },
  voiceInputText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 5,
  },
});

export default VoiceRequestPage;
