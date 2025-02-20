import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 20;

const WishlistScreen = ({ navigation }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!userId) {
          Alert.alert('Error', 'You must be logged in to view your wishlist.');
          return;
        }

        const { data, error } = await supabase
          .from('wishlist')
          .select('product_id')
          .eq('user_id', userId);

        if (error) throw error;

        const productIds = data.map((item) => item.product_id);
        if (productIds.length > 0) {
          const { data: products, error: productError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

          if (productError) throw productError;
          setWishlistItems(products);
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        Alert.alert('Error', 'Failed to fetch wishlist.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  const removeFromWishlist = async (productId) => {
    try {
      if (!userId) return;
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      
      setWishlistItems((prevItems) => prevItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', 'Failed to remove item from wishlist.');
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productPrice}>Rs. {item.price}</Text>
      <TouchableOpacity
        style={styles.heartIcon}
        onPress={() => removeFromWishlist(item.id)}
      >
        <Icon name="heart" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading wishlist...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#93C572", "#4A90E2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }} 
      style={styles.gradientBackground}>
      <FlatList
        style={styles.container}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.headerTitle}>Your Wishlist</Text></View>}
        data={wishlistItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2} 
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 10,
  },
  header: {
    marginBottom: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A82FB',
    marginTop: 5,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WishlistScreen;
