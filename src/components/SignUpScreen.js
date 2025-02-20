import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/login-background.jpg')} // Replace with your background image
      style={styles.background}
      resizeMode="cover"
    >
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.2)']}
        style={styles.gradientOverlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.overlay}>
            <Animatable.View animation="fadeInDown" duration={1500} style={styles.titleContainer}>
              <Text style={styles.title}>SIGN UP</Text>
              <Text style={styles.subtitle}>Let's Register You</Text>
            </Animatable.View>

            {/* First Name Input */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </Animatable.View>

            {/* Last Name Input */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </Animatable.View>

            {/* Email Input */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </Animatable.View>

            {/* Phone Input */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number (+91)"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </Animatable.View>

            {/* Date of Birth Input */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={[styles.dateText, !dob && { color: '#999' }]}>
                  {dob ? dob.toLocaleDateString() : 'Date of Birth'}
                </Text>
              </TouchableOpacity>
              <View style={styles.underline} />
              {showDatePicker && (
                <DateTimePicker
                  value={dob || new Date()} // Use current date if dob is null
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </Animatable.View>

            {/* Password Input */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry={!passwordVisible}
                  placeholderTextColor="#999"
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={passwordVisible ? 'eye-slash' : 'eye'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.underline} />
            </Animatable.View>

            {/* Password Strength Meter */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.strengthMeterContainer}>
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
            </Animatable.View>

            {/* Terms and Conditions */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted && <Text style={styles.checkboxText}>✓</Text>}
                </View>
                <Text style={styles.termsText}>I accept the terms and conditions</Text>
              </TouchableOpacity>
            </Animatable.View>

            {/* Sign Up Button */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signUpButtonText}>SIGN UP</Text>
                )}
              </TouchableOpacity>
            </Animatable.View>

            {/* Login Link */}
            <Animatable.View animation="fadeInUp" duration={1500} style={styles.linkContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Already have an account?</Text>
              </TouchableOpacity>
            </Animatable.View>
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
  gradientOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 12, // Ensure placeholder text is vertically centered
  },
  dateInput: {
    width: '100%',
    height: 50,
    justifyContent: 'center', // Center the text vertically
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
  },
  underline: {
    height: 1,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
  },
  strengthMeterContainer: {
    width: '100%',
    marginBottom: 20,
  },
  strengthMeter: {
    height: 5,
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 5,
  },
  termsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff6f61',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SignUpScreen;