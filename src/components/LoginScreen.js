/* eslint-disable react/self-closing-comp */
/* eslint-disable curly */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import React, { useState, useEffect, useContext } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createClient } from '@supabase/supabase-js';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { login } = useContext(AuthContext);

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: '488144373941-m9qpl00hlkl9h3uu7pv2ppp08194qteb.apps.googleusercontent.com',
    });
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      if (data && data.user) {
        login(data.user);
        navigation.replace('AppNavigator');
      } else {
        Alert.alert('Error', 'No user data found');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;

      if (idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (error) {
          console.error('Supabase sign-in error:', error.message);
          Alert.alert('Error', 'An error occurred during Google sign-in.');
        } else {
          if (data && data.user) {
            login(data.user);
            navigation.replace('AppNavigator');
          } else {
            Alert.alert('Error', 'No user data found');
          }
        }
      } else {
        throw new Error('No ID token returned');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error('An error occurred during Google sign-in:', error.message);
        Alert.alert('Error', 'An error occurred during Google sign-in.');
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <ImageBackground
      source={require('../assets/login-background.png')} // Add your background image
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(207, 198, 198, 0.6)', 'rgba(100, 94, 94, 0.8)']}
        style={styles.overlay}
      >
        <View style={[styles.container, themeStyles.container]}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          </TouchableOpacity>
          <Text style={[styles.title, themeStyles.text]}>LOGIN</Text>
          <Text style={[styles.subtitle, themeStyles.text]}>Welcome Back</Text>

          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#36454F"
            style={[styles.input, themeStyles.input]}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#36454F"
            style={[styles.input, themeStyles.input]}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.orText, themeStyles.text]}>OR</Text>

          <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Not a member? Sign up</Text>
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
    color:'black',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#89CFF0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth :1,
    borderColor:'white',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    marginBottom: 20,
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 18,
    marginTop: 10,
    fontWeight : 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  themeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(33, 32, 32, 0.1)',
  },
  text: {
    color: 'black',
  },
  input: {
    borderColor: '#444',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'black',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(14, 13, 13, 0.8)',
  },
  text: {
    color: '#fff',
  },
  input: {
    borderColor: '#666',
    backgroundColor: 'rgba(138, 134, 134, 0.4)',
    color: '#fff',
  },
});

export default LoginScreen;