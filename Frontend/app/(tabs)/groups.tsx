import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    Pressable,
    Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

interface Group {
    id: number;
    name: string;
}

interface GroupDetails {
    id: number;
    name: string;
    createdTime: string;
    members: string[];
}

export default function Groups() {
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nickname, setNickname] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);

    const getToken = async (): Promise<string | null> => {
        return AsyncStorage.getItem("token");
    };

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

            const response = await fetch(
                `${API_URL}/groups?nickname=${storedNickname}`,
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

            const result: APIResponse<Group[]> = await response.json();

            if (result.status === 1 && Array.isArray(result.data)) {
                setGroups(result.data);
            } else {
                Alert.alert(
                    "Error",
                    result.message || "Failed to fetch groups list."
                );
            }
        } catch (error: any) {
            console.error("Fetch Groups Error:", error);
            Alert.alert("Error", "Failed to fetch groups.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch groups when the component mounts
        setLoading(true);
        fetchGroups();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Refetch groups when the screen regains focus
            setLoading(true);
            fetchGroups();
        }, [])
    );

    const fetchGroupDetails = async (groupId: number) => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert("Error", "No token found. Please login again.");
                return;
            }

            const response = await fetch(`${API_URL}/groups/${groupId}/details`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<GroupDetails> = await response.json();
            if (result.status === 1 && result.data) {
                setSelectedGroup(result.data);
                setModalVisible(true);
            } else {
                Alert.alert(
                    "Error",
                    result.message || "Failed to fetch group details."
                );
            }
        } catch (error: any) {
            console.error("Fetch Group Details Error:", error);
            Alert.alert("Error", "Failed to fetch group details.");
        }
    };

    const renderGroup = ({ item }: { item: Group }) => (
        <View style={styles.groupContainer}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Pressable
                style={styles.infoButton}
                onPress={() => fetchGroupDetails(item.id)}
            >
                <Text style={styles.infoButtonText}>Info</Text>
            </Pressable>
        </View>
    );

    const handleCreateGroup = () => {
        router.push("./creategroup");
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.push("/login");
    };

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

            <Text style={styles.title}>Groups</Text>

            {groups.length === 0 ? (
                <Text style={styles.noGroups}>No groups found.</Text>
            ) : (
                <FlatList
                    data={groups}
                    keyExtractor={(item, index) => `${item.id}-${index}`} // Ensures unique keys
                    renderItem={renderGroup}
                />

            )}

            <View style={styles.topLeftContainer}>
                <Pressable style={styles.topButton} onPress={handleCreateGroup}>
                    <Text style={styles.topButtonText}>Create Group</Text>
                </Pressable>
            </View>

            {selectedGroup && (
                <Modal visible={modalVisible} transparent={true} animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{selectedGroup.name}</Text>
                            <Text style={styles.modalText}>
                                Created Time: {selectedGroup.createdTime}
                            </Text>
                            <Text style={styles.modalText}>Members:</Text>
                            {selectedGroup.members.map((member, index) => (
                                <Text key={index} style={styles.modalText}>
                                    {member}
                                </Text>
                            ))}
                            <Pressable
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
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
        backgroundColor: "#25292e",
        justifyContent: "center",
        alignItems: "center",
    },
    topLeftContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    topButton: {
        marginRight: 10,
    },
    topButtonText: {
        color: "white",
        fontSize: 20,
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
    noGroups: {
        color: "white",
        alignSelf: "center",
        marginTop: 30,
        fontSize: 18,
    },
    groupContainer: {
        backgroundColor: "#333",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    groupName: {
        color: "white",
        fontSize: 16,
    },
    infoButton: {
        padding: 8,
        backgroundColor: "#9eb7ef",
        borderRadius: 5,
    },
    infoButtonText: {
        color: "#25292e",
        fontSize: 14,
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        marginBottom: 5,
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#9eb7ef",
        borderRadius: 5,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#25292e",
        fontWeight: "bold",
    },
});
