import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

export default function NewMessageBox() {
    const router = useRouter();
    const [friends, setFriends] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getToken = async (): Promise<string | null> => {
        return AsyncStorage.getItem("token");
    };

    const fetchFriends = async () => {
        try {
            const token = await getToken();
            const storedNickname = await AsyncStorage.getItem("nickname");

            if (!token || !storedNickname) {
                Alert.alert("Error", "Authentication failed. Please log in again.");
                router.push("/login");
                return;
            }

            const response = await fetch(`${API_URL}/friends?nickname=${storedNickname}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (result.status === 1 && Array.isArray(result.data)) {
                setFriends(result.data);
            } else {
                setFriends([]);
                console.warn("No friends found:", result.message || "Empty list");
            }
        } catch (error) {
            console.error("Fetch Friends Error:", error);
            Alert.alert("Error", "Failed to fetch friends.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = (friend: string) => {
        console.log("Starting chat with:", friend);
        router.replace({
            pathname: "/(tabs)/message", // Replace ensures correct routing
            params: { friend },
        });
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9eb7ef" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Friend</Text>
            {friends.length > 0 ? (
                <FlatList
                    data={friends}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.friendContainer}
                            onPress={() => handleStartChat(item)}
                        >
                            <Text style={styles.friendName}>{item}</Text>
                        </Pressable>
                    )}
                />
            ) : (
                <Text style={styles.noFriends}>No friends found.</Text>
            )}
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
    title: {
        color: "#9eb7ef",
        fontSize: 24,
        fontWeight: "bold",
        alignSelf: "center",
        marginBottom: 20,
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#25292e",
    },
    noFriends: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
    },
});
