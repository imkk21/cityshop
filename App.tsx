import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/components/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'; // Import AuthProvider
import ProfileScreen from './src/screens/ProfileScreen';
import SignUpScreen from './src/components/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgetPasswordScreen';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

// GoogleSignin.configure({
//   scopes: ['https://www.googleapis.com/auth/userinfo.profile'],
//   webClientId: '488144373941-icg3vs2qdcs487hc0k155oe68m88iq1a.apps.googleusercontent.com',
// });
const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
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
            name="Profile"
            component={ProfileScreen}
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
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
