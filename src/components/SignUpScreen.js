import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { Picker } from '@react-native-picker/picker';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!firstName || !lastName || !email || !phone || !dob || !gender || !country || !state || !city) {
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
    const phoneRegex = /^[+91]{3}[0-9]{10}$/;  // +91 format for phone validation
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number with country code +91.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

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
        dob,
        gender,
        country,
        state,
        city,
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Sign Up</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
        style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
        style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone Number (+91)"
        keyboardType="phone-pad"
        style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
      />
      <TextInput
        value={dob}
        onChangeText={setDob}
        placeholder="Date of Birth (YYYY-MM-DD)"
        style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
      />
      <Picker
        selectedValue={gender}
        onValueChange={(value) => setGender(value)}
        style={{ height: 50, marginBottom: 10 }}
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
        <Picker.Item label="Other" value="other" />
      </Picker>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
      />
      <Picker
        selectedValue={country}
        onValueChange={(value) => setCountry(value)}
        style={{ height: 50, marginBottom: 10 }}
      >
        <Picker.Item label="Select Country" value="" />
        <Picker.Item label="USA" value="usa" />
        <Picker.Item label="India" value="india" />
        <Picker.Item label="Canada" value="canada" />
      </Picker>
      <Picker
        selectedValue={state}
        onValueChange={(value) => setState(value)}
        style={{ height: 50, marginBottom: 10 }}
        enabled={!!country}
      >
        <Picker.Item label="Select State" value="" />
        <Picker.Item label="California" value="california" />
        <Picker.Item label="Texas" value="texas" />
      </Picker>
      <Picker
        selectedValue={city}
        onValueChange={(value) => setCity(value)}
        style={{ height: 50, marginBottom: 10 }}
        enabled={!!state}
      >
        <Picker.Item label="Select City" value="" />
        <Picker.Item label="Los Angeles" value="losangeles" />
        <Picker.Item label="Dallas" value="dallas" />
      </Picker>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View
          style={{
            height: 20,
            width: 20,
            borderWidth: 1,
            borderColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
            backgroundColor: termsAccepted ? 'black' : 'white',
          }}
        >
          {termsAccepted && <View style={{ height: 12, width: 12, backgroundColor: 'white' }} />}
        </View>
        <Text>I accept the terms and conditions</Text>
      </TouchableOpacity>
      <Button title={loading ? 'Loading...' : 'Sign Up'} onPress={handleSignUp} />
      <Text
        onPress={() => navigation.navigate('Login')}
        style={{ marginTop: 10, color: 'blue', textAlign: 'center' }}
      >
        Already have an account? Log in
      </Text>
    </ScrollView>
  );
};

export default SignUpScreen;
