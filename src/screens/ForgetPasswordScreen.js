import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
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
      // Step 1: Verify if the email exists in the `auth.users` table
      const { data, error: emailError } = await supabase
        .from('users') // Use the `auth.users` view in Supabase
        .select('id') // Select only the ID to check if the email exists
        .eq('email', email)
        .single();

      if (emailError || !data) {
        setLoading(false);
        Alert.alert('Error', 'This email is not registered.');
        return;
      }

      // Step 2: If email exists, proceed with password reset
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
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Forgot Password</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        style={{ padding: 10, borderWidth: 1, marginBottom: 20, borderRadius: 5 }}
      />
      <Button title={loading ? 'Loading...' : 'Reset Password'} onPress={handlePasswordReset} />
    </View>
  );
};

export default ForgotPasswordScreen;
