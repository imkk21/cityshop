import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const userId = user?.id; // Extract userId from user

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (product) => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to add items to the cart.');
      return;
    }

    try {
      // Check if the user has an existing cart
      const { data: existingCart, error: fetchCartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      let cartId;
      if (fetchCartError || !existingCart) {
        // If no cart exists, create a new cart
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

      // Check if the product already exists in the cart_items
      const { data: existingCartItem, error: fetchCartItemError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', product.id)
        .single();

      if (fetchCartItemError && fetchCartItemError.code !== 'PGRST116') { // PGRST116 = No rows found
        throw fetchCartItemError;
      }

      if (existingCartItem) {
        // If the product exists, update the quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingCartItem.quantity + 1 })
          .eq('id', existingCartItem.id);

        if (updateError) throw updateError;
      } else {
        // If the product doesn't exist, insert a new cart item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([
            {
              cart_id: cartId,
              product_id: product.id,
              quantity: 1,
            },
          ]);

        if (insertError) throw insertError;
      }

      Alert.alert('Success', 'Item added to cart.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>Rs. {item.price}</Text>
      <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSection = (title, data, horizontal = false) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        numColumns={horizontal ? 1 : 2}
        columnWrapperStyle={horizontal ? null : styles.columnWrapper}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover Products</Text>
        </View>
      }
      data={[]} // Empty data to render only the header and sections
      renderItem={null} // No items to render
      ListFooterComponent={
        <>
          {renderSection('Popular Products', products.slice(0, 4), true)}
          {renderSection('All Products', products)}
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productCard: {
    width: width / 2 - 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A82FB',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#6A82FB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;