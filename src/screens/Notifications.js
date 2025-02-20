import React, { useEffect, useState, useContext, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { CONFIG } from '../utils/config';
import { AuthContext } from '../context/AuthContext';

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const NotificationScreen = () => {
  const { user } = useContext(AuthContext); 
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching notifications:", error);
    else setNotifications(data);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications(); // Fetch initial notifications

    // ✅ Fix: Use correct real-time subscription handling
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("New Notification:", payload.new);
          setNotifications((prev) => [payload.new, ...prev]); // Add new notification
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // ✅ Correct cleanup
    };
  }, [user, fetchNotifications]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {notifications.length === 0 ? (
        <Text style={{ textAlign: "center", fontSize: 16 }}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
              <Text>{item.message}</Text>
              <Text style={{ fontSize: 12, color: "gray" }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default NotificationScreen;
