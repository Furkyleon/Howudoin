import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function Groups() {
    const router = useRouter();
    const [groups, setGroups] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nickname, setNickname] = useState<string | null>(null);

    async function getToken(): Promise<string | null> {
        return AsyncStorage.getItem("token");
    }

    const fetchGroups = async () => {
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

            const response = await fetch(`${API_URL}/groups?nickname=${storedNickname}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<string[]> = await response.json();
            if (result.status === 1 && Array.isArray(result.data)) {
                setGroups(result.data);
            } else {
                Alert.alert("Error", result.message || "Failed to fetch groups list.");
            }
        } catch (error: any) {
            console.error("Fetch Groups Error:", error);
            Alert.alert("Error", "Failed to fetch groups.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const openGroupMessages = (groupName: string) => {
        router.push({
            pathname: "./groupmessages",
            params: { groupName },
        });
    };

    const renderGroup = ({ item }: { item: string }) => (
        <Pressable style={styles.groupContainer} onPress={() => openGroupMessages(item)}>
            <Text style={styles.groupName}>{item}</Text>
        </Pressable>
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
            <Text style={styles.title}>Groups</Text>

            {groups.length === 0 ? (
                <Text style={styles.noGroups}>No groups found.</Text>
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={(item, index) => `${index}-${item}`}
                    renderItem={renderGroup}
                />
            )}
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
    loadingContainer: {
        flex: 1,
        backgroundColor: "#25292e",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "#9eb7ef",
        fontSize: 24,
        marginBottom: 20,
        fontWeight: "bold",
        alignSelf: "center",
    },
    noGroups: {
        color: "white",
        alignSelf: "center",
        fontSize: 18,
        marginTop: 30,
    },
    groupContainer: {
        backgroundColor: "#333",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    groupName: {
        color: "white",
        fontSize: 16,
    },
});
