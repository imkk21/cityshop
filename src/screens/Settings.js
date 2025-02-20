import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../utils/config';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const Settings = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    console.log("Fetching user preferences...");

    const fetchUserPreferences = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('notifications_enabled, dark_mode_enabled, auto_sync_enabled')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching preferences:", error);
        Alert.alert('Error', 'Failed to fetch user preferences.');
      } else {
        console.log("Fetched preferences:", data);
        setNotificationsEnabled(data.notifications_enabled);
        setDarkModeEnabled(data.dark_mode_enabled);
        setAutoSyncEnabled(data.auto_sync_enabled);
      }
      setLoading(false);
    };

    fetchUserPreferences();

    console.log("Setting up real-time listener...");

    const channel = supabase
      .channel(`user_preferences_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => {
          console.log("Real-time update received:", payload.new);
          setNotificationsEnabled(payload.new.notifications_enabled);
          setDarkModeEnabled(payload.new.dark_mode_enabled);
          setAutoSyncEnabled(payload.new.auto_sync_enabled);
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from Supabase channel...");
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const toggleSetting = async (setting, newValue) => {
    console.log(`Updating ${setting} to:`, newValue);

    const { error } = await supabase
      .from('users')
      .update({ [setting]: newValue })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', `Failed to update ${setting}.`);
      console.error(`Error updating ${setting}:`, error);
      // Revert the state on error
      switch (setting) {
        case 'notifications_enabled':
          setNotificationsEnabled(!newValue);
          break;
        case 'dark_mode_enabled':
          setDarkModeEnabled(!newValue);
          break;
        case 'auto_sync_enabled':
          setAutoSyncEnabled(!newValue);
          break;
        default:
          break;
      }
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']} // Gradient colors (light green to blue)
      start={{ x: 0, y: 0 }} // Gradient start point (top-left)
      end={{ x: 2, y: 1 }} // Gradient end point (bottom-right)
      style={styles.container}
    >

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="notifications" size={24} color="#6A82FB" />
            <Text style={styles.settingText}>Enable Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(newValue) => toggleSetting('notifications_enabled', newValue)}
            trackColor={{ false: '#767577', true: '#6A82FB' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="dark-mode" size={24} color="#6A82FB" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={(newValue) => toggleSetting('dark_mode_enabled', newValue)}
            trackColor={{ false: '#767577', true: '#6A82FB' }}
            thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Data & Sync Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Sync</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <MaterialIcons name="sync" size={24} color="#6A82FB" />
            <Text style={styles.settingText}>Auto Sync</Text>
          </View>
          <Switch
            value={autoSyncEnabled}
            onValueChange={(newValue) => toggleSetting('auto_sync_enabled', newValue)}
            trackColor={{ false: '#767577', true: '#6A82FB' }}
            thumbColor={autoSyncEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // White text for better visibility on gradient
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000', // White text for better visibility on gradient
    marginBottom: 19,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#333', // Semi-transparent white background
    borderRadius: 8,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default Settings;