import { Image, Text, View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

function NavigateToRegister() {
  router.push("/register");
}

function NavigateToLogin() {
  router.push("/login");
}

export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../assets/images/howudoin.jpg")}
      />
      <Text style={styles.text}>Welcome to Howudoin!</Text>
      <Pressable style={styles.button1} onPress={NavigateToRegister}>
        <Text style={styles.buttontext}> Register </Text>
      </Pressable>
      <Pressable style={styles.button2} onPress={NavigateToLogin}>
        <Text style={styles.buttontext}> Login </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 210,
    height: 150,
    marginBottom: 30,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 1,
  },
  text: {
    color: "white",
    fontSize: 30,
    marginBottom: 15,
  },
  button2: {
    borderRadius: 20,
    backgroundColor: "#6e85b6",
    width: 200,
    height: 50,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  button1: {
    borderRadius: 20,
    backgroundColor: "#55af55",
    width: 200,
    height: 50,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  buttontext: {
    color: "#fff",
    fontSize: 15,
  },
});
