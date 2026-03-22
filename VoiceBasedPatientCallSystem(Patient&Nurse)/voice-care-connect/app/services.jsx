import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

const API_HOST = Platform.OS === 'web' ? 'localhost' : '10.136.178.148';
const REQUEST_API = `http://${API_HOST}:5000/api/patientRequests`;

const ServicesPage = ({ setPage, user }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const patientName = user?.user?.name || user?.name || 'Guest';

  const fetchRecentInteractions = async () => {
    try {
      if (!patientName || patientName === 'Guest') return;
      const response = await axios.get(`${REQUEST_API}/history/${encodeURIComponent(patientName)}`);
      const items = (response.data || []).slice(0, 5).map((item) => ({
        text: item.requestText,
        time: new Date(item.timestamp).toLocaleString('en-US', {
          weekday: 'short',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      }));
      setRecentInteractions(items);
    } catch (error) {
      console.log('Failed to load interactions:', error.message);
    }
  };

  useEffect(() => {
    fetchRecentInteractions();
  }, [patientName]);

  const sendRequestToNurse = async (requestText) => {
    const text = requestText.trim();
    if (!text) {
      Alert.alert('Missing request', 'Please enter your request.');
      return;
    }
    if (!patientName || patientName === 'Guest') {
      Alert.alert('Login required', 'Please login as a patient first.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${REQUEST_API}/submit`, { patientName, requestText: text });
      setCustomMessage('');
      Alert.alert('Request sent', 'Your message has been sent to the nurse.');
      await fetchRecentInteractions();
    } catch (error) {
      Alert.alert('Request failed', 'Unable to send request to nurse. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setPage('patientDashboard')}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Services</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Hello, {patientName}</Text>
        <Text style={styles.subtitle}>Choose a service to interact with a nurse</Text>

        <View style={styles.quickActionsWrap}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => sendRequestToNurse('Nurse, please come to my room for assistance.')}>
            <Feather name="bell" size={18} color="#6759FF" />
            <Text style={styles.quickActionText}>Call Nurse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => sendRequestToNurse('I need help with my medication schedule.')}>
            <Feather name="activity" size={18} color="#6759FF" />
            <Text style={styles.quickActionText}>Medication Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Send Message To Nurse</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your request for the nurse"
            placeholderTextColor="#9CA3AF"
            value={customMessage}
            onChangeText={setCustomMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendMessageButton, submitting && styles.sendMessageButtonDisabled]}
            onPress={() => sendRequestToNurse(customMessage)}
            disabled={submitting}
          >
            <Text style={styles.sendMessageText}>{submitting ? 'Sending...' : 'Send To Nurse'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Recent Nurse Interactions</Text>
          {recentInteractions.length === 0 ? (
            <Text style={styles.emptyHistory}>No interactions yet.</Text>
          ) : (
            recentInteractions.map((item, index) => (
              <View key={`${item.time}-${index}`} style={styles.historyItem}>
                <Text style={styles.historyText}>{item.text}</Text>
                <Text style={styles.historyTime}>{item.time}</Text>
              </View>
            ))
          )}
        </View>

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
          <Feather name="user" size={22} color="#BDBDBD" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setPage('services')}>
          <Feather name="grid" size={22} color="#6759FF" />
          <Text style={[styles.navText, styles.activeNavText]}>Services</Text>
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
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 18,
  },
  quickActionsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    marginLeft: 8,
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 13,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  messageInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#111827',
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  sendMessageButton: {
    backgroundColor: '#6759FF',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  sendMessageButtonDisabled: {
    opacity: 0.6,
  },
  sendMessageText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyHistory: {
    color: '#6B7280',
    fontSize: 13,
  },
  historyItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 8,
  },
  historyText: {
    fontSize: 14,
    color: '#111827',
  },
  historyTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
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

export default ServicesPage;
