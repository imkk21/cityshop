import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const Payment = () => {
  const key = 'rzp_test_cmA2ecsVLey6PX';
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [cartItems, setCartItems] = useState([
    { id: '1', name: ' 1', price: 20, quantity: 1, image: 'https://via.placeholder.com/100' },
    { id: '2', name: ' 2', price: 15, quantity: 1, image: 'https://via.placeholder.com/100' },
  ]);

  // Memoize calculateTotal with useCallback
  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]); // Add cartItems as a dependency

  useEffect(() => {
    setPaymentAmount(calculateTotal());
  }, [cartItems, calculateTotal]); // Now calculateTotal is stable and safe to include

  const updateQuantity = (id, operation) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: operation === 'add' ? item.quantity + 1 : Math.max(item.quantity - 1, 1),
            }
          : item
      )
    );
  };

  const handlePayment = () => {
    const options = {
      description: 'Payment for your order',
      image: 'https://your-logo-url.com/logo.png',
      currency: 'INR',
      key: key,
      amount: (paymentAmount * 100).toFixed(0),
      name: 'Your App Name',
      prefill: {
        email: 'user@example.com',
        contact: '9999999999',
        name: 'akriti',
      },
      theme: { color: '#5b2c6f' },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        console.log('-------payment id--------->', data.razorpay_payment_id);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.head}>
        <View style={styles.exitButton}>
          <TouchableOpacity onPress={() => console.log('------go back')}>
            {/* <LeftSideArrow /> */}
          </TouchableOpacity>
        </View>
        <Text style={styles.mainHead}>Checkout</Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imgHeader}>
              <Text style={styles.imgPara}>IMG</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, 'minus')}
                >
                  <Text style={styles.quantityText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, 'add')}
                >
                  <Text style={styles.quantityText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ₹{paymentAmount.toFixed(2)}</Text>
        <TouchableOpacity style={styles.payNowButton} onPress={handlePayment}>
          <Text style={styles.payNowText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  exitButton: {
    position: 'absolute',
    left: 0,
    borderRadius: 50,
    borderColor: '#5b2c6f',
  },
  mainHead: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    elevation: 3,
    marginTop: 30,
  },
  imgHeader: {
    width: 70,
    borderRadius: 8,
    backgroundColor: '#5b2c6f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgPara: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  info: {
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#555',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#5b2c6f',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 18,
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  payNowButton: {
    backgroundColor: '#5b2c6f',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    elevation: 3,
  },
  payNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Payment;