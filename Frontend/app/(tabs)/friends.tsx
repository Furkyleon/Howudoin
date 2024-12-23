import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    Pressable,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function Friends() {
    const router = useRouter();
    const [friends, setFriends] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nickname, setNickname] = useState<string | null>(null);

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

            setNickname(storedNickname);

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

    useEffect(() => {
        fetchFriends();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchFriends();
        }, [])
    );

    const handleAddFriend = () => {
        router.push("./addfriend");
    };

    const handleFriendRequests = () => {
        router.push("./friendrequests");
    };

    const renderFriend = ({ item }: { item: string }) => (
        <View style={styles.friendContainer}>
            <Text style={styles.friendName}>{item}</Text>
        </View>
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

            <Text style={styles.title}>Friends</Text>

            {friends.length === 0 ? (
                <Text style={styles.noFriends}>No friends found.</Text>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item, index) => `${index}-${item}`}
                    renderItem={renderFriend}
                />
            )}

            <Pressable style={styles.topButton} onPress={handleAddFriend}>
                <Text style={styles.topButtonText}>Add Friend</Text>
            </Pressable>
            <Pressable style={styles.topButton} onPress={handleFriendRequests}>
                <Text style={styles.topButtonText}>Friend Requests</Text>
            </Pressable>
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#25292e",
    },
    title: {
        color: "#9eb7ef",
        fontSize: 24,
        fontWeight: "bold",
        alignSelf: "center",
        marginBottom: 20,
    },
    noFriends: {
        color: "white",
        alignSelf: "center",
        fontSize: 18,
        marginTop: 30,
    },
    friendContainer: {
        backgroundColor: "#333",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    friendName: {
        color: "white",
        fontSize: 16,
    },
    topButton: {
        marginTop: 20,
        backgroundColor: "#55af55",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        height: 40,
    },
    topButtonText: {
        color: "white",
        fontSize: 16,
    },
});
