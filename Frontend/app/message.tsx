import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  senderNickname: string;
  text: string;
}

interface APIResponse<T> {
  status: number;
  message: string;
  data: T;
}

export default function Message() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  }

  useEffect(() => {
    async function fetchMessages() {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert("Error", "No token found. Please login again.");
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:8080/messages", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: APIResponse<Message[]> = await response.json();
        if (result.status === 1 && Array.isArray(result.data)) {
          setMessages(result.data);
        }
      } catch (error: any) {
        console.error("Fetch Messages Error:", error);
        Alert.alert("Error", "Failed to fetch messages.");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [router]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.senderName}>{item.senderNickname}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  function handleAddFriend() {
    router.push("/addfriend");
  }

  function handleNewMessageBox() {
    Alert.alert("New Message", "Create new message box flow goes here.");
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9eb7ef" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Keep the Add Friend and New Message buttons */}
      <View style={styles.topLeftContainer}>
        <Pressable style={styles.topButton} onPress={handleAddFriend}>
          <Text style={styles.topButtonText}>Add Friend</Text>
        </Pressable>
        <Pressable style={styles.topButton} onPress={handleNewMessageBox}>
          <Text style={styles.topButtonText}>New Message</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Messages</Text>
      {messages.length === 0 ? (
        <Text style={styles.noMessages}>No messages yet.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${index}-${item.senderNickname}`}
          renderItem={renderMessage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Keep your original styling
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    paddingTop: 50,
    paddingHorizontal: 20
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center"
  },
  topLeftContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row"
  },
  topButton: {
    marginRight: 10
  },
  topButtonText: {
    color: "white",
    fontSize: 16,
    textDecorationLine: "underline"
  },
  title: {
    color: "#9eb7ef",
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 40
  },
  noMessages: {
    color: "white",
    alignSelf: "center",
    marginTop: 30,
    fontSize: 18
  },
  messageContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  senderName: {
    color: "#9eb7ef",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16
  },
  messageText: {
    color: "white",
    fontSize: 14
  }
});
