import { React, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Animated, Easing, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import LottieView from 'lottie-react-native';
import Iconn from 'react-native-vector-icons/FontAwesome6';
import LinearGradient from 'react-native-linear-gradient';


const VehicleQr = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Animation refs
    const dashAnim = useRef(new Animated.Value(0)).current;
    const vehicleAnim = useRef(new Animated.Value(0)).current;
    const modalAnim = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        // Dashed line animation
        Animated.loop(
            Animated.timing(dashAnim, {
                toValue: 0,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Vehicle movement animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(vehicleAnim, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(vehicleAnim, {
                    toValue: 0,
                    duration: 0,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Modal entrance animation
        Animated.timing(modalAnim, {
            toValue: isModalVisible ? 1 : 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [isModalVisible, dashAnim, vehicleAnim]);

    {/* Animated styles */ }
    const animatedDashStyle = {
        transform: [{ translateX: dashAnim }],
    };

    {/* Animated styles */ }
    const animatedVehicleStyle = {
        transform: [
            {
                translateX: vehicleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 300],
                }),
            },
        ],
    };

    {/* Modal animation style */ }
    const modalStyle = {
        transform: [
            {
                scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                }),
            },
            {
                translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                }),
            },
        ],
        opacity: modalAnim,
    };

    {/* Fetch user profile and vehicles */ }
    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('http://172.16.16.215:5000/RWA/User/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser({
                ...response.data.user,
                vehicles: response.data.vehicle || [],
            });
            console.log("user:", response.data.user);
            console.log("vehicles:", response.data.vehicle);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load profile:", error);
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserProfile();
        setRefreshing(false);
    };

    {/* Handle viewing parking QR */ }
    const handleViewParkingQR = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalVisible(true);
    };


    useEffect(() => {
        fetchUserProfile();
    }, []);


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#ffa800" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: 'red' }}>Failed to load user data</Text>
            </View>
        );
    }


    return (
        <>
            {/* Modal */}
            {selectedVehicle && (
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        setIsModalVisible(false);
                        setSelectedVehicle(null);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View style={[styles.modalBox, modalStyle]}>
                            <TouchableOpacity
                                style={styles.closeIcon}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    setSelectedVehicle(null);
                                }}
                            >
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <View style={styles.cardContainer}>
                                <View style={styles.vehicleInfo}>
                                    <Text style={styles.vehicleText}>
                                        <Text style={styles.vehicleLabel}>Vehicle Number: </Text>
                                        {selectedVehicle.Vechile}
                                    </Text>
                                    <Text style={styles.vehicleText}>
                                        <Text style={styles.vehicleLabel}>Brand: </Text>
                                        {selectedVehicle.Brand}
                                    </Text>

                                    <Text style={styles.vehicleText}>
                                        <Text style={styles.vehicleLabel}>Model: </Text>
                                        {selectedVehicle.Model}
                                    </Text>
                                </View>

                                <View style={styles.cutLineContainer}>

                                    <Animated.Text style={[styles.vehicleIcon, animatedVehicleStyle]}>
                                        <Iconn name="car-side" size={24} color="#89788a" />
                                    </Animated.Text>
                                    <Animated.View style={[styles.dottedLine, animatedDashStyle]} />
                                </View>

                                <View style={styles.qrContainer}>
                                    <Text style={styles.text}>Your Parking QR Code</Text>
                                    <QRCode
                                        value={JSON.stringify({
                                            vehicle: selectedVehicle.Vechile,
                                            brand: selectedVehicle.Brand,
                                            model: selectedVehicle.Model,
                                            type: selectedVehicle.TYPE,
                                            name: user.first_name + " " + user.last_name,
                                            flat: user.flat_no,
                                            floor: user.floor,
                                            user_id: user.user_id
                                        })}
                                        size={180}
                                        backgroundColor="transparent"
                                        color="#000"
                                    />
                                </View>

                                <View style={styles.cutLineContainer}>

                                    <Animated.Text style={[styles.vehicleIcon, animatedVehicleStyle]}>
                                        <Iconn name="car-side" size={24} color="#89788a" />
                                    </Animated.Text>
                                    <Animated.View style={[styles.dottedLine, animatedDashStyle]} />
                                </View>

                                <View style={styles.noteContainer}>
                                    <Text style={styles.noteTitle}>Note:</Text>
                                    <Text style={styles.noteText}>
                                        Show this QR code at the parking gate for access.
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>

            )}

            {/* Main Content */}
            <View style={styles.container}>

                <LinearGradient
                    colors={['#ccccf6ff', '#e1e1e5ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                                <Icon name="arrow-back" size={24} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.titled}>Vehicle QR</Text>

                        </View>
                    </View>
                </LinearGradient>


                <ScrollView
                    style={styles.container}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }>


                    {user.vehicles && user.vehicles.length > 0 && (
                        <>

                            <View style={styles.details}>
                                {user.vehicles && user.vehicles.length > 0 ? (
                                    user.vehicles.map((v, i) => (
                                        <View key={i} style={styles.vehicleCard}>
                                            <View style={styles.detailing}>
                                                <Text style={styles.label}>Vehicle Number:</Text>
                                                <Text style={styles.value}>{v.Vechile}</Text>
                                            </View>
                                            <View style={styles.divider} />
                                            <View style={styles.detailing}>
                                                <Text style={styles.label}>Brand:</Text>
                                                <Text style={styles.value}>{v.Brand}</Text>
                                            </View>
                                            <View style={styles.divider} />
                                            <View style={styles.detailing}>
                                                <Text style={styles.label}>Model:</Text>
                                                <Text style={styles.value}>{v.Model}</Text>
                                            </View>
                                            <View style={styles.divider} />

                                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '3%' }}>
                                                <TouchableOpacity onPress={() => handleViewParkingQR(v)}>
                                                    <LinearGradient
                                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                                        colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 0 }}
                                                        style={{ padding: 6, borderRadius: 10 }}
                                                    >
                                                        <Text style={styles.buttonText}>View QR</Text>
                                                    </LinearGradient>

                                                </TouchableOpacity>
                                            </View>


                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ color: 'red' }}>No vehicles added yet.</Text>
                                )}
                            </View>

                        </>)}

                </ScrollView>
            </View>
        </>

    );
};

