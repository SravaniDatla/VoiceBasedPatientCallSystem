import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import logo from '../assets/icons/logo.png';
import PatientDashboard from './patient-dashboard';
import AccessAccount from './access-account';
import ProfilePage from './profile-page'; // Import ProfilePage
import VoiceRequestPage from './voice-request'; // Import VoiceRequestPage

export default function App() {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'home':
        return (
          <View style={styles.container}>
            <View style={styles.content}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>VoiceCare Connect</Text>
              <Text style={styles.subtitle}>Welcome to the Voice-Based Patient</Text>
              <Text style={styles.subtitle}>Call System</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => setPage('accessAccount')}>
                <Text style={styles.buttonText}>I am a Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>I am an Employee/Nurse</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
            </View>
            <StatusBar style="light" />
          </View>
        );
      case 'accessAccount':
        return <AccessAccount setPage={setPage} />;
      case 'patientDashboard':
        return <PatientDashboard setPage={setPage} />;
      case 'profilePage':
        return <ProfilePage setPage={setPage} />; // Pass setPage prop
      case 'voiceRequestPage': // Add case for VoiceRequestPage
        return <VoiceRequestPage setPage={setPage} />; // Pass setPage prop
      default:
        return <Text>Page Not Found</Text>;
    }
  };

  return renderPage();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6759FF', // Purple background
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the top
    paddingTop: 100, // Add padding to the top to push content down
  },
  content: {
    alignItems: 'center',
    marginBottom: 80, // Space between content and buttons
  },
  logo: {
    width: 100, // Adjust logo size as needed
    height: 100,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#6759FF', // Purple text for buttons
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute', // Position footer at the bottom
    bottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
});
