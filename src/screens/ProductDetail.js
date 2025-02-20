import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import { createClient } from '@supabase/supabase-js';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon from react-native-vector-icons
import { CONFIG } from '../utils/config';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const ProductDetail = ({ route }) => {
  const { product } = route.params;
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const userId = user?.id; // Extract userId from user

  const addToCart = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to add items to the cart.');
      return;
    }

    try {
      const { data: existingCart, error: fetchCartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      let cartId;
      if (fetchCartError || !existingCart) {
        const { data: newCart, error: createCartError } = await supabase
          .from('carts')
          .insert([{ user_id: userId }])
          .select('id')
          .single();

        if (createCartError) throw createCartError;
        cartId = newCart.id;
      } else {
        cartId = existingCart.id;
      }

      const { data: existingCartItem, error: fetchCartItemError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', product.id)
        .single();

      if (fetchCartItemError && fetchCartItemError.code !== 'PGRST116') {
        throw fetchCartItemError;
      }

      if (existingCartItem) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingCartItem.quantity + 1 })
          .eq('id', existingCartItem.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            cart_id: cartId,
            product_id: product.id,
            quantity: 1,
          }]);

        if (insertError) throw insertError;
      }

      Alert.alert('Success', 'Item added to cart.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  const addToWishlist = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to add items to the wishlist.');
      return;
    }

    try {
      const { data: existingWishlistItem, error: fetchWishlistItemError } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();

      if (fetchWishlistItemError && fetchWishlistItemError.code !== 'PGRST116') {
        throw fetchWishlistItemError;
      }

      if (existingWishlistItem) {
        Alert.alert('Info', 'This product is already in your wishlist.');
      } else {
        const { error: insertError } = await supabase
          .from('wishlist')
          .insert([{ user_id: userId, product_id: product.id }]);

        if (insertError) throw insertError;

        Alert.alert('Success', 'Item added to wishlist.');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add item to wishlist.');
    }
  };

  return (
    <LinearGradient
      colors={['rgba(89, 161, 96, 0.8)', 'rgba(189, 216, 197, 0.5)']} // Gradient colors (light green to blue)
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>Rs. {product.price}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.buttonsContainer}>
            <Icon
              name="cart-outline"
              size={32}
              color="#6A82FB"
              onPress={addToCart}
              style={styles.iconButton}
            />
            <Icon
              name="heart-outline"
              size={32}
              color="#FF6347"
              onPress={addToWishlist}
              style={styles.iconButton}
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: 'rgba(241, 239, 239, 0.8)', // Semi-transparent white background
    borderRadius: 10,
    margin: 10,
    elevation: 3,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A82FB',
    marginBottom: 20,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  iconButton: {
    padding: 10,
  },
});

export default ProductDetail;