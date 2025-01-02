import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const Dots = ({ selected }) => {
  let backgroundColor = selected ? '#ff2156' : '#808080';
  return (
    <View
      style={{
        height: 5,
        width: 5,
        backgroundColor,
      }}
    />
  );
};

const Done = (props) => (
  <TouchableOpacity
    style={{
      marginRight: 12,
    }}
    {...props}
  >
    <Text style={{ color: '#ff2156' }}>Done</Text>
  </TouchableOpacity>
);

const OnboardingScreen = ({ navigation }) => {
  return (
    <Onboarding
      onSkip={() => navigation.navigate('LoginSreen')}
      onDone={() => navigation.navigate('LoginScreen')}
      DoneButtonComponent={Done}
      bottomBarColor="#ffffff"
      pages={[
        {
          backgroundColor: '#fff',
          image: <Image source={require('../assets/Preview.png')} />,
          title: 'Welcome to the City Shop',
          subtitle: 'Experience shopping tailored to your neighborhood.',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('../assets/CityShop.png')} />,
          title: 'Shopkeeper Facilities',
          subtitle: 'Bring your shop online and reach a wider audience today.',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('../assets/CityShopSecond.png')} />,
          title: 'Shopkeeper Facilities',
          subtitle: 'Bring your shop online and reach a wider audience today.',
        },
      ]}
    />
  );
};

export default OnboardingScreen;
