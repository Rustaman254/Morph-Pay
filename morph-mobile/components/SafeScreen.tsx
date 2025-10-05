import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";

interface SafeAreaProp {
    children: ReactNode
}

// add some style bg color
export default function SafeScreen({ children }: SafeAreaProp) {
    const inset = useSafeAreaInsets();
    return (
        <View style={[styles.container, { paddingTop: inset.top }]}>
            {children}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
});