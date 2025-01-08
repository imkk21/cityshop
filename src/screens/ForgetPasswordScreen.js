/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: emailError } = await supabase
        .from('users') // Check if the email exists in the database
        .select('id')
        .eq('email', email)
        .single();

      if (emailError || !data) {
        setLoading(false);
        Alert.alert('Error', 'This email is not registered.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Password reset email sent. Please check your inbox.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/login-background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(207, 198, 198, 0.6)', 'rgba(100, 94, 94, 0.8)']}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>FORGOT PASSWORD</Text>
          <Text style={styles.subtitle}>Reset Your Password</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#36454F"
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  container: {
    backgroundColor: 'rgba(66, 65, 65, 0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: 'black',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    borderColor: '#444',
    backgroundColor: 'white',
    color: 'black',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#89CFF0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ForgotPasswordScreen;
