import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { createClient } from '@supabase/supabase-js';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome'; // For hide/show password icon

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // For hide/show password
  const fadeAnim = useMemo(() => new Animated.Value(0), []); // For fade animation

  const { login } = useContext(AuthContext);

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  return (
    <ImageBackground
      source={require('../assets/loginsignupbackground.jpg')} // Replace with your background image
      style={styles.background}
      resizeMode="cover"
    >
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.6)', 'rgba(24, 23, 23, 0.2)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.overlay}>
          {/* Welcome Text */}
          <Animatable.View animation="fadeInDown" duration={1500} style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.loginText}>Login to your account</Text>
          </Animatable.View>

          {/* Email Input */}
          <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              placeholder="EMAIL"
              placeholderTextColor="#999"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.underline} />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </Animatable.View>

          {/* Password Input */}
          <Animatable.View animation="fadeInUp" duration={1500} style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                placeholder="PASSWORD"
                placeholderTextColor="#999"
                style={styles.input}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
            <View style={styles.underline} />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </Animatable.View>

          {/* Remember Me and Forgot Password */}
          <Animatable.View animation="fadeInUp" duration={1500} style={styles.rememberForgotContainer}>
            <TouchableOpacity style={styles.rememberMeContainer}>
              <View style={styles.checkbox} />
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Sign In Button */}
          <Animatable.View animation="fadeInUp" duration={1500} style={styles.buttonContainer}>
            <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInButtonText}>SIGN IN</Text>
              )}
            </TouchableOpacity>
          </Animatable.View>

          {/* OR Divider */}
          <Animatable.View animation="fadeInUp" duration={1500} style={styles.orContainer}>
            <Text style={styles.orText}>OR</Text>
          </Animatable.View>

          {/* Google Sign-In Button */}
          <Animatable.View animation="fadeInUp" duration={1500} style={styles.googleContainer}>
            <GoogleSigninButton
              style={styles.googleButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignIn}
            />
          </Animatable.View>

          {/* Create Account Link */}
          <Animatable.View animation="fadeInUp" duration={1500} style={styles.createAccountContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.createAccountText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </Animatable.View>
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
  gradientOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 3,
    marginRight: 10,
  },
  rememberMeText: {
    fontSize: 14,
    color: '#fff',
  },
  forgotText: {
    fontSize: 14,
    color: '#fff',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  signInButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff6f61',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    marginBottom: 20,
  },
  orText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  googleContainer: {
    width: '100%',
    marginBottom: 20,
  },
  googleButton: {
    width: '100%',
    height: 48,
  },
  createAccountContainer: {
    marginBottom: 20,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6f61',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LoginScreen;