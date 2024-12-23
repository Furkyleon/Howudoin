import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    FlatList,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface Message {
    _id: number;
    sender: string;
    receiver: string;
    content: string;
}

export default function MessagePage() {
    const { friend } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [nickname, setNickname] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch Messages
    const fetchMessages = async () => {
        try {
            setMessages([]); // Clear existing messages immediately
            setLoading(true); // Start loading spinner

            const token = await AsyncStorage.getItem("token");
            const storedNickname = await AsyncStorage.getItem("nickname");

            if (!token || !storedNickname) {
                Alert.alert("Error", "Authentication failed. Please log in again.");
                return;
            }

            setNickname(storedNickname);

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
            console.error("Error Fetching Messages:", error);
            Alert.alert("Error", "Failed to fetch messages.");
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    // Handle Send Message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const token = await AsyncStorage.getItem("token");
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

    // Trigger fetching messages whenever `friend` changes
    useEffect(() => {
        fetchMessages();
        return () => {
            setMessages([]); // Clear messages when component unmounts or `friend` changes
        };
    }, [friend]); // Dependency ensures new messages are fetched for each friend

    // Show loading spinner while fetching messages
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9eb7ef" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat with {friend}</Text>
            <FlatList
                data={friends}
                keyExtractor={(item, index) => `${item}-${index}`} // Ensures unique keys
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.friendContainer}
                        onPress={() => handleStartChat(item)}
                    >
                        <Text style={styles.friendName}>{item}</Text>
                    </Pressable>
                )}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message"
                    placeholderTextColor="gray"
                />
                <Button title="Send" onPress={handleSendMessage} />
            </View>
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
        color: "white",
        marginBottom: 20,
        alignSelf: "center",
    },
    messageList: {
        flex: 1,
        marginBottom: 10,
    },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 5,
    },
    myMessage: {
        backgroundColor: "#4caf50",
        alignSelf: "flex-end",
    },
    theirMessage: {
        backgroundColor: "#333",
        alignSelf: "flex-start",
    },
    messageText: {
        color: "white",
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    input: {
        flex: 1,
        backgroundColor: "#333",
        color: "white",
        padding: 10,
        borderRadius: 10,
        marginRight: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#25292e",
    },
});
