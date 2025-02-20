import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ShopkeeperLogin = () => {
  const { login } = useContext(AuthContext);
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    const email = getFullEmail();
    if (!emailPrefix || !email.includes('@cityshop.ac.in')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        throw userError;
      }

      if (userData.role !== 'shopkeeper') {
        throw new Error('You are not authorized as a shopkeeper.');
      }

      // Set the user in AuthContext
      login(userData);

      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('AppNavigatorShopkeeper');
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
        <View style={styles.overlay}>
          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome Back, Shopkeeper</Text>
            <Text style={styles.loginText}>Login to your shopkeeper account</Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.emailInputContainer}>
              <TextInput
                value={emailPrefix}
                onChangeText={handleEmailChange}
                placeholder="EMAIL"
                placeholderTextColor="#999"
                style={styles.emailInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.emailDomain}>@cityshop.ac.in</Text>
            </View>
            <View style={styles.underline} />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="PASSWORD"
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


          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
          >
            <Animated.View
              style={[
                styles.loginButton,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>SIGN IN</Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Create Account Link */}
          <TouchableOpacity onPress={() => navigation.navigate('ShopkeeperSignUp')}>
            <Text style={styles.createAccountText}>Don't have an account? Sign up</Text>
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
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
  },
  forgotText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff6f61',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ShopkeeperLogin;