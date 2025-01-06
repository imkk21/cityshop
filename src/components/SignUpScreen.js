/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker'; // For DOB calendar
import Icon from 'react-native-vector-icons/FontAwesome'; // For eye icon
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(null); // DOB as a Date object (initially null)
  const [showDatePicker, setShowDatePicker] = useState(false); // For DOB calendar
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getPasswordStrength = (password) => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  };

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    if (!firstName || !lastName || !email || !phone || !dob) {
      Alert.alert('Error', 'Please fill in all the fields.');
      return false;
    }

    if (!termsAccepted) {
      Alert.alert('Error', 'You must accept the terms and conditions to proceed.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }

    const phoneRegex = /^[+91]{3}[0-9]{10}$/; // +91 format for phone validation
    if (phone.length !== 13 || !phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number with country code +91.');
      return false;
    }

    if (passwordStrength === 1) {
      Alert.alert('Error', 'Password is too weak. It should be at least 6 characters long.');
      return false;
    }

    const today = new Date();
    if (dob > today) {
      Alert.alert('Error', 'Date of birth cannot be in the future.');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Check if the phone number already exists in the database
    const { data: existingUser, error: phoneError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (phoneError && phoneError.code !== 'PGRST116') {
      Alert.alert('Error', phoneError.message);
      setLoading(false);
      return;
    }

    if (existingUser) {
      Alert.alert('Error', 'Phone number is already registered.');
      setLoading(false);
      return;
    }

    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id, // refer to the user id from supabase auth
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        dob: dob.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
        terms_accepted: termsAccepted,
      }]);

    setLoading(false);

    if (dbError) {
      Alert.alert('Error', dbError.message);
    } else {
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login'); // Navigate to Login after successful sign-up
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/login-background.png')} // Add your background image
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(103,99,99, 0.6)', 'rgba(128,118,118, 0.8)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[styles.container, themeStyles.container]}>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            </TouchableOpacity>

            <Text style={[styles.title, themeStyles.text]}>Sign Up</Text>
            <Text style={[styles.subtitle, themeStyles.text]}>Let's Register You</Text>

            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor="#36454F"
              style={[styles.input, themeStyles.input]}
            />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#36454F"
              style={[styles.input, themeStyles.input]}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="#36454F"
              style={[styles.input, themeStyles.input]}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number (+91)"
              keyboardType="phone-pad"
              placeholderTextColor="#36454F"
              style={[styles.input, themeStyles.input]}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, themeStyles.input, { justifyContent: 'center' }]}
            >
              <Text style={{ color: dob ? '#fff' : '#36454F' }}>
                {dob ? dob.toLocaleDateString() : 'Date of Birth'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dob || new Date()} // Use current date if dob is null
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                }}
                placeholder="Password"
                secureTextEntry={!passwordVisible}
                placeholderTextColor="#36454F"
                style={[styles.input, themeStyles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={passwordVisible ? 'eye-slash' : 'eye'}
                  size={20}
                  color="#36454F"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.strengthMeter}>
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: `${(passwordStrength / 3) * 100}%`,
                    backgroundColor:
                      passwordStrength === 1
                        ? 'red'
                        : passwordStrength === 2
                        ? 'orange'
                        : 'green',
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Text style={styles.checkboxText}>✓</Text>}
              </View>
              <Text style={[styles.termsText, themeStyles.text]}>I accept the terms and conditions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'rgba(39, 37, 37, 0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
  fontSize: 18,
  marginBottom: 30,
},
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  strengthMeter: {
    height: 5,
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
  },
  checkboxText: {
    color: '#fff',
  },
  termsText: {
    fontSize: 16
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#89CFF0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    textAlign: 'center',
  },
  themeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  themeButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(33, 32, 32, 0.1',
  },
  text: {
    color: 'black',
  },
  input: {
    borderColor: '#444',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#000000',
  },
  placeholderText: {
    color: '#999',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  text: {
    color: '#fff',
  },
  input: {
    borderColor: '#666',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: '#fff',
  },
  placeholderText: {
    color: '#999',
  },
});
export default SignUpScreen;
