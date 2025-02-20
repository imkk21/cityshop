import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import Toast from 'react-native-toast-message'; // Import Toast
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Icon library

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ShopkeeperDashboardScreen = () => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [category, setCategory] = useState(''); // State for selected category
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  // Predefined categories
  const categories = [
    { label: 'Select a category', value: '' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Groceries', value: 'Groceries' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Books', value: 'Books' },
    { label: 'Toys', value: 'Toys' },
  ];

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
      Alert.alert(
        'Select Image Source',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: () => launchCameraHandler(),
          },
          {
            text: 'Gallery',
            onPress: () => launchGalleryHandler(),
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload product image. Please try again.',
      });
    }
  };

  const launchGalleryHandler = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No image selected',
          text2: 'Please select an image to upload.',
        });
        return;
      }

      const imageUri = result.assets[0].uri;
      const imageName = `product_${Date.now()}.jpg`;
      const imageType = getMimeType(imageName);

      setUploading(true);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(imageName, { uri: imageUri, type: imageType, name: imageName });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(imageName);

      console.log('Image URL:', urlData.publicUrl);

      setProductImage(urlData.publicUrl);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product image uploaded successfully!',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload product image. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const launchCameraHandler = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', cameraType: 'back' });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No image captured',
          text2: 'Please capture an image to upload.',
        });
        return;
      }

      const imageUri = result.assets[0].uri;
      const imageName = `product_${Date.now()}.jpg`;
      const imageType = getMimeType(imageName);

      setUploading(true);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(imageName, { uri: imageUri, type: imageType, name: imageName });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(imageName);

      console.log('Image URL:', urlData.publicUrl);

      setProductImage(urlData.publicUrl);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product image captured and uploaded successfully!',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to upload product image. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProductImage(null);
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Product image removed successfully!',
    });
  };

  const handleSubmit = async () => {
    if (!productName || !productDescription || !productPrice || !productImage || !category) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields and upload an image.',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productName,
          description: productDescription,
          price: parseFloat(productPrice),
          image: productImage,
          category: category,
          shopkeeper_id: user.id,
        }]);

      if (error) {
        throw error;
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product added successfully!',
      });
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductImage(null);
      setCategory('');
    } catch (error) {
      console.error('Error adding product:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add product. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Product</Text>

        {/* Product Image Upload */}
        <View style={styles.imageUploadContainer}>
          {productImage ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: productImage }} style={styles.productImage} />
              <TouchableOpacity onPress={handleRemoveImage} style={styles.removeButton}>
                <Icon name="delete" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.noImageText}>No product image</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleImageUpload} style={styles.uploadButton} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="add-a-photo" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Product Details Form */}
        <TextInput
          placeholder="Product Name"
          placeholderTextColor="#999"
          value={productName}
          onChangeText={setProductName}
          style={styles.input}
        />
        <TextInput
          placeholder="Product Description"
          placeholderTextColor="#999"
          value={productDescription}
          onChangeText={setProductDescription}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
        <TextInput
          placeholder="Product Price"
          placeholderTextColor="#999"
          value={productPrice}
          onChangeText={setProductPrice}
          style={styles.input}
          keyboardType="numeric"
        />

        {/* Product Category Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
            dropdownIconColor="#007bff"
          >
            {categories.map((cat) => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Product</Text>
          )}
        </TouchableOpacity>
      </View>
      {/* Toast Component */}
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShopkeeperDashboardScreen;