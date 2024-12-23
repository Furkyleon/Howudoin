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
    ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);

    const getToken = async (): Promise<string | null> => {
        return AsyncStorage.getItem("token");
    };

    const fetchGroups = async () => {
        setLoading(true);
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
                Alert.alert("Error", result.message || "Failed to fetch groups list.");
            }
        } catch (error: any) {
            console.error("Fetch Groups Error:", error);
            Alert.alert("Error", "Failed to fetch groups.");
        } finally {
            setLoading(false);
        }
    };

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
                Alert.alert("Error", result.message || "Failed to fetch group details.");
            }
        } catch (error: any) {
            console.error("Fetch Group Details Error:", error);
            Alert.alert("Error", "Failed to fetch group details.");
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchGroups();
        }, [])
    );

    const handleCreateGroup = () => {
        router.push("./creategroup");
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.push("/login");
    };

    const renderGroup = ({ item }: { item: Group }) => (
        <Pressable style={styles.groupContainer} onPress={() => fetchGroupDetails(item.id)}>
            <View style={styles.groupContent}>
                <FontAwesome size={20} name="group" color={"black"} />
                <Text style={styles.groupName}>{item.name}</Text>
            </View>
        </Pressable>
    );

    return (
        <ImageBackground
            source={require("../../assets/images/friendsbg3.jpg")}
            style={styles.background}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{"  "} Groups</Text>
                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <FontAwesome size={28} name="sign-out" color={"black"} />
                    </Pressable>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                ) : groups.length === 0 ? (
                    <Text style={styles.noGroups}>No groups found.</Text>
                ) : (
                    <FlatList
                        data={groups}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderGroup}
                    />
                )}

                <Pressable style={styles.createGroupButton} onPress={handleCreateGroup}>
                    <Text style={styles.createGroupButtonText}>Create Group</Text>
                </Pressable>

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
    noGroups: {
        color: "white",
        alignSelf: "center",
        fontSize: 18,
        marginTop: 30,
    },
    groupContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        width: "90%",
    },
    groupContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    groupName: {
        color: "#333",
        fontSize: 17,
        fontWeight: "bold",
        marginLeft: 10,
    },
    createGroupButton: {
        backgroundColor: "#3498db",
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15,
        marginBottom: 15,
        width: "50%",
        alignSelf: "center",
    },
    createGroupButtonText: {
        color: "white",
        fontSize: 16,
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
