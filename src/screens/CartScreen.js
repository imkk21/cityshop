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
  SafeAreaView,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const { width, height } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const RAZORPAY_KEY = 'rzp_test_cmA2ecsVLey6PX';

  const fetchCartItems = useCallback(async () => {
    try {
      const { data: cart, error: fetchCartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId);

      if (fetchCartError) throw fetchCartError;

      if (!cart || cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const cartId = cart[0].id;

      const { data: cartItems, error: fetchCartItemsError } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('cart_id', cartId);

      if (fetchCartItemsError) throw fetchCartItemsError;

      setCartItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch cart items.',
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchCartItems();
      }
    }, [userId, fetchCartItems])
  );

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;

      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update quantity.',
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item removed from cart.',
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove item from cart.',
      });
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.products.price * item.quantity, 0);
  };

  const deliveryCharge = 0.0;
  const subtotal = calculateTotalPrice();
  const total = subtotal + deliveryCharge;

  const clearCart = async () => {
    try {
      // Fetch the user's cart
      const { data: cart, error: fetchCartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId);

      if (fetchCartError) throw fetchCartError;

      if (!cart || cart.length === 0) {
        return; // No cart to clear
      }

      const cartId = cart[0].id;

      // Delete all items in the cart
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (deleteError) throw deleteError;

      // Refresh the cart items
      fetchCartItems();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Cart cleared after successful payment.',
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to clear cart.',
      });
    }
  };

  const handleCheckout = async () => {
    Alert.alert(
      'Select Payment Method',
      'Choose your payment method',
      [
        { text: 'Credit Card', onPress: () => initiatePayment('Credit Card') },
        { text: 'Debit Card', onPress: () => initiatePayment('Debit Card') },
        { text: 'UPI', onPress: () => initiatePayment('UPI') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const initiatePayment = (paymentMethod) => {
    const options = {
      description: 'Payment for your order',
      image: 'https://nbzuqafgapyfiqjjrsts.supabase.co/storage/v1/object/public/product-images//logo.jpeg',
      currency: 'INR',
      key: RAZORPAY_KEY,
      amount: total * 100,
      name: 'CityShop',
      prefill: {
        email: user?.email || 'user@example.com',
        contact: '9999999999',
        name: user?.name || 'User Name',
      },
      theme: { color: '#000000' },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          text2: `Payment ID: ${data.razorpay_payment_id}`,
        });
        // Clear the cart after successful payment
        clearCart();
        // Optionally, navigate to a success screen
        navigation.navigate('OrderSuccess');
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: error.description || 'Something went wrong',
        });
      });
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 2, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Icon name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.addMoreText}>Add more</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCartItem}
            scrollEnabled={false}
          />

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

          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Proceed To Checkout</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to avoid overlap with bottom tabs
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
    marginRight: 140,
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
  checkoutButton: {
    backgroundColor: 'rgb(2, 12, 28)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40, // Add margin to avoid overlap with bottom tabs
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