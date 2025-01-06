import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import { RouteProp } from '@react-navigation/native';
import { StackParamList } from '../../types'; // Make sure this path is correct

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

type CategoryProductsScreenProps = {
  route: RouteProp<StackParamList, 'CategoryProducts'>;
};

const CategoryProductsScreen = ({ route }: CategoryProductsScreenProps) => {
  const { category } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProductsByCategory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data as Product[]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProductsByCategory();
  }, [category, fetchProductsByCategory]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category} Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default CategoryProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  productItem: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
  },
});
