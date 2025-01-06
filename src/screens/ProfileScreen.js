import React, { useState, useEffect, useCallback, useContext } from 'react';
import {View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ProfileScreen = () => {
  const route = useRoute();
  const { user } = route.params || {};
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const fetchUserDetails = useCallback(async () => {
    if (!user) {return;}

    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user details:', error);
    } else {
      setUserDetails(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    }
  }, [user, fetchUserDetails]);

  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = async (field) => {
    if (!userDetails) {return;}


    const updatedDetails = { ...userDetails, [field]: tempValue };
    setUserDetails(updatedDetails);

    const { error } = await supabase
      .from('users')
      .update({ [field]: tempValue })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } else {
      Alert.alert('Success', 'Profile updated successfully!');
    }

    setEditingField(null);
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (!user) {
    return (
      <ImageBackground
        source={require('../assets/login-background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>No user data available</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/login-background.png')} // Use the same background image
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.8)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Edit Profile</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <View style={styles.profileInfo}>
                {/* First Name */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>First Name</Text>
                  {editingField === 'first_name' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('first_name')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.first_name || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('first_name', userDetails?.first_name)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Last Name */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Last Name</Text>
                  {editingField === 'last_name' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('last_name')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.last_name || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('last_name', userDetails?.last_name)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Email */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{userDetails?.email || 'N/A'}</Text>
                </View>

                {/* Phone */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Phone</Text>
                  {editingField === 'phone' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('phone')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.phone || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('phone', userDetails?.phone)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Date of Birth */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Date of Birth</Text>
                  {editingField === 'dob' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('dob')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.dob || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('dob', userDetails?.dob)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Gender */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Gender</Text>
                  {editingField === 'gender' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('gender')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.gender || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('gender', userDetails?.gender)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Country */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Country</Text>
                  {editingField === 'country' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('country')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.country || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('country', userDetails?.country)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* State */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>State</Text>
                  {editingField === 'state' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('state')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.state || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('state', userDetails?.state)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* City */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>City</Text>
                  {editingField === 'city' ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={styles.input}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleSave('city')} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editContainer}>
                      <Text style={styles.value}>{userDetails?.city || 'N/A'}</Text>
                      <TouchableOpacity onPress={() => handleEdit('city', userDetails?.city)} style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Logout Button */}
                <TouchableOpacity onPress={handleLogout} style={styles.button}>
                  <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  profileInfo: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  value: {
    fontSize: 14,
    marginBottom: 10,
    color: '#fff',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    borderColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 5,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
