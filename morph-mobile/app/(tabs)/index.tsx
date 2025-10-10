import styles from "@/assets/styles/home";
import COLORS from "@/constants/colors";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    Pressable,
    FlatList
} from "react-native";

// Sample currency data
const CURRENCIES = [
    { id: '1', symbol: 'ETH', name: 'Ethereum', balance: '2.543' },
    { id: '2', symbol: 'USDT', name: 'Tether', balance: '1,234.56' },
    { id: '3', symbol: 'BTC', name: 'Bitcoin', balance: '0.125' },
    { id: '4', symbol: 'BNB', name: 'Binance Coin', balance: '5.23' },
    { id: '5', symbol: 'USDC', name: 'USD Coin', balance: '890.00' },
    { id: '6', symbol: 'SOL', name: 'Solana', balance: '12.5' },
    { id: '7', symbol: 'ADA', name: 'Cardano', balance: '450.0' },
    { id: '8', symbol: 'DOGE', name: 'Dogecoin', balance: '1000.0' },
];

// Swap Button/Flip button 
function SwapButton() {
    return (
        <View style={styles.cardSwapBtn}>
            <Ionicons
                name="swap-vertical-outline"
                size={40}
                color={'grey'}
            />
        </View>
    )
}

function CurrencyDropDownButton({ currency, onPress }: { currency: string, onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.dropDownButton} onPress={onPress}>
            <Text style={styles.cardText}>{currency}</Text>
            <Ionicons name="chevron-down" size={20} color={'grey'} />
        </TouchableOpacity>
    )
}

// Crypto Selection Modal
function CryptoModal({
    visible,
    onClose,
    onSelect
}: {
    visible: boolean,
    onClose: () => void,
    onSelect: (currency: string) => void
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCurrencies = CURRENCIES.filter(currency =>
        currency.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCurrencyItem = ({ item }: { item: typeof CURRENCIES[0] }) => (
        <TouchableOpacity
            style={styles.currencyItem}
            onPress={() => {
                onSelect(item.symbol);
                onClose();
                setSearchQuery('');
            }}
        >
            <View style={styles.currencyItemLeft}>
                <View style={styles.currencyIcon}>
                    <Text style={styles.currencyIconText}>{item.symbol[0]}</Text>
                </View>
                <View>
                    <Text style={styles.currencySymbol}>{item.symbol}</Text>
                    <Text style={styles.currencyName}>{item.name}</Text>
                </View>
            </View>
            <View style={styles.currencyItemRight}>
                <Text style={styles.currencyBalance}>{item.balance}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalBackdrop} onPress={onClose}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Currency</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="grey" />
                        </TouchableOpacity>
                    </View>

                    {/* Currncy Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="grey" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search currency..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Currency List */}
                    <FlatList
                        data={filteredCurrencies}
                        renderItem={renderCurrencyItem}
                        keyExtractor={(item) => item.id}
                        style={styles.currencyList}
                        showsVerticalScrollIndicator={false}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// Field Section One - Payment
function FieldOne({
    selectedCurrency,
    onCurrencyPress
}: {
    selectedCurrency: string,
    onCurrencyPress: () => void
}) {
    const currencyData = CURRENCIES.find(c => c.symbol === selectedCurrency);

    return (
        <View style={styles.card}>
            <View style={styles.cardTextTop}>
                <CurrencyDropDownButton currency={selectedCurrency} onPress={onCurrencyPress} />
                <Text style={styles.cardText}>You pay</Text>
            </View>

            <View style={styles.cardBottom}>
                <View style={styles.cardBottomRowStart}>
                    <TextInput
                        inputMode={"decimal"}
                        placeholder="0.00"
                        style={styles.input}
                        placeholderTextColor="#666"
                    />
                </View>
                <View style={styles.cardBottomRowEnd}>
                    <Text style={styles.cardBottomRowEndText}>balance</Text>
                    <Text style={styles.cardBottomRowEndValue}>
                        {currencyData?.balance || '0.00'}
                    </Text>
                </View>
            </View>
        </View>
    )
}

function FieldTwo({
    selectedCurrency,
    onCurrencyPress
}: {
    selectedCurrency: string,
    onCurrencyPress: () => void
}) {
    const currencyData = CURRENCIES.find(c => c.symbol === selectedCurrency);

    return (
        <View style={styles.card}>
            <View style={styles.cardTextTop}>
                <CurrencyDropDownButton currency={selectedCurrency} onPress={onCurrencyPress} />
                <Text style={styles.cardText}>You get</Text>
            </View>
            <View style={styles.cardBottom}>
                <View style={styles.cardBottomRowStart}>
                    <TextInput
                        inputMode={"decimal"}
                        placeholder="0.00"
                        style={styles.input}
                        placeholderTextColor="#666"
                        editable={false}
                    />
                </View>
                <View style={styles.cardBottomRowEnd}>
                    <Text style={styles.cardBottomRowEndText}>balance</Text>
                    <Text style={styles.cardBottomRowEndValue}>
                        {currencyData?.balance || '0.00'}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default function Home() {
    const { logout } = useAuthStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [activeField, setActiveField] = useState<'field1' | 'field2'>('field1');
    const [field1Currency, setField1Currency] = useState('ETH');
    const [field2Currency, setField2Currency] = useState('USDT');

    const handleCurrencySelect = (currency: string) => {
        if (activeField === 'field1') {
            setField1Currency(currency);
        } else {
            setField2Currency(currency);
        }
    };

    const openModal = (field: 'field1' | 'field2') => {
        setActiveField(field);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Home</Text>

            {/* Swap container */}
            <View style={styles.swapCol}>
                <FieldOne
                    selectedCurrency={field1Currency}
                    onCurrencyPress={() => openModal('field1')}
                />
                <SwapButton />
                <FieldTwo
                    selectedCurrency={field2Currency}
                    onCurrencyPress={() => openModal('field2')}
                />
            </View>

            {/* Currency Selection Modal */}
            <CryptoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={handleCurrencySelect}
            />
        </View>
    )
}

