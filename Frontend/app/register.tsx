import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { router } from "expo-router";

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
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, lastname, nickname, email, password })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<string> = await response.json();

      if (result.status === 1) {
        Alert.alert("Success", result.data || "Registered successfully!");
        router.push("/login");
      } else {
        Alert.alert("Error", result.data || "Registration failed. Please try again.");
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
    <View style={styles.container}>
    <Pressable style={styles.noButton} onPress={goToFirstPage}>
        <Text style={styles.mainPageText}>Go back</Text>
    </Pressable>

      <Text style={styles.title}>Register Page</Text>

      <Text style={styles.text}>Name:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(x) => setName(x)}
        placeholder={"Enter a name..."}
        value={name}
      />

      <Text style={styles.text}>Lastname:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(x) => setLastname(x)}
        placeholder={"Enter a lastname..."}
        value={lastname}
      />

      <Text style={styles.text}>Nickname:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(x) => setNickname(x)}
        placeholder={"Enter a nickname..."}
        value={nickname}
      />

      <Text style={styles.text}>Email:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(x) => setEmail(x)}
        placeholder={"Enter an email..."}
        value={email}
      />

      <Text style={styles.text}>Password:</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#55af55",
    fontSize: 30,
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  text: {
    marginTop: 5,
    fontSize: 15,
    color: "white"
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
    backgroundColor: "#55af55",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
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
    textDecorationLine: "underline" 
  },
});
