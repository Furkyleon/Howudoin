import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    Alert,
} from "react-native";
import {router, useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function NewMessageBox() {
    const router = useRouter();
    const [friends, setFriends] = useState<string[]>([]);

    const getToken = async (): Promise<string | null> => {
        try {
            const token = await AsyncStorage.getItem("token");
            return token;
        } catch (error) {
            console.error("Error retrieving token:", error);
            return null;
        }
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

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response text:", errorText);
                throw new Error(`Failed to fetch friends. Status code: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 1 && Array.isArray(result.data)) {
                setFriends(result.data);
            } else {
                setFriends([]);
                Alert.alert("Info", result.message || "No friends found.");
            }
        } catch (error) {
            console.error("Fetch Friends Error:", error);
            Alert.alert("Error", "Failed to fetch friends.");
            setFriends([]);
        }
    };

    const handleStartChat = (friend: string) => {
        router.push({
            pathname: "./friendmessages",
            params: { friend },
        });
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    function goBack() {
        router.push("/(tabs)/chats");
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={goBack}>
                    <FontAwesome name="chevron-left" size={23} color="black" />
                </Pressable>
                <Text style={styles.title}>Select a Friend {" "}</Text>
            </View>

            {friends.length === 0 ? (
                <View>
                    <Text style={styles.noFriends1}>You have no friends to</Text>
                    <Text style={styles.noFriends2}>start a chat with.</Text>
                </View>
            ) : (
                <FlatList
                    data={friends}
                    keyExtractor={(item, index) => `${index}-${item}`}
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
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        color: "#333",
        alignSelf: "center",
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    friendContainer: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    friendName: {
        color: "#333",
        fontSize: 18,
        fontWeight: "bold",
    },
    noFriends1: {
        color: "white",
        fontSize: 20,
        textAlign: "center",
        marginTop: 20,
    },
    noFriends2: {
        color: "white",
        fontSize: 20,
        textAlign: "center",
    },
    backButton: {
        justifyContent: "center",
    },
});
