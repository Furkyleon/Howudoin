import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

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

    async function getToken(): Promise<string | null> {
        return AsyncStorage.getItem('token');
    }

    useEffect(() => {
        async function fetchFriends() {
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

                const response = await fetch(`${API_URL}/friends?nickname=${storedNickname}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result: APIResponse<string[]> = await response.json();
                if (result.status === 1 && Array.isArray(result.data)) {
                    setFriends(result.data);
                } else {
                    Alert.alert("Error", result.message || "Failed to fetch friends list.");
                }
            } catch (error: any) {
                console.error("Fetch Friends Error:", error);
                Alert.alert("Error", "Failed to fetch friends.");
            } finally {
                setLoading(false);
            }
        }

        fetchFriends();
    }, [router]);

    const renderFriend = ({ item }: { item: string }) => (
        <View style={styles.friendContainer}>
            <Text style={styles.friendName}>{item}</Text>
        </View>
    );

    function handleAddFriend() {
        router.push("./addfriend");
    }

    function handleFriendRequests() {
        router.push("./friendrequests");
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9eb7ef" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
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

            <View style={styles.topLeftContainer}>
                <Pressable style={styles.topButton} onPress={handleAddFriend}>
                    <Text style={styles.topButtonText}>Add Friend</Text>
                </Pressable>
            </View>
            <View style={styles.topLeftContainer}>
                <Pressable style={styles.topButton} onPress={handleFriendRequests}>
                    <Text style={styles.topButtonText}>Friend Requests</Text>
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
        paddingHorizontal: 20
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#25292e",
        justifyContent: "center",
        alignItems: "center"
    },
    topLeftContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    topButton: {
        marginRight: 10
    },
    topButtonText: {
        color: "white",
        fontSize: 20,
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
    noFriends: {
        color: "white",
        alignSelf: "center",
        marginTop: 30,
        fontSize: 18
    },
    friendContainer: {
        backgroundColor: "#333",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15
    },
    friendName: {
        color: "white",
        fontSize: 16
    }
});
