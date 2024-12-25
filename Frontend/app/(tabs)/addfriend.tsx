import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Alert,
} from "react-native";
import { router, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function AddFriend() {
    const router = useRouter();
    const [receiver, setFriendNickname] = useState<string>("");
    const [sender, setSenderNickname] = useState<string>("");

    useEffect(() => {
        async function fetchNickname() {
            const storedNickname = await AsyncStorage.getItem("nickname");
            if (storedNickname) {
                setSenderNickname(storedNickname);
            } else {
                Alert.alert("Error", "No nickname found. Please login again.");
                router.push("/login");
            }
        }

        fetchNickname();
    }, []);

    async function getToken(): Promise<string | null> {
        return AsyncStorage.getItem("token");
    }

    async function handleAddFriend() {
        if (!receiver) {
            Alert.alert("Error", "Please enter your friend's nickname.");
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                Alert.alert("Error", "No token found. Please login again.");
                router.push("/login");
                return;
            }

            const response = await fetch(`${API_URL}/friends/add`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sender, receiver }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<string> = await response.json();
            if (result.status === 1) {
                Alert.alert("Success", result.message || "Friend request sent!");
                setFriendNickname("");
            } else {
                Alert.alert("Error", result.data || "Failed to send friend request.");
            }
        } catch (error: any) {
            console.error("Add Friend Error:", error);
            Alert.alert(
                "Error",
                "An error occurred while sending the friend request."
            );
        }
    }


    function goBack() {
        router.push("/(tabs)/friends");
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={goBack}>
                    <FontAwesome name="chevron-left" size={23} color="black" />
                </Pressable>
                <Text style={styles.title}>Add a Friend {" "}</Text>
            </View>

            <TextInput
                style={styles.input}
                value={receiver}
                onChangeText={setFriendNickname}
                placeholder="Enter friend's nickname"
                placeholderTextColor="#666"
            />

            <Pressable style={styles.addButton} onPress={handleAddFriend}>
                <Text style={styles.addButtonText}>Send Request</Text>
            </Pressable>
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
        marginBottom: 40,
    },
    backButton: {
        justifyContent: "center",
    },
    title: {
        fontSize: 30,
        color: "#333",
        alignSelf: "center",
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    label: {
        color: "white",
        fontSize: 16,
        marginBottom: 10,
        marginTop: 10,
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        height: 40,
        paddingHorizontal: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#555",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        textAlign: "center",
        width: "90%",
    },
    addButton: {
        marginBottom: 15,
        backgroundColor: "#55af55",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        height: 50,
        width: "50%",
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
    },
    noButton: {
        position: "absolute",
        top: 40,
        left: 20,
    },
    mainPageText: {
        color: "white",
        fontSize: 16,
        textDecorationLine: "underline",
    },
});
