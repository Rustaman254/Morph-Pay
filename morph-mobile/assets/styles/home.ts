import COLORS from "@/constants/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#14161b',
        padding: 15,
    },
    header: {
        marginBottom: 20,
        fontSize: 20,
        color: 'white'
    },
    card: {
        position: "relative",
        backgroundColor: '#232628',
        paddingHorizontal: 4,
        paddingVertical: 6,
        zIndex: 1,
        borderRadius: 12,
        height: 150,
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
        color: 'grey',
        marginBottom: 0.5,
        fontSize: 16
    },
    swapCol: {
        flex: 1,
        flexDirection: 'column',
    },
    dropDownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#232628',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '70%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#14161b',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 10,
        paddingHorizontal: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        paddingVertical: 12,
    },
    currencyList: {
        flex: 1,
    },
    currencyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#14161b',
    },
    currencyItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    currencyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#14161b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currencyIconText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    currencySymbol: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    currencyName: {
        color: 'grey',
        fontSize: 14,
    },
    currencyItemRight: {
        alignItems: 'flex-end',
    },
    currencyBalance: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default styles;