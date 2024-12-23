import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    Pressable,
    ImageBackground,
    ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function Friends() {
    const router = useRouter();
    const [friends, setFriends] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getToken = async (): Promise<string | null> => {
        return AsyncStorage.getItem("token");
    };

    const fetchFriends = async () => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert("Error", "No token found. Please login again.");
                router.push("/login");
                return;
            }

            const storedNickname = await AsyncStorage.getItem("nickname");
            if (!storedNickname) {
                Alert.alert("Error", "No nickname found. Please login again.");
                router.push("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/friends?nickname=${storedNickname}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<string[]> = await response.json();
            if (result.status === 1 && Array.isArray(result.data)) {
                setFriends(result.data);
            } else {
                Alert.alert("Error", result.message || "Failed to fetch friends list.");
            }
        } catch (error) {
            console.error("Fetch Friends Error:", error);
            Alert.alert("Error", "Failed to fetch friends.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.push("/login");
    };

    const handleAddFriend = () => {
        router.push("./addfriend");
    };

    const handleFriendRequests = () => {
        router.push("./friendrequests");
    };

    const renderFriend = ({ item }: { item: string }) => (
        <Pressable style={styles.friendContainer}>
            <View style={styles.friendContent}>
                <FontAwesome size={20} name="user" color={"black"} />
                <Text style={styles.friendName}>{item}</Text>
            </View>
        </Pressable>
    );

    useFocusEffect(
        React.useCallback(() => {
            fetchFriends();
        }, [])
    );

    return (
        <ImageBackground
            source={require("../../assets/images/friendsbg3.jpg")}
            style={styles.background}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{"  "} Friends</Text>
                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <FontAwesome size={28} name="sign-out" color={"black"} />
                    </Pressable>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                ) : friends.length === 0 ? (
                    <Text style={styles.noFriends}>No friends found.</Text>
                ) : (
                    <FlatList
                        data={friends}
                        keyExtractor={(item, index) => `${index}-${item}`}
                        renderItem={renderFriend}
                    />
                )}

                <View style={styles.buttonRow}>
                    <Pressable style={styles.addButton} onPress={handleAddFriend}>
                        <Text style={styles.addButtonText}>Add Friend</Text>
                    </Pressable>
                    <Pressable style={styles.requestsButton} onPress={handleFriendRequests}>
                        <Text style={styles.requestsButtonText}>Friend Requests</Text>
                    </Pressable>
                </View>
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
    },
    title: {
        color: "#333",
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    logoutButton: {
        justifyContent: "center",
    },
    logoutButtonText: {
        color: "black",
        fontSize: 16,
        fontWeight: "bold",
    },
    noFriends: {
        color: "white",
        alignSelf: "center",
        fontSize: 18,
        marginTop: 30,
    },
    friendContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        width: "90%",
    },
    friendContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    friendName: {
        color: "#333",
        fontSize: 17,
        fontWeight: "bold",
        marginLeft: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
        marginBottom: 15,
    },
    addButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "48%",
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    requestsButton: {
        backgroundColor: "#3498db",
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        width: "48%",
    },
    requestsButtonText: {
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
