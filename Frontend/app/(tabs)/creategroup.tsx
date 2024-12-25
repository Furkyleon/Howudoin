import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    Pressable,
    Alert,
    Button,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function CreateGroup() {
    const router = useRouter();
    const [groupName, setGroupName] = useState<string>("");
    const [groupMembers, setGroupMembers] = useState<string[]>([]);
    const [friends, setFriends] = useState<string[]>([]);
    const [creator, setCreator] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

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

        async function fetchFriends() {
            try {
                const token = await AsyncStorage.getItem("token");
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
                    Alert.alert(
                        "Error",
                        result.message || "Failed to fetch friends list."
                    );
                }
            } catch (error: any) {
                console.error("Fetch Friends Error:", error);
                Alert.alert("Error", "Failed to fetch friends.");
            } finally {
                setLoading(false);
            }
        }

        fetchNickname();
        fetchFriends();
    }, []);

    const addToGroup = (friend: string) => {
        if (groupMembers.includes(friend)) {
            Alert.alert("Info", `${friend} is already in the group.`);
            return;
        }
        setGroupMembers((prev) => [...prev, friend]);
    };

    const handleCreateGroup = async () => {
        if (!groupName) {
            Alert.alert("Error", "Please enter a group name.");
            return;
        }

        if (groupMembers.length === 0) {
            Alert.alert("Error", "Please add at least one member to the group.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Error", "No token found. Please login again.");
                router.push("/login");
                return;
            }

            const response = await fetch(`${API_URL}/groups/create`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    groupName,
                    members: groupMembers,
                    creatorName: creator,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<string> = await response.json();
            if (result.status === 1) {
                Alert.alert("Success", result.message || "Group created successfully!");
                setGroupName("");
                setGroupMembers([]);
            } else {
                Alert.alert("Error", result.message || "Failed to create group.");
            }
        } catch (error: any) {
            console.error("Create Group Error:", error);
            Alert.alert("Error", "An error occurred while creating the group.");
        }
    };

    const renderFriend = ({ item }: { item: string }) => (
        <View style={styles.friendContainer}>
            <Text style={styles.friendName}>{item}</Text>
            <Pressable onPress={() => addToGroup(item)}>
                <FontAwesome size={25} name="plus-circle" color={"black"} />
            </Pressable>
        </View>
    );

    function goBack() {
        router.push("/(tabs)/groups");
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={goBack}>
                    <FontAwesome name="chevron-left" size={23} color="black" />
                </Pressable>
                <Text style={styles.title}>Create a Group {" "}</Text>
            </View>

            <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor="#666"
            />

            <Pressable style={styles.createButton} onPress={handleCreateGroup}>
                <Text style={styles.createButtonText}>Create Group</Text>
            </Pressable>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Choose friend(s) to add:</Text>
                {loading ? (
                    <Text style={styles.loadingText}>Loading friends...</Text>
                ) : friends.length === 0 ? (
                    <Text style={styles.noFriends}>No friends found.</Text>
                ) : (
                    <FlatList
                        data={friends}
                        keyExtractor={(item, index) => `${index}-${item}`}
                        renderItem={renderFriend}
                        style={styles.friendsList}
                    />
                )}

                <View style={styles.membersContainer}>
                    <Text style={styles.sectionTitle}>Added friend(s) to group:</Text>
                    {groupMembers.length === 0 ? (
                        <Text style={styles.noMembers}>No members added yet.</Text>
                    ) : (
                        groupMembers.map((member, index) => (
                            <View key={index} style={styles.friendContainer}>
                                <Text style={styles.friendName}>{member}</Text>
                            </View>
                        ))
                    )}
                </View>
            </View>
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
    mainPageText: {
        color: "white",
        fontSize: 16,
        textDecorationLine: "underline",
    },
    title: {
        fontSize: 30,
        color: "#333",
        alignSelf: "center",
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        height: 40,
        paddingHorizontal: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "#555",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        textAlign: "center",
        width: "90%",
    },
    sectionTitle: {
        color: "blue",
        fontSize: 20,
        marginBottom: 20,
        textDecorationLine: "underline",
    },
    loadingText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
    },
    noFriends: {
        color: "white",
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
    },
    friendContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: "60%",
    },
    friendName: {
        color: "#616161",
        fontSize: 16,
        marginLeft: 5,
        fontWeight: "bold",
    },
    memberName: {
        color: "#616161",
        fontSize: 16,
        marginBottom: 5,
    },
    noMembers: {
        color: "white",
        fontSize: 18,
        textAlign: "center",
        fontWeight: "bold",
    },
    createButton: {
        marginBottom: 30,
        backgroundColor: "#3498db",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        height: 50,
        width: "50%",
    },
    createButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },

    sectionContainer: {
        marginTop: 20,
    },
    friendsList: {
        marginBottom: 20, // Add some spacing between the friends list and the added members section
    },
    membersContainer: {
        marginTop: 10, // Pull this closer to the "Choose friend(s) to add" section
    },
});
