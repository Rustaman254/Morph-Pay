import { useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator } from "react-native";
import { KeyboardAvoidingView, Platform, StyleSheet, View, Image } from "react-native";
import COLORS from "../../constants/colors";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";

export default function SignUp() {
    const router = useRouter();

    // Match backend field names
    const [fname, setFname] = useState<string>("");
    const [lname, setLname] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [country, setCountry] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Agent registration toggle
    const [isAgent, setIsAgent] = useState<boolean>(false);
    const [businessName, setBusinessName] = useState<string>("");
    const [legalEntityType, setLegalEntityType] = useState<string>("");
    const [registrationNumber, setRegistrationNumber] = useState<string>("");
    const [businessEmail, setBusinessEmail] = useState<string>("");
    const [website, setWebsite] = useState<string>("");
    const { user, isLoading, register } = useAuthStore();


    const handleSignUp = async () => {
        // Validate required fields
        if (!fname || !lname || !phone || !password || !country) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        // Validate password length (backend requires 8+ characters)
        if (password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters long");
            return;
        }

        // Validate phone format
        const phoneWithoutSpaces = phone.replace(/\s/g, '');
        if (!phoneWithoutSpaces.match(/^\+?[1-9]\d{9,14}$/)) {
            Alert.alert("Error", "Please enter a valid phone number (e.g., +254712345678)");
            return;
        }

        // If agent, validate business fields (all 3 required for business creation)
        if (isAgent && (!businessName || !legalEntityType || !businessEmail)) {
            Alert.alert("Error", "Business Name, Legal Entity Type, and Business Email are required for agent registration");
            return;
        }

        // Prepare data matching backend requirements
        const signupData: any = {
            fname: fname.trim(),
            lname: lname.trim(),
            phone: phoneWithoutSpaces,
            country: country.trim(),
            password,
            isAgent,
        };

        // Add email if provided
        if (email) {
            signupData.email = email.trim().toLowerCase();
        }

        // Add business fields if registering as agent
        if (isAgent) {
            signupData.businessName = businessName.trim();
            signupData.legalEntityType = legalEntityType.trim();
            signupData.businessEmail = businessEmail.trim().toLowerCase();

            if (registrationNumber) {
                signupData.registrationNumber = registrationNumber.trim();
            }
            if (website) {
                signupData.website = website.trim();
            }
        }

        console.log('Submitting signup data:', signupData);

        const result = await register(signupData);

        if (!result.success) {
            Alert.alert("Registration Failed", result.error || "An error occurred during registration");
        } else {
            Alert.alert("Success", "Registration successful!", [
                { text: "OK", onPress: () => router.replace('/(auth)') }
            ]);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image
                            source={require("../../assets/images/icon.png")}
                            style={styles.logo}
                        />
                    </View>

                    {/* Form container */}
                    <View style={styles.formContainer}>
                        {/* Row for First Name and Last Name */}
                        <View style={styles.row}>
                            {/* First Name input field */}
                            <View style={[styles.inputGroups, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>First Name</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        style={styles.inputIcon}
                                        color={COLORS.primary}
                                    />
                                    <TextInput
                                        inputMode="text"
                                        style={styles.input}
                                        placeholder="First name"
                                        placeholderTextColor={COLORS.placeholderText}
                                        value={fname}
                                        onChangeText={setFname}
                                    />
                                </View>
                            </View>

                            {/* Last Name input field */}
                            <View style={[styles.inputGroups, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Last Name</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        style={styles.inputIcon}
                                        color={COLORS.primary}
                                    />
                                    <TextInput
                                        inputMode="text"
                                        style={styles.input}
                                        placeholder="Last name"
                                        placeholderTextColor={COLORS.placeholderText}
                                        value={lname}
                                        onChangeText={setLname}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Email input field */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroups}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    style={styles.inputIcon}
                                    color={COLORS.primary}
                                />
                                <TextInput
                                    inputMode="email"
                                    style={styles.input}
                                    placeholder="email@example.com"
                                    placeholderTextColor={COLORS.placeholderText}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Phone input field */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroups}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="call-outline"
                                    size={20}
                                    style={styles.inputIcon}
                                    color={COLORS.primary}
                                />
                                <TextInput
                                    inputMode="tel"
                                    style={styles.input}
                                    placeholder="+254 000 000 000"
                                    placeholderTextColor={COLORS.placeholderText}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Country input field */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroups}>
                            <Text style={styles.inputLabel}>Country</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="globe-outline"
                                    size={20}
                                    style={styles.inputIcon}
                                    color={COLORS.primary}
                                />
                                <TextInput
                                    inputMode="text"
                                    style={styles.input}
                                    placeholder="e.g Kenya"
                                    placeholderTextColor={COLORS.placeholderText}
                                    value={country}
                                    onChangeText={setCountry}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Password input field */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroups}>
                            <Text style={styles.inputLabel}>Password</Text>
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

                    {/* Agent Toggle */}
                    <View style={styles.agentToggleContainer}>
                        <Text style={styles.inputLabel}>Register as Agent/Business</Text>
                        <Switch
                            value={isAgent}
                            onValueChange={setIsAgent}
                            trackColor={{ false: "#d1d5db", true: COLORS.primary }}
                            thumbColor={isAgent ? "#fff" : "#f4f3f4"}
                        />
                    </View>

                    {/* Business Fields - Show only if isAgent is true to make the UI much better*/}
                    {isAgent && (
                        <>
                            <View style={styles.businessSection}>
                                <Text style={styles.sectionTitle}>Business Information</Text>

                                {/* Business Name */}
                                <View style={styles.formContainer}>
                                    <View style={styles.inputGroups}>
                                        <Text style={styles.inputLabel}>Business Name</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons
                                                name="business-outline"
                                                size={20}
                                                style={styles.inputIcon}
                                                color={COLORS.primary}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Your Business Name"
                                                placeholderTextColor={COLORS.placeholderText}
                                                value={businessName}
                                                onChangeText={setBusinessName}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Legal Entity Type */}
                                <View style={styles.formContainer}>
                                    <View style={styles.inputGroups}>
                                        <Text style={styles.inputLabel}>Legal Entity Type</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons
                                                name="document-text-outline"
                                                size={20}
                                                style={styles.inputIcon}
                                                color={COLORS.primary}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g. LLC, Corporation, Sole Proprietor"
                                                placeholderTextColor={COLORS.placeholderText}
                                                value={legalEntityType}
                                                onChangeText={setLegalEntityType}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Registration Number */}
                                <View style={styles.formContainer}>
                                    <View style={styles.inputGroups}>
                                        <Text style={styles.inputLabel}>Registration Number</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons
                                                name="key-outline"
                                                size={20}
                                                style={styles.inputIcon}
                                                color={COLORS.primary}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Business registration number"
                                                placeholderTextColor={COLORS.placeholderText}
                                                value={registrationNumber}
                                                onChangeText={setRegistrationNumber}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Business Email */}
                                <View style={styles.formContainer}>
                                    <View style={styles.inputGroups}>
                                        <Text style={styles.inputLabel}>Business Email</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons
                                                name="mail-outline"
                                                size={20}
                                                style={styles.inputIcon}
                                                color={COLORS.primary}
                                            />
                                            <TextInput
                                                inputMode="email"
                                                style={styles.input}
                                                placeholder="business@example.com"
                                                placeholderTextColor={COLORS.placeholderText}
                                                value={businessEmail}
                                                onChangeText={setBusinessEmail}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Website */}
                                <View style={styles.formContainer}>
                                    <View style={styles.inputGroups}>
                                        <Text style={styles.inputLabel}>Website (Optional)</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons
                                                name="link-outline"
                                                size={20}
                                                style={styles.inputIcon}
                                                color={COLORS.primary}
                                            />
                                            <TextInput
                                                inputMode="url"
                                                style={styles.input}
                                                placeholder="https://www.example.com"
                                                placeholderTextColor={COLORS.placeholderText}
                                                value={website}
                                                onChangeText={setWebsite}
                                                autoCapitalize="none"
                                                keyboardType="url"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}


                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleSignUp}
                        style={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.replace('/(auth)')}>
                            <Text style={styles.link}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flexGrow: 1,
        backgroundColor: "white",
        padding: 20
    },
    logo: {
        width: 100,
        height: 100
    },
    text: {
        fontSize: 24,
        color: "black",
    },
    middle: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    header: {
        marginBottom: 32,
    },
    formContainer: {
        marginBottom: 5,
    },
    inputGroups: {
        marginBottom: 10,
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
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600"
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 20,
    },
    footerText: {
        color: COLORS.textSecondary,
        marginRight: 5,
    },
    link: {
        color: COLORS.primary,
        fontWeight: "600",
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    agentToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f4faf5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#c8e6c9',
    },
    businessSection: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#c8e6c9',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 12,
    },
});