import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const AccessAccount = ({ setPage }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => setPage('home')}>
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Access Account</Text>
        <Text style={styles.subtitle}>Please enter your credentials to access the system</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#BDBDBD" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#BDBDBD"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#BDBDBD" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#BDBDBD"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={() => setPage('patientDashboard')}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton}>
          <Text style={styles.signUpText}>
            Need to create an account? <Text style={styles.signUpLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6759FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  content: {
    width: '100%',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#6759FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButton: {
    alignItems: 'center',
  },
  signUpText: {
    color: 'white',
    fontSize: 14,
  },
  signUpLink: {
    fontWeight: 'bold',
  },
});

export default AccessAccount;
