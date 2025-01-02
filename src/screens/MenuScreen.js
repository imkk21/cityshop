import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Menu = ({ navigation }) => {
  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Menu</Text>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation('Profile')}>
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation('Settings')}>
        <Text style={styles.menuText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation('Help')}>
        <Text style={styles.menuText}>Help & Support</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation('Logout')}>
        <Text style={styles.menuText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
});

export default Menu;
