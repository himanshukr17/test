import { Image, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const Scheme = ({ navigation }) => {
    const [scheme, setScheme] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [filteredUsers, setFilteredScheme] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [ageFilterModalVisible, setAgeFilterModalVisible] = useState(false);
    const [ageRange, setAgeRange] = useState([0, 100]);
    const [tempAgeRange, setTempAgeRange] = useState([0, 100]);

    useEffect(() => {
        fetchScheme();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchScheme();
        setRefreshing(false);
    }

    const fetchScheme = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/Scheme/all", {
                params: { FLAG: 1 }
            });
            if (res.status === 200) {
                setScheme(res.data);
                setFilteredScheme(res.data);
            }
        } catch (error) {
            console.warn("Failed to fetch schemes:", error);
        }
    }

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === "") {
            setFilteredScheme(scheme);
            return;
        }
        const filtered = scheme.filter((item) =>
            item.NAME.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredScheme(filtered);
    }

    const applyAgeFilter = () => {
        setAgeRange(tempAgeRange);
        setAgeFilterModalVisible(false);
    }

    const clearAgeFilter = () => {
        setAgeRange([0, 100]);
        setTempAgeRange([0, 100]);
        setAgeFilterModalVisible(false);
    }

    const displayedSchemes = filteredUsers.filter(item =>
        item.AGE.MAX >= ageRange[0] && item.AGE.MIN <= ageRange[1]
    );

    const renderSchemeItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => { setSelectedScheme(item); setModalVisible(true) }}>
            <View style={styles.topRoww}>
                <View style={styles.leftTop}>
                    <Icon name="calendar" size={20} color="#555" />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.title}>{item.NAME}</Text>
                        <Text style={styles.subtitle}>
                            {item.DESC.length > 20 ? item.DESC.substring(0, 20) + "..." : item.DESC}
                        </Text>
                    </View>
                </View>
                <View>
                    <View style={{ backgroundColor: '#d0d0d0ff', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                        <Text style={{ color: '#2b2a2aff', fontWeight: 'bold', fontSize: 12, alignSelf: 'center' }}>Start Date</Text>
                        <Text style={{ color: '#2b2a2aff', fontWeight: 'bold', fontSize: 10 }}>
                            {new Date(item.START_DATE).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <>

            {/* Scheme Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                {selectedScheme && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>

                            {/* Header: Title + Price */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{selectedScheme.NAME}</Text>

                            </View>

                            {/* Image */}
                            <Image
                                source={{ uri: `http://172.16.16.215:5000/${selectedScheme.IMAGE}` }}
                                style={{
                                    width: '100%',      // modal width ke hisaab se adjust
                                    height: undefined,  // height auto calculate
                                    aspectRatio: 1,     // original ratio maintain (1 = square, use image's real ratio if possible)
                                    borderRadius: 15,
                                    marginVertical: 15,
                                }}
                                resizeMode="contain"     // image ko crop na karne ke liye
                            />


                            <View>
                                {/* Description */}
                                <Text style={styles.modalUser}>
                                    Description:
                                </Text>
                                <Text style={styles.modalDesc}>{selectedScheme.DESC}</Text>

                                {/* Owner Details */}

                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.modalUser}>
                                        Age:
                                    </Text>
                                    <Text style={styles.modalUserDetails}>
                                        {selectedScheme.AGE.MIN} - {selectedScheme.AGE.MAX}
                                    </Text>

                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.modalUser}>
                                        Date:
                                    </Text>
                                    <Text style={styles.modalUserDetails}>
                                        {new Date(selectedScheme.START_DATE).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        {" to "}
                                        {new Date(selectedScheme.END_DATE).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

                                    </Text>
                                </View>


                            </View>
                            {/* Close Button */}
                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '10%' }}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 5, borderRadius: 10 }}
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

            </Modal>



            {/* Age Filter Modal */}
            <Modal visible={ageFilterModalVisible} transparent={true} animationType="slide" onRequestClose={() => setAgeFilterModalVisible(false)}>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>Filter by Age: {tempAgeRange[0]} - {tempAgeRange[1]}</Text>
                        <MultiSlider
                            values={tempAgeRange}
                            min={0}
                            max={100}
                            step={1}
                            allowOverlap={false}
                            snapped
                            onValuesChange={setTempAgeRange}
                            selectedStyle={{ backgroundColor: '#60498f' }}
                            markerStyle={{ backgroundColor: '#441678' }}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                            <TouchableOpacity onPress={clearAgeFilter} style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 10 }}>
                                <Text>Clear Filter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={applyAgeFilter} style={{ padding: 10, backgroundColor: '#60498f', borderRadius: 10 }}>
                                <Text style={{ color: '#fff' }}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>All Scheme</Text>
                    </View>
                </View>

                {scheme.length === 0 ? (
                    <Text style={styles.noData}>No Scheme</Text>
                ) : (
                    <>
                        <View style={styles.searchContainer}>
                            <Icon name="search" size={24} color="black" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholderTextColor='grey'
                                placeholder='Search by Scheme Name...'
                                value={searchText}
                                onChangeText={handleSearch}
                            />
                            <TouchableOpacity onPress={() => setAgeFilterModalVisible(true)}>
                                <Icon name="filter" size={24} color="black" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ margin: 15, marginTop: '7%' }}>
                            <FlatList
                                data={displayedSchemes}
                                keyExtractor={(item, index) => item.SCHEME_ID || index.toString()}
                                renderItem={renderSchemeItem}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                                contentContainerStyle={styles.scrollContent}
                            />
                        </View>

                    </>
                )}
            </View>
        </>
    )
}

export default Scheme


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        backgroundColor: '#ededfaff',
        elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 5
    },
    topRow: {
        position: 'relative',
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },

    backIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },

    titled: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 3,
        // marginTop: 10
    },

    title: {
        fontSize: 16,
        fontWeight: '700',
        color: "#333"
    },
    subtitle: {
        fontSize: 13,
        color: "#333",
        marginTop: 5
    },
    divider: {
        backgroundColor: "#eee",
        height: 1,
        marginVertical: 10
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    topRoww: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    leftTop: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    noData: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#777',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)', // thoda dark overlay for focus
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        // alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 10,
    },
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginBottom: 10,
        // backgroundColor:'red'

    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        flexWrap: 'wrap',
        textAlign: 'center',

    },

    modalImage: {
        width: '100%',
        height: 220,
        borderRadius: 15,
        marginVertical: 15,
        backgroundColor: 'blue'
    },
    modalDesc: {
        fontSize: 14,
        color: '#555',
        // textAlign: 'center',
        marginBottom: 15,
        lineHeight: 20,

    },
    modalUser: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
        color: '#333',


    },
    closeButton: {
        marginTop: 15,
        backgroundColor: '#60498f',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '5%',
        marginHorizontal: 16,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        color: 'black', // typed text visible
    },
    modalUserDetails: {
        fontSize: 14,
        // fontWeight: '500',
        marginBottom: 5,
        color: '#353030ff',
        marginLeft: 3,

    },
})