export default VehicleQr

const styles = StyleSheet.create({
    divider: {
        backgroundColor: "#eee",
        height: 1,
        marginVertical: 7
    },
    detailing: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
       
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 5,
    },
    avatar: {
        height: 100,
        width: 100,
        borderRadius: 60,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    type: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10
    },
    details: {
        padding: 10,
        marginTop: "10%",
    },
    label: {
        fontSize: 14,
        color: 'black',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#555',
    },
    heading: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginBottom: 10,
        marginTop: 10
    },
    detailsContainer: {
        backgroundColor: '#ffffff',
        marginTop: -20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        zIndex: 0,
    },
    emptyAvatar: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    addIconWrapper: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    avatarContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    editIconWrapper: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#89788a',
        borderRadius: 20,
        padding: 2,
        elevation: 3,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },

    modalBox: {
        width: '90%',
        maxWidth: 350,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        padding: 10

    },

    modalOverlayPicture: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },

    modalBoxPicture: {
        width: '90%',
        maxWidth: 350,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    closeIcon: {
        position: 'absolute',
        top: 2,
        right: 3,
        zIndex: 1,
        padding: 5,
        backgroundColor: '#ededfaff',
        borderRadius: 12
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    cardContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 2,
    },
    vehicleInfo: {
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    vehicleText: {
        color: '#333',
        fontSize: 14,
        marginBottom: 6,
    },
    vehicleLabel: {
        fontWeight: '600',
        color: '#333',
    },
    cutLineContainer: {
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        marginVertical: 10,
        paddingHorizontal: 0,
    },
    dottedLine: {
        flex: 1,
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 0.5,
        borderColor: '#666',
        borderRadius: 1,
    },
    vehicleIcon: {
        fontSize: 20,
        // marginHorizontal: 0,
        color: '#007AFF',
    },
    qrContainer: {
        alignItems: 'center',
        padding: 15,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    noteContainer: {
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#b02b2bff',
        marginBottom: 5,
    },
    noteText: {
        color: '#b02b2bff',
        fontSize: 12,
        lineHeight: 18,
    },
    modalButton: {
        borderColor: '#ededfaff',
        padding: 10,
        borderRadius: 12,
        marginVertical: 4,
        alignItems: 'center',
        // elevation: 2,
        borderWidth: 3
    },
    modalButtonText: {
        color: 'black',
        fontSize: 11,
        fontWeight: '500',
    },
    icon: {
        width: 20,
        height: 20,
        marginLeft: 4,
    },
    vehicleCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    qrButton: {
        alignSelf: 'center',
        backgroundColor: '#89788a',
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        width: 140,
        marginTop: 10,
    },

    qrButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    buttonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center'
    },
})