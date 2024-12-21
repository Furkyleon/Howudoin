import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface APIResponse<T> {
  status: number;
  message: string;
  data: T;
}

export default function Login() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function storeToken(token: string) {
    await AsyncStorage.setItem('token', token);
  }

  async function login() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<string> = await response.json();

      if (result.status === 1) {
        const token = result.data; 
        await storeToken(token);
        await AsyncStorage.setItem("nickname", nickname);
        router.push("/mainpage");
      } else {
        Alert.alert("Error:", result.data || "Login failed. Please try again.");
      }

    } catch (error: any) {
      console.error("Fetch Error:", error.message);
      Alert.alert("Error", "Login failed. Please try again.");
    }
  }

  function goToFirstPage() {
    router.push("/");
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.noButton} onPress={goToFirstPage}>
        <Text style={styles.mainPageText}>Go Back</Text>
      </Pressable>

      <Text style={styles.title}>Login Page</Text>

      <Text style={styles.text}>Nickname:</Text>
      <TextInput 
        style={styles.input} 
        onChangeText={setNickname} 
        placeholder={"Enter a nickname..."}
        value={nickname}
      />

    <Text style={styles.text}>Email:</Text>
      <TextInput 
        style={styles.input} 
        onChangeText={setEmail} 
        placeholder={"Enter an email..."}
        value={email}
      />

      <Text style={styles.text}>Password:</Text>
      <TextInput 
        style={styles.input} 
        onChangeText={setPassword} 
        placeholder={"Enter a password..."} 
        secureTextEntry={true}
        value={password}
      />

      {/* Login button remains the same */}
      <Pressable style={styles.button} onPress={login}>
        <Text style={styles.buttontext}>Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Keep your original styles
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  noButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  mainPageText: {
    color: "white",
    fontSize: 16,
    textDecorationLine: "underline" 
  },
  title: {
    color: "#9eb7ef",
    fontSize: 30,
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  text: {
    marginTop: 5,
    fontSize: 15,
    color:"white"
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
    marginTop: 20,
    backgroundColor:"#9eb7ef",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 40,
    borderRadius: 10,
  },
  buttontext: {
    color: "white",
    fontSize: 16,
  }
});
