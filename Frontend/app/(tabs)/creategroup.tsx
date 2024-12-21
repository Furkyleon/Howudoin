import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function CreateGroup() {
    const router = useRouter();
    const [groupName, setGroupName] = useState<string>("");
    const [members, setMembers] = useState<string>("");
    const [creator, setCreator] = useState<string>("");

    useEffect(() => {
        async function fetchNickname() {
            const storedNickname = await AsyncStorage.getItem("nickname");
            if (storedNickname) {
                setCreator(storedNickname);
            } else {
                Alert.alert("Error", "No nickname found. Please login again.");
                router.push("/login");
            }
        }

        fetchNickname();
    }, []);

    async function getToken(): Promise<string | null> {
        return AsyncStorage.getItem('token');
    }

    async function handleCreateGroup() {
        if (!groupName) {
            Alert.alert("Error", "Please enter a group name.");
            return;
        }
        if (!members) {
            Alert.alert("Error", "Please enter at least one group member.");
            return;
        }

        const memberList = members.split(",").map(member => member.trim());

        try {
            const token = await getToken();
            if (!token) {
                Alert.alert("Error", "No token found. Please login again.");
                router.push("/login");
                return;
            }

            const response = await fetch(`${API_URL}/groups/create`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    groupName,
                    members: memberList,
                    creatorName: creator
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<string> = await response.json();
            if (result.status === 1) {
                Alert.alert("Success", result.message || "Group created successfully!");
                setGroupName("");
                setMembers("");
            } else {
                Alert.alert("Error", result.message || "Failed to create group.");
            }
        } catch (error: any) {
            console.error("Create Group Error:", error);
            Alert.alert("Error", "An error occurred while creating the group.");
        }
    }

    function goToGroups() {
        router.push("/groups");
    }

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={goToGroups}>
                <Text style={styles.mainPageText}>Go Back</Text>
            </Pressable>

            <Text style={styles.title}>Create a Group</Text>

            <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor="#666"
            />

            <TextInput
                style={styles.input}
                value={members}
                onChangeText={setMembers}
                placeholder="Enter member nicknames (comma-separated)"
                placeholderTextColor="#666"
            />

            <Pressable style={styles.createButton} onPress={handleCreateGroup}>
                <Text style={styles.createButtonText}>Create Group</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
        paddingTop: 30,
        paddingHorizontal: 20,
    },
    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
    },
    backButtonText: {
        color: "white",
        fontSize: 16,
        textDecorationLine: "underline",
    },
    title: {
        color: "#9eb7ef",
        fontSize: 24,
        marginBottom: 20,
        fontWeight: "bold",
        alignSelf: "center",
        marginTop: 40,
    },
    input: {
        backgroundColor: "#333",
        borderRadius: 10,
        height: 40,
        paddingHorizontal: 10,
        color: "white",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#555",
        textAlign: "center",
    },
    createButton: {
        backgroundColor: "#55af55",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        height: 40,
    },
    createButtonText: {
        color: "white",
        fontSize: 16,
    },
    mainPageText: {
        color: "white",
        fontSize: 16,
        textDecorationLine: "underline",
    },
});
