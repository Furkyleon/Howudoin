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

interface Group {
    id: number;
    name: string;
}

export default function MainPage() {
    const router = useRouter();
    const [chatPartners, setChatPartners] = useState<string[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
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

            // Fetch personal chats
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

            // Fetch group chats
            const groupResponse = await fetch(`${API_URL}/groups?nickname=${storedNickname}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!groupResponse.ok) {
                throw new Error(`Failed to fetch groups. Status code: ${groupResponse.status}`);
            }

            const groupResult = await groupResponse.json();

            if (groupResult.status === 1 && Array.isArray(groupResult.data)) {
                setGroups(groupResult.data);
            } else {
                setGroups([]);
                Alert.alert("Info", groupResult.message || "No groups found.");
            }
        } catch (error) {
            console.error("Fetch Chats Error:", error);
            Alert.alert("Error", "Failed to fetch chats and groups.");
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        router.push("/(tabs)/newchat");
    };

    const handleOpenChat = (partner: string) => {
        router.push({
            pathname: "/(tabs)/friendmessages",
            params: { friend: partner },
        });
    };

    const handleOpenGroup = (groupId: number, groupName: string) => {
        router.push({
            pathname: "/(tabs)/groupmessages",
            params: { groupId, groupName },
        });
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.push("/login");
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchChats();
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
                data={[...chatPartners, ...groups.map((group) => `group-${group.id}`)]}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => {
                    if (item.startsWith("group-")) {
                        const groupId = parseInt(item.split("-")[1], 10);
                        const group = groups.find((g) => g.id === groupId);
                        return (
                            <Pressable
                                style={styles.chatContainer}
                                onPress={() => group && handleOpenGroup(group.id, group.name)}
                            >
                                <Text style={styles.chatFriend}>{group?.name}</Text>
                            </Pressable>
                        );
                    }
                    return (
                        <Pressable
                            style={styles.chatContainer}
                            onPress={() => handleOpenChat(item)}
                        >
                            <Text style={styles.chatFriend}>{item}</Text>
                        </Pressable>
                    );
                }}
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
    subTitle: {
        color: "#9eb7ef",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
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
