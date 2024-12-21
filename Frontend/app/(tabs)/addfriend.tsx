import {useEffect, useState} from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import {router, useRouter} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

interface APIResponse<T> {
  status: number;
  message: string;
  data: T;
}

export default function AddFriend() {
  const router = useRouter();
  const [receiver, setFriendNickname] = useState<string>("");
  const [sender, setSenderNickname] = useState<string>("");


  useEffect(() => {
    // Retrieve the stored nickname when the component mounts
    async function fetchNickname() {
      const storedNickname = await AsyncStorage.getItem("nickname");
      if (storedNickname) {
        setSenderNickname(storedNickname);
      } else {
        Alert.alert("Error", "No nickname found. Please login again.");
        router.push("/login");
      }
    }

    fetchNickname();
  }, []);

  async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  }

  async function handleAddFriend() {
    if (!receiver) {
      Alert.alert("Error", "Please enter your friend's nickname.");
      return;
    }

    console.log(sender);
    console.log(receiver);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No token found. Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/friends/add`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender, receiver
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<string> = await response.json();
      if (result.status === 1) {
        Alert.alert("Success", result.message || "Friend request sent!");
        setFriendNickname("");
      } else {
        Alert.alert("Error", result.data || "Failed to send friend request.");
      }

    } catch (error: any) {
      console.error("Add Friend Error:", error);
      Alert.alert("Error", "An error occurred while sending the friend request.");
    }
  }

  function goToFriends() {
    router.push("/friends");
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.noButton} onPress={goToFriends}>
        <Text style={styles.mainPageText}>Go Back</Text>
      </Pressable>

      <Text style={styles.title}>Add a Friend</Text>

      <TextInput
        style={styles.input}
        value={receiver}
        onChangeText={setFriendNickname}
        placeholder="Enter friend's nickname"
        placeholderTextColor="#666"
      />

      <Pressable style={styles.addButton} onPress={handleAddFriend}>
        <Text style={styles.addButtonText}>Send Request</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    paddingTop: 30,
    paddingHorizontal: 20
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  backButtonText: {
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
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 10,
    color: "white",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#555",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#55af55",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 40
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
  },
  noButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  mainPageText: {
    color: "white",
    fontSize: 16,
    textDecorationLine: "underline"
  },
});
