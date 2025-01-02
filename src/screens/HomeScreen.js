import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Alert, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');

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

  // Get current user ID from Supabase
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
      const { error } = await supabase
        .from('carts')
        .insert([
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

  const renderProduct = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.description}</Paragraph>
        <Paragraph>Price: Rs.{item.price}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => addToCart(item)}>Add to Cart</Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4facfe" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        ListEmptyComponent={<Text style={styles.emptyText}>No products available.</Text>}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  card: {
    marginVertical: 5,
    elevation: 3,
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4facfe',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default Home;
