import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>
        Home Screen
      </Text>
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate('Profile')} // Navigate to Profile screen
      />
    </View>
  );
};

export default HomeScreen;
