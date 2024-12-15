import {Text, View, StyleSheet, TextInput, Pressable, Alert} from 'react-native';
import {useState} from "react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function register(){
        Alert.alert("Successfully registered!")
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Register Page
            </Text>

            <Text style={styles.text}>
                Username:
            </Text>
            <TextInput style={styles.input} onChangeText={(x)=>setUsername(x)} placeholder={"Enter an username..."}></TextInput>

            <Text style={styles.text}>
                Password:
            </Text>
            <TextInput style={styles.input} onChangeText={(x)=>setPassword(x)} placeholder={"Enter a password..."}></TextInput>

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
        color:"red",
        backgroundColor:"#55af55",
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        height: 40,
        borderRadius: 10,
    },
    buttontext: {
        color: "white",
        fontSize: 16,
    }
})