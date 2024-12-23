import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface Friend {
    nickname: string;
}

interface Message {
    id: number;
    sender: string;
    receiver: string;
    content: string;
}

export default function NewMessagePage() {
    const router = useRouter();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingFriends, setLoadingFriends] = useState<boolean>(true);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<string>("");
    const [nickname, setNickname] = useState<string | null>(null);

    const getToken = async (): Promise<string | null> => {
        return AsyncStorage.getItem("token");
    };

    // Fetch friends list from API
    const fetchFriends = async () => {
        try {
            const token = await getToken();
            const storedNickname = await AsyncStorage.getItem("nickname");

            if (!token || !storedNickname) {
                Alert.alert("Error", "Authentication failed. Please log in again.");
                router.push("/login");
                return;
            }

            setNickname(storedNickname);

            const response = await fetch(`${API_URL}/friends?nickname=${storedNickname}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (result.status === 1 && Array.isArray(result.data)) {
                setFriends(result.data.map((nickname: string) => ({ nickname })));
            } else {
                setFriends([]);
                Alert.alert("Info", result.message || "No friends found.");
            }
        } catch (error) {
            console.error("Fetch Friends Error:", error);
            Alert.alert("Error", "Failed to fetch friends.");
        }
    };

    // Fetch messages between two users
    const fetchMessages = async (friend: string) => {
        try {
            setMessages([]);

            const token = await getToken();
            const storedNickname = await AsyncStorage.getItem("nickname");

            if (!token || !storedNickname) {
                Alert.alert("Error", "Authentication failed. Please log in again.");
                return;
            }

            const response = await fetch(
                `${API_URL}/messagesbetween?nickname=${storedNickname}&friend=${friend}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const result = await response.json();

            if (result.status === 1 && Array.isArray(result.data)) {
                setMessages(result.data);
            } else {
                setMessages([]);
                console.warn(result.message || "No messages found.");
            }
        } catch (error) {
            console.error("Fetch Messages Error:", error);
            Alert.alert("Error", "Failed to fetch messages.");
        }

    };

    // Handle starting a chat
    const handleStartChat = (friend: string) => {
        router.push({
            pathname: "./friendmessages",
            params: { friend },
        });
    };

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = await getToken();
            const storedNickname = await AsyncStorage.getItem("nickname");

            if (!token || !storedNickname) {
                Alert.alert("Error", "Authentication failed. Please log in again.");
                return;
            }

            const message = {
                sender: storedNickname,
                receiver: friend,
                content: newMessage.trim(),
            };

            const response = await fetch(`${API_URL}/messages/send`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            });

            const result = await response.json();
            if (result.status === 1) {
                setMessages((prevMessages) => [...prevMessages, message]);
                setNewMessage("");
            } else {
                Alert.alert("Error", result.message || "Failed to send message.");
            }
        } catch (error) {
            console.error("Send Message Error:", error);
            Alert.alert("Error", "Failed to send message.");
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    if (loadingFriends) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9eb7ef" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Friend</Text>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.nickname} // Ensure keys are unique
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.friendContainer}
                        onPress={() => handleStartChat(item.nickname)}
                    >
                        <Text style={styles.friendName}>{item.nickname}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <Text style={styles.noFriends}>You have no friends to start a chat with.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
        padding: 20,
    },
    title: {
        fontSize: 20,
        color: "red",
        marginBottom: 20,
        alignSelf: "center",
        paddingTop: 20, // Add padding to increase spacing within the element
        marginTop: 100, // Large value to test for visual change
    },
    friendContainer: {
        backgroundColor: "#333",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    friendName: {
        color: "#9eb7ef",
        fontSize: 18,
        fontWeight: "bold",
    },
    noFriends: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#25292e",
    },
});

