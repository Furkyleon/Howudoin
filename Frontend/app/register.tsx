import { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Pressable,
    Alert,
    ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { API_URL } from "../config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface APIResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function Register() {
    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    async function register() {
        if (!name || !lastname || !nickname || !email || !password) {
            Alert.alert("Error", "Please fill out all fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, lastname, nickname, email, password }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<string> = await response.json();

            if (result.status === 1) {
                Alert.alert("Success", result.data || "Registered successfully!");
                router.push("/login");
            } else {
                Alert.alert(
                    "Error",
                    result.data || "Registration failed. Please try again."
                );
            }
        } catch (error: any) {
            console.error("Fetch Error:", error.message);
            Alert.alert("Error", "Registration failed. Please try again.");
        }
    }

    function goToFirstPage() {
        router.push("/");
    }

    return (
        <ImageBackground
            source={require("../assets/images/friendsbg3.jpg")}
            style={styles.background}
        >
            <View style={styles.container}>
                <Pressable style={styles.noButton} onPress={goToFirstPage}>
                    <FontAwesome name="chevron-left" size={24} color="black" />
                </Pressable>

                <Text style={styles.title}>Register Page</Text>

                <TextInput
                    style={styles.input}
                    onChangeText={(x) => setName(x)}
                    placeholder={"Enter a name..."}
                    value={name}
                />

                <TextInput
                    style={styles.input}
                    onChangeText={(x) => setLastname(x)}
                    placeholder={"Enter a lastname..."}
                    value={lastname}
                />

                <TextInput
                    style={styles.input}
                    onChangeText={(x) => setNickname(x)}
                    placeholder={"Enter a nickname..."}
                    value={nickname}
                />

                <TextInput
                    style={styles.input}
                    onChangeText={(x) => setEmail(x)}
                    placeholder={"Enter an email..."}
                    value={email}
                />

                <TextInput
                    style={styles.input}
                    onChangeText={(x) => setPassword(x)}
                    placeholder={"Enter a password..."}
                    secureTextEntry={true}
                    value={password}
                />

                <Pressable style={styles.button} onPress={register}>
                    <Text style={styles.buttontext}>Register</Text>
                </Pressable>
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
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "#4CAF50",
        fontSize: 30,
        marginBottom: 20,
        fontWeight: "bold",
    },
    text: {
        marginTop: 5,
        fontSize: 17,
        color: "white",
        fontWeight: "bold",
    },
    input: {
        marginTop: 10,
        width: 200,
        height: 40,
        borderWidth: 1,
        borderColor: "black",
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        padding: 10,
        margin: 10,
    },
    button: {
        marginTop: 15,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
        width: 140,
        height: 40,
        borderRadius: 10,
    },
    buttontext: {
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
