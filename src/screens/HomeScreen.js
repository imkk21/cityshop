import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import CustomHeader from '../context/CustomHeader'; // Updated import path
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const spinValue = new Animated.Value(0);
  const heartScale = new Animated.Value(1);

  // Fetch products and wishlist
  const fetchData = useCallback(async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
      if (productsError) throw productsError;

      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId);
      if (wishlistError) throw wishlistError;

      setProducts(productsData || []);
      setFilteredProducts(productsData || []); // Initialize filtered products
      setWishlist(new Set(wishlistData?.map((item) => item.product_id) || []));
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch data.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Spin animation for cart icon
  const spinAnimation = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Heart icon animation
  const animateHeart = () => {
    heartScale.setValue(1);
    Animated.spring(heartScale, {
      toValue: 1.5,
      friction: 3,
      useNativeDriver: true,
    }).start(() => heartScale.setValue(1));
  };

  // Add to cart functionality
  const addToCart = async (product) => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to add items to the cart.',
      });
      return;
    }

    try {
      const { data: existingCart, error: fetchCartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      let cartId = existingCart?.id;

      if (!cartId) {
        const { data: newCart, error: createCartError } = await supabase
          .from('carts')
          .insert([{ user_id: userId }])
          .select('id')
          .single();
        if (createCartError) throw createCartError;
        cartId = newCart.id;
      }

      const { data: existingCartItem, error: fetchCartItemError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', product.id)
        .single();

      if (existingCartItem) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingCartItem.quantity + 1 })
          .eq('id', existingCartItem.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{ cart_id: cartId, product_id: product.id, quantity: 1 }]);
        if (insertError) throw insertError;
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item added to cart.',
      });
      spinAnimation();
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart.',
      });
    }
  };

  // Toggle wishlist functionality
  const toggleWishlist = async (product) => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to manage your wishlist.',
      });
      return;
    }

    try {
      const updatedWishlist = new Set(wishlist);

      if (wishlist.has(product.id)) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', product.id);
        if (error) throw error;
        updatedWishlist.delete(product.id);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Item removed from wishlist.',
        });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert([{ user_id: userId, product_id: product.id }]);
        if (error) throw error;
        updatedWishlist.add(product.id);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Item added to wishlist.',
        });
      }

      setWishlist(updatedWishlist);
      animateHeart();
    } catch (error) {
      console.error('Error managing wishlist:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update wishlist.',
      });
    }
  };

  // Render product item
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.productPrice}>Rs. {item.price}</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => addToCart(item)}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon name="shopping-cart" size={20} color="rgb(2, 12, 28)" />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => toggleWishlist(item)}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Icon
                name={wishlist.has(item.id) ? 'heart' : 'heart-o'}
                size={20}
                color={wishlist.has(item.id) ? '#FF5252' : 'rgb(2, 12, 28)'}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading animation
  if (loading) {
    return (
      // <LinearGradient
      //   colors={['#93C572', '#4A90E2']}
      //   start={{ x: 0, y: 0 }}
      //   end={{ x: 2, y: 1 }}
      //   style={styles.loadingContainer}
      // >
        <ActivityIndicator size="large" color="#FFFFFF" />
      // </LinearGradient>
    );
  }

  // Empty state
  if (filteredProducts.length === 0) {
    return (
        <><LottieView
        source={require('../assets/animations/empty.json')}
        autoPlay
        loop
        style={styles.lottieAnimation} /><Text style={styles.emptyText}>No products found.</Text></>
      
    );
  }

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <CustomHeader navigation={navigation} onSearch={handleSearch} />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}></Text>
          </View>
        }
      />
      <Toast />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  productCard: {
    width: width / 2 - 15,
    backgroundColor: '#FFFFFF',
    margin: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderColor: '#E0E0E0',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  productDetails: {
    paddingHorizontal: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(2, 12, 28)',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgb(2, 12, 28)',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    color:'rgb(2, 12, 28)',
    backgroundColor: '#F5F5F5',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 20,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});

export default HomeScreen;