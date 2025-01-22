import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const Menu = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userDetails, setUserDetails] = useState({});


  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;

      try {

        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setUserDetails(data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [user?.id]);


  const firstName = userDetails?.first_name || '';
  const lastName = userDetails?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  const handleNavigation = (screen) => {
    if (screen === 'Profile') {
      navigation.navigate('Profile', { user });
    } else {
      navigation.navigate(screen);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this awesome app!',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: user?.profilePicture || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        {fullName ? <Text style={styles.userName}>{fullName}</Text> : null}
        {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation('Profile')}>
        <View style={styles.menuItemContent}>
          <MaterialIcons name="person" size={24} color="#6A82FB" />
          <Text style={styles.menuText}>Profile</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation('Settings')}>
        <View style={styles.menuItemContent}>
          <MaterialIcons name="settings" size={24} color="#6A82FB" />
          <Text style={styles.menuText}>Settings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation('Notifications')}>
        <View style={styles.menuItemContent}>
          <MaterialIcons name="notifications" size={24} color="#6A82FB" />
          <Text style={styles.menuText}>Notifications</Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>3</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={toggleTheme}>
        <View style={styles.menuItemContent}>
          <MaterialIcons
            name={isDarkMode ? 'brightness-7' : 'brightness-4'}
            size={24}
            color="#6A82FB"
          />
          <Text style={styles.menuText}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleShareApp}>
        <View style={styles.menuItemContent}>
          <MaterialIcons name="share" size={24} color="#6A82FB" />
          <Text style={styles.menuText}>Share App</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleLogout}>
        <View style={styles.menuItemContent}>
          <MaterialIcons name="logout" size={24} color="#6A82FB" />
          <Text style={styles.menuText}>Logout</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  notificationBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
});

export default Menu;
