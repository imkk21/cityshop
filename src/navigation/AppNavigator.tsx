/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import Profile from '../screens/ProfileScreen';
import Home from '../screens/HomeScreen';
import Menu from '../screens/MenuScreen';
import Login from '../components/LoginScreen';
import Cart from '../screens/CartScreen';
import ForgotPasswordScreen from '../screens/ForgetPasswordScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../components/LoginScreen';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CartStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
    name="LoginScreen" 
    component={LoginScreen}
    options ={{
      headerShown : true,
      title : "LogIn",
    }} />
    <Stack.Screen
      name="CartScreen"
      component={Cart}
      options={{
        headerShown: true,
        title: 'Cart',
      }}
    />
  </Stack.Navigator>
);

const CategoriesScreen: React.FC = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Categories Screen</Text>
  </View>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Profile"
      component={Profile}
      options={{ headerShown: true, title: 'Profile' }}
    />
    <Stack.Screen
      name="ProfileEdit"
      component={Profile}
      options={{ headerShown: true, title: 'Edit Profile' }}
    />
    <Stack.Screen
      name="PasswordChange"
      component={Profile}
      options={{ headerShown: true, title: 'Change Password' }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: true, title: 'Forgot Password' }}
    />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={Home}
      options={{
        headerShown: true,
        title: 'Home',
      }}
    />
  </Stack.Navigator>
);

const MenuStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MenuScreen"
      component={Menu}
      options={{
        headerShown: true,
        title: 'Menu',
      }}
    />
  </Stack.Navigator>
);

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
      }
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user || null);
      });

      return () => {
        subscription?.unsubscribe?.();
      };
    };

    checkFirstLaunch();
    getSession();
  }, []);

  if (isFirstLaunch === null) {
    return null; // Optional: Add a loader or splash screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="MainTabs">
            {() => <MainTabs user={user} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainTabs: React.FC<{ user: any }> = ({ user }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;
        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Categories':
            iconName = focused ? 'grid' : 'grid-outline';
            break;
          case 'Cart':
            iconName = focused ? 'cart' : 'cart-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          case 'Menu':
            iconName = focused ? 'menu' : 'menu-outline';
            break;
          default:
            iconName = 'help-circle-outline';
            break;
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Categories" component={CategoriesScreen} />
    <Tab.Screen name="Cart" component={CartStack} />
    <Tab.Screen name="Profile">
      {() =>
        user ? (
          <ProfileStack />
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Login" component={Login} />
          </Stack.Navigator>
        )
      }
    </Tab.Screen>
    <Tab.Screen name="Menu" component={MenuStack} />
  </Tab.Navigator>
);

export default App;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
