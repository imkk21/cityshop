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
  Dimensions,
  StyleSheet,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ShopkeeperSignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
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
          dob,
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
    <LinearGradient
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Shopkeeper Sign Up</Text>

        {/* First Name */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="#999"
        />

        {/* Last Name */}
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="#999"
        />

        {/* Email */}
        <View style={styles.emailContainer}>
          <TextInput
            style={styles.emailInput}
            placeholder="Email"
            value={emailPrefix}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <Text style={styles.emailDomain}>@cityshop.ac.in</Text>
        </View>

        {/* Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Icon
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />

        {/* Date of Birth */}
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          value={dob}
          onChangeText={setDob}
          placeholderTextColor="#999"
        />

        {/* Gender */}
        <TextInput
          style={styles.input}
          placeholder="Gender"
          value={gender}
          onChangeText={setGender}
          placeholderTextColor="#999"
        />

        {/* Country */}
        <TextInput
          style={styles.input}
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
          placeholderTextColor="#999"
        />

        {/* State */}
        <TextInput
          style={styles.input}
          placeholder="State"
          value={state}
          onChangeText={setState}
          placeholderTextColor="#999"
        />

        {/* City */}
        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
          placeholderTextColor="#999"
        />

        {/* Shop Name */}
        <TextInput
          style={styles.input}
          placeholder="Shop Name"
          value={shopName}
          onChangeText={setShopName}
          placeholderTextColor="#999"
        />

        {/* Shop Address */}
        <TextInput
          style={styles.input}
          placeholder="Shop Address"
          value={shopAddress}
          onChangeText={setShopAddress}
          placeholderTextColor="#999"
        />

        {/* GST Number */}
        <TextInput
          style={styles.input}
          placeholder="GST Number"
          value={gstNumber}
          onChangeText={setGstNumber}
          placeholderTextColor="#999"
        />

        {/* Shop Category */}
        <TextInput
          style={styles.input}
          placeholder="Shop Category"
          value={shopCategory}
          onChangeText={setShopCategory}
          placeholderTextColor="#999"
        />

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
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  emailInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  emailDomain: {
    fontSize: 16,
    color: '#666',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
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
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ShopkeeperSignUp;