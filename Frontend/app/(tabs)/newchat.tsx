import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

export default function NewMessageBox() {
    const router = useRouter();
    const [friends, setFriends] = useState<string[]>([]); // Matches the structure from `friends.tsx`

    const getToken = async (): Promise<string | null> => {
        try {
            const token = await AsyncStorage.getItem("token");
            console.log("Retrieved token:", token); // Debugging token retrieval
            return token;
        } catch (error) {
            console.error("Error retrieving token:", error);
            return null;
        }
    };

    const fetchFriends = async () => {
        try {
            console.log("Fetching friends..."); // Debug
            const token = await getToken();
            const storedNickname = await AsyncStorage.getItem("nickname");

            if (!token || !storedNickname) {
                Alert.alert("Error", "Authentication failed. Please log in again.");
                console.warn("No token or nickname found"); // Debug
                router.push("/login");
                return;
            }

            console.log("Stored nickname:", storedNickname); // Debug
            const response = await fetch(`${API_URL}/friends?nickname=${storedNickname}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Friends API Response status:", response.status); // Debug response status

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response text:", errorText); // Debug response body
                throw new Error(`Failed to fetch friends. Status code: ${response.status}`);
            }

            const result = await response.json();
            console.log("Friends API Response:", result); // Debug API response

            if (result.status === 1 && Array.isArray(result.data)) {
                setFriends(result.data); // Store friends as an array of strings
                console.log("Friends set successfully:", result.data); // Debug
            } else {
                setFriends([]);
                Alert.alert("Info", result.message || "No friends found.");
                console.warn("No friends found:", result.message || "Empty list"); // Debug
            }
        } catch (error) {
            console.error("Fetch Friends Error:", error);
            Alert.alert("Error", "Failed to fetch friends.");
            setFriends([]); // Transition to empty state on error
        }
    };

    // Handle starting a chat with a friend
    const handleStartChat = (friend: string) => {
        console.log("Starting chat with:", friend); // Debug
        router.push({
            pathname: "./friendmessages",
            params: { friend },
        });
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    // Render the list of friends
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Friend</Text>

            {friends.length === 0 ? (
                <Text style={styles.noFriends}>You have no friends to start a chat with.</Text>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item, index) => `${index}-${item}`} // Ensure keys are unique
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.friendContainer}
                            onPress={() => handleStartChat(item)}
                        >
                            <Text style={styles.friendName}>{item}</Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#d8cfc8",
        padding: 20,
    },
    title: {
        fontSize: 20,
        color: "white",
        marginBottom: 20,
        alignSelf: "center",
        marginTop: 50,
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
});
