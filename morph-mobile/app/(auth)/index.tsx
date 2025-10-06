import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import COLORS from "../../constants/colors";
import { useRouter } from "expo-router";
import useAuthStore from "@/store/authStore";

export default function Login() {
    const [contact, setContact] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const router = useRouter();
    const { isLoading, login } = useAuthStore();

    const handleLogin = async () => {
        const result = await login(contact, password);

        if (!result.success) {
            Alert.alert("Error", result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={require("../../assets/images/icon.png")}
                        style={styles.logo}
                    />
                </View>
                <View style={styles.middle}>
                    <Text style={styles.text}>Welcome back to</Text>
                    <Text style={styles.text}> Morph Pay</Text>
                </View>

                {/* Form container */}
                <View style={styles.formContainer}>
                    {/* Contact input field */}
                    <View style={styles.inputGroups}>
                        {/* Input Field label */}
                        <Text style={styles.inputLabel}>Contact</Text>
                        {/* Input Container */}
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                style={styles.inputIcon}
                                color={COLORS.primary}
                            />
                            <TextInput
                                inputMode="tel"
                                style={styles.input}
                                placeholder="+254 000 000 00"
                                placeholderTextColor={COLORS.placeholderText}
                                value={contact}
                                onChangeText={setContact}
                            />
                        </View>
                    </View>
                </View>

                {/* Form container */}
                <View style={styles.formContainer}>
                    {/* Password input field */}
                    <View style={styles.inputGroups}>
                        {/* Input Field label */}
                        <Text style={styles.inputLabel}>Password</Text>
                        {/* Input Container */}
                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                style={styles.inputIcon}
                                color={COLORS.primary}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="*******"
                                placeholderTextColor={COLORS.placeholderText}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            {/* Toggle password visibility */}
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color={COLORS.primary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                {/* Footer auth links  */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/(auth)/signup')}
                    >
                        <Text style={styles.link}>SignUp</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "white",
        padding: 20,
    },
    header: {
        marginBottom: 32,
    },
    middle: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    logo: {
        width: 125,
        height: 125,
    },
    text: {
        fontSize: 24,
        color: "black",
    },
    formContainer: {
        marginBottom: 15,
    },
    inputGroups: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: "500",
    },
    inputIcon: {
        marginRight: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        backgroundColor: "#f4faf5",
        borderColor: "#c8e6c9",
    },
    input: {
        flex: 1,
        height: 48,
        color: "#1b361b",
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600"
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    footerText: {
        color: COLORS.textSecondary,
        marginRight: 5,
    },
    link: {
        color: COLORS.primary,
        fontWeight: "600",
    },
});