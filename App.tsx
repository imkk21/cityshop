import 'react-native-url-polyfill/auto';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator'; // Adjust the path based on your folder structure
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/userinfo.profile'],
  webClientId: '488144373941-icg3vs2qdcs487hc0k155oe68m88iq1a.apps.googleusercontent.com', // Replace with your Google Web Client ID
});

const App = () => {
  return <AppNavigator />;
};


export default App;
