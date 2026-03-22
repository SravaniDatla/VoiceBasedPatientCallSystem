import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import logo from '../assets/icons/logo.png';
import AccessAccount from './access-account';
import AdminLogin from './admin-login';
import PatientDashboard from './patient-dashboard';
import ProfilePage from './profile-page';
import VoiceRequestPage from './voice-request';
import ServicesPage from './services';
import AppNavigator from "../navigation/AppNavigator";

const APP_HOST = Platform.OS === "web" ? "localhost" : "10.136.178.148";
const ADMIN_LOGIN_URL = `http://${APP_HOST}:3000`;

const roleOptions = [
  { key: 'admin', label: 'Admin Dashboard' },
  { key: 'nurse', label: 'Nurse Dashboard' },
  { key: 'patient', label: 'Patient Dashboard' },
];

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);

  const navigateByRole = (roleKey) => {
    if (roleKey === 'patient') {
      setPage('accessAccount');
      return;
    }

    if (roleKey === 'nurse') {
      setPage('employeeNavigator');
      return;
    }

    if (roleKey === 'admin') {
      setPage('adminLogin');
      return;
    }

    Alert.alert('Select role', 'Please choose Admin, Nurse, or Patient to continue.');
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return (
          <View style={styles.container}>
            <View style={styles.decorCircleTop} />
            <View style={styles.decorCircleBottom} />

            <View style={styles.heroContent}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>Unified Care Portal</Text>
              <Text style={styles.subtitle}>One secure gateway for Admin, Nurse, and Patient dashboards</Text>
            </View>

            <View style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>Choose Dashboard Role</Text>

              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setIsRoleModalVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>Select Dashboard</Text>
                <Feather name="chevron-down" size={22} color="#1E2A68" />
              </TouchableOpacity>
            </View>

            <Modal
              animationType="fade"
              transparent
              visible={isRoleModalVisible}
              onRequestClose={() => setIsRoleModalVisible(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setIsRoleModalVisible(false)}>
                <Pressable style={styles.modalCard} onPress={() => {}}>
                  <Text style={styles.modalTitle}>Select a Role</Text>
                  {roleOptions.map((option) => {
                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={styles.roleOption}
                        onPress={() => {
                          setIsRoleModalVisible(false);
                          navigateByRole(option.key);
                        }}
                      >
                        <Text style={styles.roleOptionText}>
                          {option.label}
                        </Text>
                        <Feather name="arrow-up-right" size={18} color="#1B2D89" />
                      </TouchableOpacity>
                    );
                  })}
                </Pressable>
              </Pressable>
            </Modal>

            <StatusBar style="light" />
          </View>
        );

      case 'accessAccount':
        return <AccessAccount setPage={setPage} setUser={setUser} />;

      case 'adminLogin':
        return <AdminLogin setPage={setPage} adminLoginUrl={ADMIN_LOGIN_URL} />;

      case 'patientDashboard':
        return <PatientDashboard setPage={setPage} user={user} />;

      case 'profilePage':
        return <ProfilePage setPage={setPage} user={user} />;

      case 'voiceRequestPage':
        return <VoiceRequestPage setPage={setPage} />;

      case 'services':
        return <ServicesPage setPage={setPage} user={user} />;

      case 'employeeNavigator': 
        return (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigator />
          </GestureHandlerRootView>
        );

      default:
        return <Text>Page Not Found</Text>;
    }
  };

  return renderPage();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1B4C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 26,
    zIndex: 2,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 8,
  },
  title: {
    color: '#F8FBFF',
    fontSize: 33,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#C6D0FF',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  selectorCard: {
    width: '100%',
    backgroundColor: '#F9FBFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2,
  },
  selectorLabel: {
    color: '#1E2A68',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#CED6F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownButtonText: {
    color: '#1E2A68',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#1B2D89',
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.55,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 13, 36, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E2A68',
    marginBottom: 12,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8FF',
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#FBFCFF',
  },
  roleOptionText: {
    fontSize: 15,
    color: '#1C2559',
    fontWeight: '600',
  },
  decorCircleTop: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: '#3D58E8',
    top: -110,
    right: -90,
    opacity: 0.35,
  },
  decorCircleBottom: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#1AA8CC',
    bottom: -95,
    left: -70,
    opacity: 0.22,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
});