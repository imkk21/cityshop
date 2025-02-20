import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ProfileField = ({ label, value, editable, onEdit }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
    {editable && (
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Icon name="edit" size={20} color="#fff" />
      </TouchableOpacity>
    )}
  </View>
);

const ShopkeeperProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const navigation = useNavigation();

  const fetchUserDetails = useCallback(async () => {
    if (!user) {
      Alert.alert('Access Denied', 'You must be logged in.');
      navigation.replace('Login');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      if (error) throw error;
      setUserDetails(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  }, [user, navigation]);

  useEffect(() => {
    if (user) fetchUserDetails();
  }, [user, fetchUserDetails]);

  const getMimeType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        Alert.alert('No image selected');
        return;
      }

      const imageUri = result.assets[0].uri;
      const imageName = `profile_${user.id}_${Date.now()}.jpg`;
      const imageType = getMimeType(imageName);

      setUploading(true);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(imageName, { uri: imageUri, type: imageType, name: imageName });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(imageName);

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setUserDetails((prev) => ({ ...prev, profile_photo_url: urlData.publicUrl }));
      Toast.show({ type: 'success', text1: 'Profile picture updated successfully!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({ type: 'error', text1: 'Failed to upload profile picture.' });
    } finally {
      setUploading(false);
    }
  };

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

  const handleEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = async () => {
    if (!editingField || !userDetails) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ [editingField]: tempValue })
        .eq('email', user.email);
      if (error) throw error;
      setUserDetails({ ...userDetails, [editingField]: tempValue });
      setEditingField(null);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Update failed' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('RoleSelection');
  };

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <LottieView source={require('../assets/animations/loading.json')} autoPlay loop style={styles.loadingAnimation} />
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>Shopkeeper Profile</Text>
            {renderProfilePicture()}
            {[
              { label: 'First Name', field: 'first_name' },
              { label: 'Last Name', field: 'last_name' },
              { label: 'Email', field: 'email', editable: false },
              { label: 'Phone', field: 'phone' },
              { label: 'Shop Name', field: 'shop_name' },
              { label: 'Shop Address', field: 'shop_address' },
              { label: 'Shop Category', field: 'shop_category' },
              { label: 'City', field: 'city' },
              { label: 'State', field: 'state' },
              { label: 'Country', field: 'country' },
              { label: 'GST Number', field: 'gst_number', editable: false },
            ].map(({ label, field, editable = true }) => (
              <ProfileField key={field} label={label} value={userDetails?.[field]} editable={editable} onEdit={() => handleEdit(field, userDetails?.[field])} />
            ))}
            {editingField && (
              <TextInput
                value={tempValue}
                onChangeText={setTempValue}
                style={styles.input}
                autoFocus
                placeholder="Enter new value"
                placeholderTextColor="#999"
              />
            )}
            {editingField && (
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Icon name="save" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      <Toast position="bottom" visibilityTime={3000} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80, // Add padding to avoid overlap with the bottom tab bar
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
    color: '#666',
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
  fieldContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#007bff',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
    marginBottom: 80, // Add margin to avoid overlap with the bottom tab bar
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingAnimation: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});

export default ShopkeeperProfile;