import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface Message {
  sender: string;
  receiver: string;
  content: string;
}

interface APIResponse<T> {
  status: number;
  message: string;
  data: T;
}

export default function MainPage() {
  const router = useRouter();

  async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem("token");
  }

  function handleNewMessageBox() {
    Alert.alert("New Chat", "Create new message box flow goes here.");
  }

  async function handleLogout() {
    await AsyncStorage.clear();
    router.push("/login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Chats</Text>

      <View style={styles.topLeftContainer}>
        <Pressable style={styles.topButton} onPress={handleNewMessageBox}>
          <Text style={styles.topButtonText}>New Chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  topLeftContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  topButton: {
    marginRight: 10,
  },
  topButtonText: {
    color: "white",
    fontSize: 20,
    textDecorationLine: "underline",
  },
  title: {
    color: "#9eb7ef",
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 40,
  },
  noMessages: {
    color: "white",
    alignSelf: "center",
    marginTop: 30,
    fontSize: 18,
  },
  messageContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  senderName: {
    color: "#9eb7ef",
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 16,
  },
  messageText: {
    color: "white",
    fontSize: 14,
  },
});
