import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const fetchCartItems = useCallback(async () => {
    try {
      // Fetch the user's cart
      const { data: cart, error: fetchCartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId);

      if (fetchCartError) throw fetchCartError;

      // If the user doesn't have a cart, set cartItems to an empty array
      if (!cart || cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const cartId = cart[0].id; // Use the first cart (assuming one cart per user)

      // Fetch cart items with product details
      const { data: cartItems, error: fetchCartItemsError } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('cart_id', cartId);

      if (fetchCartItemsError) throw fetchCartItemsError;

      setCartItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to fetch cart items.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Refresh cart when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchCartItems();
      }
    }, [userId, fetchCartItems])
  );

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity is less than 1, remove the item from the cart
      removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;

      // Refresh the cart items after updating the quantity
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity.');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      Alert.alert('Success', 'Item removed from cart.');
      fetchCartItems(); // Refresh the cart items
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart.');
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.products.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.products.name}</Text>
        <Text style={styles.cartItemPrice}>Rs. {item.products.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Icon name="remove" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Icon name="delete" size={24} color="rgb(2, 12, 28)" />
      </TouchableOpacity>
    </View>
  );

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.products.price * item.quantity, 0);
  };

  const deliveryCharge = 10.0; // Fixed delivery charge
  const subtotal = calculateTotalPrice();
  const total = subtotal + deliveryCharge;

  if (loading) {
    return (
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 1 }}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Loading cart items...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 1 }}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.addMoreText}>Add more</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCartItem}
          scrollEnabled={false} // Disable scrolling for FlatList inside ScrollView
        />

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items:</Text>
            <Text style={styles.summaryValue}>{cartItems.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery charge:</Text>
            <Text style={styles.summaryValue}>Rs. {deliveryCharge.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sub Total:</Text>
            <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>Rs. {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentTitle}>Payment Method</Text>
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => {
              // Open a modal or navigate to a payment method selection screen
              Alert.alert('Select Payment Method', 'Choose your payment method', [
                { text: 'Credit Card', onPress: () => setPaymentMethod('Credit Card') },
                { text: 'Debit Card', onPress: () => setPaymentMethod('Debit Card') },
                { text: 'UPI', onPress: () => setPaymentMethod('UPI') },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          >
            <Text style={styles.paymentText}>{paymentMethod}</Text>
            <Icon name="keyboard-arrow-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity style={styles.checkoutButton} onPress={() => Alert.alert('Checkout', 'Proceeding to checkout...')}>
          <Text style={styles.checkoutButtonText}>Proceed To Checkout</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight:140,
  },
  addMoreText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#6A82FB',
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: 'rgb(2, 12, 28)',
    borderRadius: 5,
    padding: 5,
    width: 30,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#333',
  },
  removeButton: {
    marginLeft: 10,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: 'rgb(2, 12, 28)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default CartScreen;