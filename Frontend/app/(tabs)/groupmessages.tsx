import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Alert, Pressable,
} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface Message {
    id: number;
    sender: string;
    content: string;
}

export default function GroupMessages() {
    const { groupId, groupName } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [nickname, setNickname] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchMessages = async () => {
        if (!groupId) {
            Alert.alert("Error", "Group ID is missing. Cannot fetch messages.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            const storedNickname = await AsyncStorage.getItem("nickname");

            if (!token || !storedNickname) {
                Alert.alert("Error", "Authentication failed. Please log in again.");
                return;
            }

            setNickname(storedNickname);

            const response = await fetch(`${API_URL}/groups/${groupId}/messages`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

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
                content: newMessage.trim(),
            };

            const response = await fetch(`${API_URL}/groups/${groupId}/send`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            });

            const result = await response.json();
            if (result.status === 1) {
                // @ts-ignore
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
    }, [groupId]);

    function goBack() {
        router.push("/(tabs)/chats");
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={goBack}>
                    <FontAwesome name="chevron-left" size={23} color="black" />
                </Pressable>
                <Text style={styles.title}>{groupName + "  "}</Text>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <View
                            key={`${message.id || index}`}
                            style={
                                [
                                    styles.messageBubble,
                                    message.sender === nickname
                                        ? styles.messageRight
                                        : styles.messageLeft,
                                ]
                            }
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
                <Pressable onPress={handleSendMessage}>
                    <FontAwesome size={25} name="send" color={"black"} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#d8cfc8",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        color: "#333",
        alignSelf: "center",
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
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
        backgroundColor: "#7bc87f",
        alignSelf: "flex-end",
    },
    messageLeft: {
        backgroundColor: "#aeaeae",
        alignSelf: "flex-start",
    },
    messageText: {
        color: "white",
        fontSize: 16,
    },
    messageSender: {
        color: "#fff1f1",
        fontSize: 12,
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
    input: {
        flex: 1,
        backgroundColor: "white",
        color: "black",
        padding: 10,
        borderRadius: 10,
        marginRight: 10,
    },
    noMessagesText: {
        color: "gray",
        textAlign: "center",
        marginTop: 20,
        fontSize: 17,
    },
    backButton: {
        justifyContent: "center",
    },
});
