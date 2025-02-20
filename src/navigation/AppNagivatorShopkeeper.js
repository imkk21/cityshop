import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import ShopkeeperDashboardScreen from '../screens/ShopkeeperDashboardScreen';
import ShopkeeperProfileScreen from '../screens/ShopkeeperProfile';
import ShopkeeperProductList from '../screens/ShopkeeperProductsList';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const AppNavigatorShopkeeper = () => {
  const [loading, setLoading] = useState(false);

  const handleNavigation = async (navigation, route) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(route);
    }, 1500); // Simulate loading time
  };

  return (
    <>
      {loading && (
        <View style={styles.overlay}>
          <LottieView
            source={require('../assets/animations/loading.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
        </View>
      )}
      <Tab.Navigator
        screenOptions={({ route, navigation }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Your Products') {
              iconName = 'list';
            } else if (route.name === 'Profile') {
              iconName = 'person';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: styles.tabBar,
        })}
      >
        <Tab.Screen
          name="Home"
          component={ShopkeeperDashboardScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              handleNavigation(navigation, 'Home');
            },
          })}
        />
        <Tab.Screen
          name="Your Products"
          component={ShopkeeperProductList}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              handleNavigation(navigation, 'Your Products');
            },
          })}
        />
        <Tab.Screen
          name="Profile"
          component={ShopkeeperProfileScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              handleNavigation(navigation, 'Profile');
            },
          })}
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 15,
    right: 15,
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
});

export default AppNavigatorShopkeeper;
