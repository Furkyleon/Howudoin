import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "gray" }}>
        <Tabs.Screen
            name="chats"
            options={{
                title: "Chats",
                tabBarIcon: ({ color }) => (
                    <FontAwesome size={28} name="home" color={"green"} />
                ),
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="friends"
            options={{
                title: "Friends",
                tabBarIcon: ({ color }) => (
                    <FontAwesome size={28} name="user" color={"red"} />
                ),
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="groups"
            options={{
                title: "Groups",
                tabBarIcon: ({ color }) => (
                    <FontAwesome size={28} name="group" color={"blue"} />
                ),
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="addfriend"
            options={{
                href: null,
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="friendrequests"
            options={{
                href: null,
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="creategroup"
            options={{
                href: null,
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="friendmessages"
            options={{
                href: null,
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="groupmessages"
            options={{
                href: null,
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="newchat"
            options={{
                href: null,
                headerShown: false,
            }}
        />
    </Tabs>
  );
}
