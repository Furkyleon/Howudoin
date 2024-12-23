import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Pressable,
    Alert,
    ImageBackground,
    ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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
                const uniquePartners: string[] = Array.from(
                    new Set(
                        result.data
                            .filter(
                                (msg: Message) =>
                                    msg.sender === storedNickname || msg.receiver === storedNickname
                            )
                            .map((msg: Message) =>
                                msg.sender === storedNickname ? msg.receiver : msg.sender
                            )
                    )
                ) as string[];
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

    return (
        <ImageBackground
            source={require("../../assets/images/friendsbg3.jpg")}
            style={styles.background}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{"  "} Chats</Text>
                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <FontAwesome size={28} name="sign-out" color={"black"} />
                    </Pressable>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
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
                                            onPress={() =>
                                                group && handleOpenGroup(group.id, group.name)
                                            }
                                        >
                                            <View style={styles.chatText}>
                                                <FontAwesome size={20} name="group" color={"blue"} />
                                                <Text style={styles.chatGroup}>{group?.name}</Text>
                                            </View>
                                        </Pressable>
                                    );
                                }
                                return (
                                    <Pressable
                                        style={styles.chatContainer}
                                        onPress={() => handleOpenChat(item)}
                                    >
                                        <View style={styles.chatText2}>
                                            <FontAwesome size={20} name="user" color={"red"} />
                                            <Text style={styles.chatFriend}>{item}</Text>
                                        </View>
                                    </Pressable>
                                );
                            }}
                        />
                        <Pressable style={styles.newChatButton} onPress={handleNewChat}>
                            <Text style={styles.newChatButtonText}>New Chat</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    logoutButton: {
        justifyContent: "center",
    },
    title: {
        color: "#333",
        fontSize: 32,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    chatContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        width: "90%",
    },
    chatText: {
        flexDirection: "row",
        alignItems: "center",
    },
    chatText2: {
        marginLeft: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    chatGroup: {
        color: "blue",
        fontSize: 17,
        fontWeight: "bold",
        marginLeft: 10,
    },
    chatFriend: {
        color: "red",
        fontSize: 17,
        fontWeight: "bold",
        marginLeft: 14,
    },
    newChatButton: {
        backgroundColor: "rgba(76, 175, 80, 1)",
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 15,
        width: "50%",
        marginBottom: 15,
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
    },
});
