import COLORS from "@/constants/colors";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";

export default function Home() {
    const { logout } = useAuthStore();
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Home</Text>
            {/* Swap container */}
            <View style={styles.swapCol}>
                <View style={styles.card}>
                    <View style={styles.cardTextTop}>
                        {/* Drop down currency selection */}
                        <Text style={styles.cardText}>
                            ETH
                        </Text>
                        <Text style={styles.cardText}>
                            You pay
                        </Text>
                    </View>

                    <View style={styles.cardBottom}>
                        <View style={styles.cardBottomRowStart}>
                            <TextInput
                                inputMode={"decimal"}
                                placeholder="0.00"
                                style={styles.input} // Add this
                                placeholderTextColor="#666" // Add this
                            />
                        </View>
                        <View style={styles.cardBottomRowEnd}>
                            <Text style={styles.cardBottomRowEndText}>balance</Text>
                            <Text style={styles.cardBottomRowEndValue}>2.543</Text>
                        </View>
                    </View>
                </View>
                {/* Rounded flip */}
                <View style={styles.cardSwapBtn}>
                    <Ionicons
                        name="swap-vertical-outline"
                        size={40}
                        color={'grey'}
                    />
                </View>
                <View style={styles.card}>
                    <View style={styles.cardTextTop}>
                        {/* Drop down currency selection */}
                        <Text style={styles.cardText}>
                            USDT
                        </Text>
                        <Text style={styles.cardText}>
                            You get
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#14161b', // '#14161b' or 'white'
        padding: 20,
    },

    header: {
        marginBottom: 20,
        fontSize: 20,
        color: 'white'
    },
    card: {
        position: "relative",
        backgroundColor: '#232628', // #232628
        paddingHorizontal: 4,
        paddingVertical: 6,
        zIndex: 1,
        borderRadius: 12,
        height: 150,
        // borderWidth: 1,
        borderColor: '#14161b',
        borderWidth: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardSwapBtn: {
        padding: 4,
        alignItems: "center",
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: '#232628',
        borderWidth: 8,
        borderRadius: 100,
        borderColor: '#14161b',
        width: 85,
        height: 85,
        marginVertical: -40,
        zIndex: 20,
        elevation: 2
    },

    swapIcon: {

    },
    cardText: {
        alignItems: 'flex-start',
        color: 'grey',
        fontSize: 16
    },
    input: {
        color: 'white',
        fontSize: 24,
        fontWeight: '600',
    },

    cardTextTop: {
        flexDirection: 'row',
        justifyContent: "space-between",
        marginBottom: 5,
        padding: 10
    },

    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        marginTop: 20,
    },
    cardBottomRowStart: {
        flex: 1,
        justifyContent: "flex-start"
    },
    cardBottomRowEnd: {
        flexDirection: "column",
        justifyContent: "flex-end"
    },
    cardBottomRowEndValue: {
        color: 'white',
        fontWeight: '800'
    },
    cardBottomRowEndText: {
        color: 'grey', // or white
        marginBottom: 0.5,
        fontSize: 16
    },
    swapCol: {
        flex: 1,
        flexDirection: 'column',
    }

});