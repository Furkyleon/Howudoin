import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface Message {
  sender: string;
  receiver: string;
}

export default function MainPage() {
  const router = useRouter();
  const [chatPartners, setChatPartners] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem("token");
  };

  const fetchChats = async () => {
    try {
      const token = await getToken();
      const storedNickname = await AsyncStorage.getItem("nickname");

      if (!token || !storedNickname) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/messages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch chats. Status code: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 1 && Array.isArray(result.data)) {
        const uniquePartners = Array.from(
            new Set(
                result.data
                    .filter(
                        (msg: Message) =>
                            msg.sender === storedNickname ||
                            msg.receiver === storedNickname
                    )
                    .map((msg: Message) =>
                        msg.sender === storedNickname ? msg.receiver : msg.sender
                    )
            )
        );
        setChatPartners(uniquePartners);
      } else {
        setChatPartners([]);
        Alert.alert("Info", result.message || "No chats found.");
      }
    } catch (error) {
      console.error("Fetch Chats Error:", error);
      Alert.alert("Error", "Failed to fetch chats.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push("/newmessagebox");
  };

  const handleOpenChat = (partner: string) => {
    router.push({
      pathname: "/(tabs)/message",
      params: { friend: partner },
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.push("/login");
  };

  useFocusEffect(
      React.useCallback(() => {
        fetchChats(); // Refresh chats whenever the page is focused
      }, [])
  );

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9eb7ef" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Chats</Text>
        <FlatList
            data={chatPartners}
            keyExtractor={(item, index) => `${item}-${index}`} // Ensure unique keys
            renderItem={({ item }) => (
                <Pressable
                    style={styles.chatContainer}
                    onPress={() => handleOpenChat(item)}
                >
                  <Text style={styles.chatFriend}>{item}</Text>
                </Pressable>
            )}
            ListFooterComponent={
              <Pressable style={styles.newChatButton} onPress={handleNewChat}>
                <Text style={styles.newChatButtonText}>New Chat</Text>
              </Pressable>
            }
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  logoutButton: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  title: {
    color: "#9eb7ef",
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
  },
  chatContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  chatFriend: {
    color: "#9eb7ef",
    fontSize: 18,
    fontWeight: "bold",
  },
  newChatButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  newChatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
  },
});
