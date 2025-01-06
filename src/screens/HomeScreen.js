import React, { useState, useEffect } from 'react';
import {View, StyleSheet, FlatList, Text, Alert, ActivityIndicator, ImageBackground, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const Home = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');

      if (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Failed to fetch products.');
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };

    getUser();
  }, []);

  const addToCart = async (product) => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to add items to the cart.');
      return;
    }

    try {
      const { error } = await supabase.from('carts').insert([
        {
          user_id: userId,
          product_id: product.id,
          quantity: 1,
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Item added to cart.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  const renderProduct = ({ item }) => (
    <View style={[styles.card, themeStyles.card]}>
      <Text style={[styles.productName, themeStyles.text]}>{item.name}</Text>
      <Text style={[styles.productDescription, themeStyles.text]}>{item.description}</Text>
      <Text style={[styles.productPrice, themeStyles.text]}>Price: Rs.{item.price}</Text>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4facfe" />
            <Text style={[styles.loadingText, themeStyles.text]}>Loading products...</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

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
        {/* Remove ScrollView and directly use FlatList */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          ListHeaderComponent={
            <View style={styles.scrollContainer}>
              <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
                {/* Add an icon or text for the theme button if needed */}
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, themeStyles.text]}>No products available.</Text>
          }
          contentContainerStyle={styles.scrollContainer}
        />
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
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  themeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  themeButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
});

const lightStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    color: '#fff',
  },
});

const darkStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  text: {
    color: '#fff',
  },
});

export default Home;