import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface Message {
    id: number;
    sender: string;
    receiver: string;
    content: string;
}

export default function FriendMessages() {
    const { friend } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [nickname, setNickname] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchMessages = async () => {
        try {
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
        }
    };

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

    useEffect(() => {
        fetchMessages();

        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => {
            clearInterval(interval);
            setMessages([]);
        };
    }, [friend]);



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat with {friend}</Text>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <View
                            key={`${message.id || index}`}
                            style={[
                                styles.messageBubble,
                                message.sender === nickname
                                    ? styles.messageRight
                                    : styles.messageLeft,
                            ]}
                        >
                            <Text style={styles.messageText}>{message.content}</Text>
                            <Text style={styles.messageSender}>{message.sender}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noMessagesText}>No messages yet</Text>
                )}
            </ScrollView>
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
        marginTop: 40,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 10,
    },
    messageBubble: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 5,
    },
    messageRight: {
        backgroundColor: "#4caf50",
        alignSelf: "flex-end",
    },
    messageLeft: {
        backgroundColor: "#333",
        alignSelf: "flex-start",
    },
    messageText: {
        color: "white",
        fontSize: 16,
    },
    messageSender: {
        color: "gray",
        fontSize: 12,
        marginTop: 5,
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
    noMessagesText: {
        color: "gray",
        textAlign: "center",
        marginTop: 20,
    },
});