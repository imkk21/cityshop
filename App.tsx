import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import AppNavigatorShopkeeper from './src/navigation/AppNagivatorShopkeeper';
import RoleSelectionScreen from './src/navigation/RoleSelectionScreen';

import LoginScreen from './src/components/LoginScreen';
import SignUpScreen from './src/components/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgetPasswordScreen';
import ShopkeeperLogin from './src/components/ShopkeeperLogin';
import ShopKeeperSignUpScreen from './src/components/ShopkeeperSignUp';

import ProfileScreen from './src/screens/ProfileScreen';
import ShopkeeperProfile from './src/screens/ShopkeeperProfile';
import ShopkeeperDashboardScreen from './src/screens/ShopkeeperDashboardScreen';
import ShopkeeperProductList from './src/screens/ShopkeeperProductsList';
import ProductDetail from './src/screens/ProductDetail';
import WishlistScreen from './src/screens/WishlistScreen';
import Settings from './src/screens/Settings';
import Notifications from './src/screens/Notifications';
import Payment from './src/screens/Payment';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="RoleSelection">
          <Stack.Screen 
            name="RoleSelection" 
            component={RoleSelectionScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AppNavigator" 
            component={AppNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetail} 
            options={{ headerShown: true, title: 'Product Details' }} 
          />
          <Stack.Screen 
            name="Settings" 
            component={Settings} 
            options={{ headerShown: true, title: 'Settings' }} 
          />
          <Stack.Screen 
            name="Notifications" 
            component={Notifications} 
            options={{ headerShown: true, title: 'Notifications' }} 
          />
          <Stack.Screen 
            name="ShopkeeperLogin" 
            component={ShopkeeperLogin} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="AppNavigatorShopkeeper" 
            component={AppNavigatorShopkeeper} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ShopkeeperSignUp" 
            component={ShopKeeperSignUpScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Wishlist" 
            component={WishlistScreen} 
            options={{ headerShown: true, title: 'Wishlist' }} 
          />
          <Stack.Screen 
            name="ShopkeeperProfile" 
            component={ShopkeeperProfile} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ShopkeeperDashboard" 
            component={ShopkeeperDashboardScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ShopkeeperProductList" 
            component={ShopkeeperProductList} 
            options={{ headerShown: true, title: 'Product Details' }} 
          />
          <Stack.Screen 
            name="Payment" 
            component={Payment} 
            options={{ headerShown: true, title: 'Payment' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
