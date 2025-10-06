import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                headerTitleStyle: {
                    color: COLORS.textPrimary,
                    fontWeight: "600"
                },
                headerShadowVisible: false,
                tabBarStyle: {
                    // backgroundColor: '#f1f8f2',
                    backgroundColor: '#14161b',
                    borderTopWidth: 1,
                    borderColor: '#c8e6c9',
                    paddingTop: 5,
                    paddingBottom: insets.bottom,  // doesn't chage anyhthing
                    height: 55 + insets.bottom,
                }
            }}
        >
            <Tabs.Screen name='index'
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name='home-outline'
                            size={size}
                            color={color}
                        />)
                }}
            />
            <Tabs.Screen name='profile'
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name='person-outline'
                            size={size}
                            color={color}
                        />)
                }}
            />
        </Tabs>

    )
}