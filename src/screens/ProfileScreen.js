import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import supabase from '../utils/supabase';
import { getMimeType } from '../utils/imageUtils';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Icon library
import Toast from 'react-native-toast-message'; // Import Toast



const ProfileScreen = () => {
  const route = useRoute();
  const { user } = route.params || {};
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  // Fetch user details from the `users` table
  const fetchUserDetails = useCallback(async () => {
    if (!user) return;

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

  // getMimeType is now imported from '../utils/imageUtils'


  // Handle image upload
  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        Alert.alert('No image selected');
        return;
      }

      const imageUri = result.assets[0].uri;
      const imageName = `profile_${user.id}_${Date.now()}.jpg`; // Unique filename
      const imageType = getMimeType(imageName); // Dynamically detect MIME type

      setUploading(true);

      // Upload image to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(imageName, { uri: imageUri, type: imageType, name: imageName });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(imageName);

      console.log('Image URL:', urlData.publicUrl);

      // Update user profile with the new image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state with the new image URL
      setUserDetails((prev) => ({ ...prev, profile_photo_url: urlData.publicUrl }));
      Toast.show({ type: 'success', text1: 'Profile picture updated successfully!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({ type: 'error', text1: 'Failed to upload profile picture.' });
    } finally {
      setUploading(false);
    }
  };

  // Handle deleting profile image
  const handleDeleteImage = async () => {
    try {
      if (!userDetails?.profile_photo_url) return;

      // Extract the image name from the URL
      const imageUrl = userDetails.profile_photo_url;
      const imageName = imageUrl.split('/').pop();

      // Delete the image from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([imageName]);

      if (deleteError) throw deleteError;

      // Update the user's profile to remove the image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setUserDetails((prev) => ({ ...prev, profile_photo_url: null }));
      Toast.show({ type: 'success', text1: 'Profile picture deleted successfully!' });
    } catch (error) {
      console.error('Error deleting image:', error);
      Toast.show({ type: 'error', text1: 'Failed to delete profile picture.' });
    }
  };

  // Handle editing user details
  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  // Handle saving edited user details
  const handleSave = async (field) => {
    if (!userDetails) return;

    const updatedDetails = { ...userDetails, [field]: tempValue };
    setUserDetails(updatedDetails);

    const { error } = await supabase
      .from('users')
      .update({ [field]: tempValue })
      .eq('id', user.id);

    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to update profile.' });
      console.error('Error updating profile:', error);
    } else {
      Toast.show({ type: 'success', text1: 'Profile updated successfully!' });
    }

    setEditingField(null);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  // Render profile picture and upload/delete buttons
  const renderProfilePicture = () => {
    return (
      <View style={styles.profilePictureContainer}>
        {userDetails?.profile_photo_url ? (
          <Image source={{ uri: userDetails.profile_photo_url }} style={styles.profileImage} />
        ) : (
          <Text style={styles.noImageText}>No profile picture</Text>
        )}
        <View style={styles.imageActionButtons}>
          <TouchableOpacity onPress={handleImageUpload} style={styles.uploadButton} disabled={uploading}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
          {userDetails?.profile_photo_url && (
            <TouchableOpacity onPress={handleDeleteImage} style={styles.deleteButton}>
              <Icon name="delete" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render user details with edit options
  const renderUserDetails = () => {
    if (!userDetails) return null;

    const fields = [
      { label: 'First Name', key: 'first_name' },
      { label: 'Last Name', key: 'last_name' },
      { label: 'Email', key: 'email', editable: false }, // Email is not editable
      { label: 'Phone', key: 'phone' },
      { label: 'Date of Birth', key: 'dob' },
      { label: 'Gender', key: 'gender' },
      { label: 'Country', key: 'country' },
      { label: 'State', key: 'state' },
      { label: 'City', key: 'city' },
    ];

    return (
      <View style={styles.userDetailsContainer}>
        {fields.map((field) => (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            {editingField === field.key ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={tempValue}
                  onChangeText={setTempValue}
                  style={styles.input}
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleSave(field.key)} style={styles.saveButton}>
                  <Icon name="save" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editContainer}>
                <Text style={styles.value}>{userDetails[field.key] || 'N/A'}</Text>
                {field.editable !== false && (
                  <TouchableOpacity onPress={() => handleEdit(field.key, userDetails[field.key])} style={styles.editButton}>
                    <Icon name="edit" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Edit Profile</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <View style={styles.profileInfo}>
                {/* Profile Picture Section */}
                {renderProfilePicture()}

                {/* User Details Section */}
                {renderUserDetails()}
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  imageActionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 20,
  },
  userDetailsContainer: {
    marginTop: 20,
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
  saveButton: {
    backgroundColor: '#28a745',
    padding: 5,
    borderRadius: 5,
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