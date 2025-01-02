import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: '488144373941-m9qpl00hlkl9h3uu7pv2ppp08194qteb.apps.googleusercontent.com',
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Login successful!');

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (dbError) {
        Alert.alert('Error', dbError.message);
      } else {
        navigation.navigate('Profile', { user: userData });
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
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (dbError) {
            Alert.alert('Error', dbError.message);
          } else {
            navigation.navigate('Profile', { user: userData });
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
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Login</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ padding: 10, borderWidth: 1, marginBottom: 20, borderRadius: 5 }}
      />
      <Button title={loading ? 'Loading...' : 'Login'} onPress={handleLogin} />

      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      />

      <Text
        onPress={() => navigation.navigate('ForgotPassword')}
        style={{ marginTop: 10, color: 'blue', textAlign: 'center' }}
      >
        Forgot Password?
      </Text>

      <Text
        onPress={() => navigation.navigate('SignUp')}
        style={{ marginTop: 10, color: 'blue', textAlign: 'center' }}
      >
        Don’t have an account? Sign Up
      </Text>
    </View>
  );
};

export default LoginScreen;
