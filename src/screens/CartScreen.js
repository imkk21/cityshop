import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'Item 1', price: 'Rs.10' },
    { id: '2', name: 'Item 2', price: 'Rs.20' },
    { id: '3', name: 'Item 3', price: 'Rs.15' },
  ]);

  const removeItemFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <TouchableOpacity onPress={() => removeItemFromCart(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
  },
  itemPrice: {
    fontSize: 18,
    color: 'tomato',
  },
  removeText: {
    fontSize: 16,
    color: 'red',
  },
});

export default Cart;
