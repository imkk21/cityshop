import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Import DateTimePickerModal

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ShopkeeperSignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(null); // Change to null initially
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [shopCategory, setShopCategory] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // State for date picker visibility
  const navigation = useNavigation();

  // Animation value for button press
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Handle button press animation
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Automatically append the domain to the email
  const handleEmailChange = (text) => {
    const domain = '@cityshop.ac.in';
    if (text.endsWith(domain)) {
      setEmailPrefix(text.slice(0, -domain.length));
    } else {
      setEmailPrefix(text);
    }
  };

  const getFullEmail = () => {
    return `${emailPrefix}@cityshop.ac.in`;
  };

  // Handle date change from DateTimePickerModal
  const handleDateChange = (selectedDate) => {
    setShowDatePicker(false); // Hide the date picker
    if (selectedDate) {
      setDob(selectedDate); // Set the selected date
    }
  };

  const handleSignUp = async () => {
    if (!termsAccepted) {
      Alert.alert('Error', 'You must accept the terms and conditions.');
      return;
    }

    const email = getFullEmail();
    if (!emailPrefix || !email.includes('@cityshop.ac.in')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;

      const { error: userError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          dob: dob ? dob.toISOString().split('T')[0] : null, // Format date as YYYY-MM-DD
          gender,
          country,
          state,
          city,
          shop_name: shopName,
          shop_address: shopAddress,
          gst_number: gstNumber,
          shop_category: shopCategory,
          role: 'shopkeeper',
          terms_accepted: termsAccepted,
          created_at: new Date(),
        },
      ]);
      if (userError) throw userError;

      Alert.alert('Success', 'Shopkeeper account created successfully!');
      navigation.navigate('ShopkeeperLogin');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/download.jpeg')} // Replace with your background image
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
            {/* Welcome Text */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Create Shopkeeper Account</Text>
              <Text style={styles.loginText}>Let's Register Your Shop</Text>
            </View>

            {/* First Name */}
            <View style={styles.inputContainer}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <View style={styles.emailInputContainer}>
                <TextInput
                  value={emailPrefix}
                  onChangeText={handleEmailChange}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  style={styles.emailInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.emailDomain}>@cityshop.ac.in</Text>
              </View>
              <View style={styles.underline} />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.underline} />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                placeholderTextColor="#999"
                style={styles.input}
                keyboardType="phone-pad"
              />
              <View style={styles.underline} />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={[styles.dateText, !dob && { color: '#999' }]}>
                  {dob ? dob.toLocaleDateString() : 'Date of Birth'}
                </Text>
              </TouchableOpacity>
              <View style={styles.underline} />
            </View>

            {/* Gender */}
            <View style={styles.inputContainer}>
              <TextInput
                value={gender}
                onChangeText={setGender}
                placeholder="Gender"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* Country */}
            <View style={styles.inputContainer}>
              <TextInput
                value={country}
                onChangeText={setCountry}
                placeholder="Country"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* State */}
            <View style={styles.inputContainer}>
              <TextInput
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* City */}
            <View style={styles.inputContainer}>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* Shop Name */}
            <View style={styles.inputContainer}>
              <TextInput
                value={shopName}
                onChangeText={setShopName}
                placeholder="Shop Name"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* Shop Address */}
            <View style={styles.inputContainer}>
              <TextInput
                value={shopAddress}
                onChangeText={setShopAddress}
                placeholder="Shop Address"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* GST Number */}
            <View style={styles.inputContainer}>
              <TextInput
                value={gstNumber}
                onChangeText={setGstNumber}
                placeholder="GST Number"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* Shop Category */}
            <View style={styles.inputContainer}>
              <TextInput
                value={shopCategory}
                onChangeText={setShopCategory}
                placeholder="Shop Category"
                placeholderTextColor="#999"
                style={styles.input}
              />
              <View style={styles.underline} />
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <Text style={styles.termsText}>
                {termsAccepted ? '✅' : '⬜'} Accept Terms & Conditions
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
            >
              <Animated.View
                style={[
                  styles.signUpButton,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity onPress={() => navigation.navigate('ShopkeeperLogin')}>
              <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
      />
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
    padding: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  loginText: {
    fontSize: 16,
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
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#fff',
  },
  emailDomain: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 5,
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
  dateInput: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    fontSize: 16,
    color: '#fff',
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff6f61',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ShopkeeperSignUp;