import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

type RegisterData = {
    fname: string;
    lname: string;
    phone: string;
    email?: string;
    country: string;
    password: string;
    isAgent: boolean;
    businessName?: string;
    legalEntityType?: string;
    registrationNumber?: string;
    businessEmail?: string;
    website?: string;
}

type AuthStore = {
    user: any;
    token: string | null;
    isLoading: boolean;
    register: (data: RegisterData) => Promise<{ success: boolean, error?: string }>;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
    login: (contact: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isLoading: false,

    register: async (data) => {
        set({ isLoading: true });

        try {
            const formattedData = {
                ...data,
                phone: data.phone.startsWith('+') ? data.phone : `+${data.phone}`,
            };

            console.log('Sending registration data:', JSON.stringify(formattedData, null, 2));

            const response = await fetch('https://morph-pay.onrender.com/api/v1/auth/register', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            });

            console.log('Response status:', response.status);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response received:', text.substring(0, 500));
                throw new Error('Server returned an invalid response. Please check your connection and try again.');
            }

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || responseData.message || "Registration failed");
            }

            console.log('Registration successful:', responseData);

            const userData = {
                contact: responseData.contact,
                did: responseData.did,
                address: responseData.address,
                publicKey: responseData.publicKey,
                privyWalletId: responseData.privyWalletId,
                isAgent: responseData.isAgent,
                businessId: responseData.businessId,
                fname: data.fname,
                lname: data.lname,
            };

            await AsyncStorage.setItem("user", JSON.stringify(userData));
            await AsyncStorage.setItem("token", responseData.token);

            set({ token: responseData.token, user: userData, isLoading: false });

            return { success: true };

        } catch (error) {
            set({ isLoading: false });
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Register error:", errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;
            if (token && user) {
                set({ user, token });
            }
        } catch (error) {
            console.log("Auth check failed", error);
        }
    },

    login: async (contact: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await fetch('https://morph-pay.onrender.com/api/v1/auth/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contact,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Login failed");
            }

            const userData = {
                contact: data.contact,
                did: data.did,
                address: data.address,
                publicKey: data.publicKey,
                privyWalletId: data.privyWalletId,
                isAgent: data.isAgent,
                businessId: data.businessId,
            };

            await AsyncStorage.setItem("user", JSON.stringify(userData));
            await AsyncStorage.setItem("token", data.token);

            set({ token: data.token, user: userData, isLoading: false });

            return { success: true };

        } catch (error) {
            set({ isLoading: false });
            if (error instanceof Error) {
                console.error("Login error:", error.message);
            } else {
                console.error("Unknown error during login:", error);
            }
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        set({ token: null, user: null });
    },

}));

export default useAuthStore;