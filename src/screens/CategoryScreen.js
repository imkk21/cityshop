import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const { width, height } = Dimensions.get('window');

const CategoryScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchUniqueCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('category')
          .neq('category', null);

        if (error) throw error;

        // Get unique categories using Set
        const uniqueCategories = [...new Set(data.map((item) => item.category))];

        // Format categories for display
        const formattedCategories = uniqueCategories.map((category, index) => ({
          id: index + 1,
          name: category,
        }));

        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching unique categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniqueCategories();
  }, []);

  // Fetch products based on the selected category
  const fetchProductsByCategory = async (category) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category.name);

      if (error) throw error;
      setProducts(data);
      setSelectedCategory(category); // Set the selected category
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render a category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => fetchProductsByCategory(item)}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render a product item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} // Fallback image
        style={styles.productImage}
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>Rs. {item.price}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A82FB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Show Category List if no category is selected */}
      {!selectedCategory && (
        <>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2} // Display categories in a grid
            columnWrapperStyle={styles.categoryGrid}
            style={styles.categoryList}
          />
        </>
      )}

      {/* Show Product List if a category is selected */}
      {selectedCategory && (
        <>
          {/* Back Button to return to Category List */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.backButtonText}>← Back to Categories</Text>
          </TouchableOpacity>

          {/* Product List */}
          <Text style={styles.sectionTitle}>{selectedCategory.name} Products</Text>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.productList}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoryList: {
    flex: 1,
  },
  categoryGrid: {
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: width / 2 - 24, // Two columns with padding
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A82FB',
    marginTop: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A82FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryScreen;
