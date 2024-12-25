import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    Pressable,
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

interface FriendRequest {
    sender: string;
    receiver: string;
}

export default function FriendRequests() {
    const router = useRouter();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nickname, setNickname] = useState<string | null>(null);

    const getToken = async (): Promise<string | null> => {
        return AsyncStorage.getItem("token");
    };

    const fetchRequests = async () => {
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
                `${API_URL}/friends/requests?receiverNickname=${storedNickname}`,
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

            const result: APIResponse<FriendRequest[]> = await response.json();
            if (result.status === 1 && Array.isArray(result.data)) {
                setRequests(result.data);
            } else {
                Alert.alert(
                    "Error",
                    result.message || "Failed to fetch friend requests."
                );
            }
        } catch (error: any) {
            console.error("Fetch Friend Requests Error:", error);
            Alert.alert("Error", "Failed to fetch friend requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const acceptRequest = async (sender: string) => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert("Error", "No token found. Please login again.");
                router.push("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/friends/accept?senderNickname=${sender}&receiverNickname=${nickname}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sender,
                        receiver: nickname,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<string> = await response.json();
            Alert.alert("Response", result.message || "Friend request accepted.");

            // Remove the accepted request from the local state
            setRequests((prevRequests) =>
                prevRequests.filter((request) => request.sender !== sender)
            );

            // Refresh requests from backend to ensure consistency
            await fetchRequests();
        } catch (error: any) {
            console.error("Accept Friend Request Error:", error);
            Alert.alert("Error", "Failed to accept the friend request.");
        }
    };

    const renderRequest = ({ item }: { item: FriendRequest }) => (
        <View style={styles.requestContainer}>
            <Text style={styles.requestText}>
                {item.sender} wants to be your friend.
            </Text>
            <Pressable style={styles.requestButton} onPress={() => acceptRequest(item.sender)}>
                <Text style={styles.acceptText}>Accept</Text>
            </Pressable>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9eb7ef" />
            </View>
        );
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
                <Text style={styles.title}>Friend Requests {" "}</Text>
            </View>

            {requests.length === 0 ? (
                <Text style={styles.noRequests}>No friend requests.</Text>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item, index) => `${index}-${item.sender}`}
                    renderItem={renderRequest}
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
        marginBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#25292e",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 30,
        color: "#333",
        alignSelf: "center",
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    noRequests: {
        color: "white",
        fontSize: 20,
        textAlign: "center",
        marginTop: 20,
    },
    requestContainer: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    requestText: {
        color: "#333",
        fontSize: 16,
        marginBottom: 10,
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
    backButton: {
        justifyContent: "center",
    },
    requestButton: {
        alignItems: "center",
    },
    acceptText: {
        marginTop: 10,
        color: "blue",
        fontSize: 16,
    }
});
