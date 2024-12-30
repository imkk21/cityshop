import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ProfileScreen = ({ route }) => {
  const { user } = route.params; // Retrieve the passed user data
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user && user.id) {
        // Fetch user profile data from 'users' table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          Alert.alert('Error', error.message);
          setLoading(false);
        } else {
          setProfileData(data);
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <Text>No profile data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.text}>First Name: {profileData.first_name}</Text>
      <Text style={styles.text}>Last Name: {profileData.last_name}</Text>
      <Text style={styles.text}>Email: {profileData.email}</Text>
      <Text style={styles.text}>Phone: {profileData.phone}</Text>
      <Text style={styles.text}>Date of Birth: {profileData.dob}</Text>
      <Text style={styles.text}>Gender: {profileData.gender}</Text>
      <Text style={styles.text}>Country: {profileData.country}</Text>
      <Text style={styles.text}>State: {profileData.state}</Text>
      <Text style={styles.text}>City: {profileData.city}</Text>
      <Text style={styles.text}>Terms Accepted: {profileData.terms_accepted ? 'Yes' : 'No'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default ProfileScreen;
