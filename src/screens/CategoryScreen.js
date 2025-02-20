import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  RefreshControl,
  Animated,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config'; // Adjust the path as needed
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import CustomHeader from '../context/CustomHeader'; // Import your CustomHeader component

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const { width, height } = Dimensions.get('window');

const CategoryScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [page, setPage] = useState(1); // For pagination
  const [hasMore, setHasMore] = useState(true); // For pagination
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for product list fade-in

  // Access the authenticated user from AuthContext
  const { user } = useContext(AuthContext);

  // Fetch unique categories from the products table
  useEffect(() => {
    fetchUniqueCategories();
  }, []);

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

  // Fetch products based on the selected category
  const fetchProductsByCategory = async (category, reset = false) => {
    if (!category) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category.name)
        .range((reset ? 0 : (page - 1) * 10), (reset ? 9 : page * 10 - 1)); // Pagination

      if (error) throw error;

      if (reset) {
        setProducts(data);
        setPage(1);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }

      // Check if there are more products to load
      if (data.length < 10) setHasMore(false);
      else setHasMore(true);

      // Fade-in animation
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle category selection
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    fetchProductsByCategory(category, true); // Reset products and load first page
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProductsByCategory(selectedCategory, true); // Reset products and load first page
  };

  // Handle pagination (load more products)
  const loadMoreProducts = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Render a category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.selectedCategoryItem,
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory?.id === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
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
  //handle searching
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Render footer for pagination loading
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#000000" />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
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
      {/* Add CustomHeader */}
      <CustomHeader navigation={navigation} onSearch={(handleSearch)} />

      {/* Show Category List if no category is selected */}
      {!selectedCategory && (
        <>
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
          <Animated.FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            style={{ opacity: fadeAnim }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFFFFF']} tintColor="#FFFFFF" />
            }
            onEndReached={loadMoreProducts} // Load more products on scroll
            onEndReachedThreshold={0.5} // Trigger loadMoreProducts when 50% of the list is scrolled
            ListFooterComponent={renderFooter} // Show loading spinner at the bottom
          />
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  categoryList: {
    flex: 1,
  },
  categoryGrid: {
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: width / 2- 24, // Two columns with padding
    backgroundColor: '#333',
    padding: 19,
    marginBottom: 16,
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
  },
  selectedCategoryItem: {
    backgroundColor: '#6A82FB',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
  },
  footer: {
    padding: 10,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryScreen;