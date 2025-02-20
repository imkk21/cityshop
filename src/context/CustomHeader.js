import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const CustomHeader = ({ navigation, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchBarScale = useRef(new Animated.Value(1)).current;
  const iconBounce = useRef(new Animated.Value(1)).current;

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const animateSearchBar = () => {
    Animated.sequence([
      Animated.timing(searchBarScale, {
        toValue: 1.05,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(searchBarScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateIcon = (icon) => {
    Animated.sequence([
      Animated.timing(icon, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(icon, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateSearchBar();
  }, [searchQuery]);

  return (
    <LinearGradient
      colors={['rgb(2, 12, 28)', 'rgb(2, 12, 28)']} // Black gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      {/* Top Section with Logo and Icons */}
      <View style={styles.topSection}>
        <Image source={require('../assets/logo.jpeg')} style={styles.logo} />
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => { animateIcon(iconBounce); navigation.navigate('Notifications'); }}>
            <Animated.View style={{ transform: [{ scale: iconBounce }] }}>
              <Icon name="notifications" size={26} color="#fff" style={styles.icon} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { animateIcon(iconBounce); navigation.navigate('Wishlist'); }}>
            <Animated.View style={{ transform: [{ scale: iconBounce }] }}>
              <Icon name="favorite" size={26} color="#fff" style={styles.icon} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { animateIcon(iconBounce); navigation.navigate('Account'); }}>
            <Animated.View style={{ transform: [{ scale: iconBounce }] }}>
              <Icon name="account-circle" size={26} color="#fff" style={styles.icon} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <Animated.View style={[styles.searchContainer, { transform: [{ scale: searchBarScale }] }]}>
        <TextInput
          placeholder="Search for products..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
          <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 40,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', // White background for search bar
    borderRadius: 25,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000', // Black text for search input
  },
  searchIcon: {
    marginLeft: 10,
  },
});

export default CustomHeader;