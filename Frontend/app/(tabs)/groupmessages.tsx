import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface Message {
  sender: string;
  content: string;
}

interface APIResponse<T> {
  status: number;
  message: string;
  data: T;
}

export default function GroupMessages() {
  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");

  async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem("token");
  }

  const fetchMessages = async () => {
    if (!groupId) {
      Alert.alert("Error", "Group ID is missing. Cannot fetch messages.");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No token found. Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/groups/${groupId}/messages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<Message[]> = await response.json();
      if (result.status === 1 && Array.isArray(result.data)) {
        setMessages(result.data);
      } else {
        Alert.alert("Error", result.message || "Failed to fetch messages.");
      }
    } catch (error) {
      console.error("Fetch Messages Error:", error);
      Alert.alert("Error", "Failed to fetch messages.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert("Error", "Message cannot be empty.");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No token found. Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/groups/${groupId}/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: nickname,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<string> = await response.json();
      if (result.status === 1) {
        setNewMessage("");
        fetchMessages();
      } else {
        Alert.alert("Error", result.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Send Message Error:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchMessages();
    }

    async function fetchNickname() {
      const storedNickname = await AsyncStorage.getItem("nickname");
      if (storedNickname) {
        setNickname(storedNickname);
      } else {
        Alert.alert("Error", "No nickname found. Please login again.");
        router.push("/login");
      }
    }

    fetchNickname();
  }, [groupId]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.sender}>{item.sender}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Messages</Text>
        {loading && <ActivityIndicator size="small" color="#9eb7ef" />}
      </View>
      <View style={styles.groupNameContainer}>
        <Text style={styles.groupName}>{groupName}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9eb7ef" />
        </View>
      ) : messages.length === 0 ? (
        <Text style={styles.noMessages}>No messages found.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) =>
            `${index}-${item.sender}-${item.content}`
          }
          renderItem={renderMessage}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor="#666"
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e", paddingHorizontal: 20 },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { color: "#9eb7ef", fontSize: 24, fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noMessages: { color: "white", textAlign: "center", fontSize: 16 },
  messageContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  sender: { color: "#9eb7ef", fontWeight: "bold" },
  content: { color: "white", marginTop: 5 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    backgroundColor: "#444",
    borderRadius: 10,
    color: "white",
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#55af55",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendButtonText: { color: "white", fontWeight: "bold" },
  groupNameContainer: {
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#444",
    borderRadius: 10,
  },
  groupName: { color: "white", fontWeight: "bold" },
});
