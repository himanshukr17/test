import { Image, Linking, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import Carousel from "hrm-native-carousel";
import LinearGradient from 'react-native-linear-gradient';


const CurrentEvent = ({ route, navigation }) => {
    const { event } = route.params;

    useEffect(() => {
        console.log("Event object:", event);
    }, []);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [successModal, setsuccessModal] = useState(false);
    const [userQRData, setUserQRData] = useState(null);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [guestModalVisible, setGuestModalVisible] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState(null);
    const [sponsorModalVisible, setSponsorModalVisible] = useState(false);
    const [organizerModalVisible, setOrganizerModalVisible] = useState(false);
    const [chairmanModalVisible, setChairmanModalVisible] = useState(false);



    {/* Function to handle registration button click */ }
    const handleRegister = () => {
        setIsModalVisible(true);
    };

    const renderGalleryItem = ({ item }) => {
        // console.log("Gallery item:", item);
        return (
            <View style={{ margin: 0 }}>
                <Image
                    source={{ uri: `http://172.16.16.215:5000/EventGallery/${item}` }}
                    style={{ width: '100%', height: 200, borderRadius: 10, borderColor: '#d7ded9ff', borderWidth: 1 }}
                />
            </View>
        );
    };





    {/* Toast for notifications */ }
    const toast = useToast();


    {/* Function to handle success modal close */ }
    const onRefresh = async () => {
        setRefreshing(true);
        await checkIfRegistered();
        setRefreshing(false);
    };

    { /* Function to handle guest press */ }
    const handleGuestPress = (guest) => {
        setSelectedGuest(guest);
        setGuestModalVisible(true);
    };

    {/* Function to handle sponsor press */ }
    const handleSponsorPress = (sponsor) => {
        setSelectedSponsor(sponsor);
        setSponsorModalVisible(true);
    };

    {/* Function to handle chairman press */ }
    const handleChairman = () => {
        setChairmanModalVisible(true);
    }

    {/* Function to handle organizer press */ }
    const handleOrganizer = () => {
        setOrganizerModalVisible(true);
    }


    {/* Function to check if user is registered for the event */ }
    const checkIfRegistered = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');

            const response = await axios.post('http://172.16.16.215:5000/RWA/EventTransaction/check', {
                USER_ID: userId,
                EVENT_ID: event.event_id
            });

            if (response.data.registered) {
                setIsRegistered(true);
                fetchQRData();
            } else {
                setIsRegistered(false);
            }
        } catch (error) {
            console.error("Error checking registration:", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            setIsRegistered(false);
            checkIfRegistered();
        }, [event.event_id])
    );

    {/* Function to format time to 12-hour format */ }
    const formatTimeTo12Hour = (timeString) => {
        const [hour, minute] = timeString.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    };



    {        /* Function to register for the event */ }
    const register = async () => {

        try {

            const now = new Date();
            const eventTill = new Date(event.till);

            if (now > eventTill) {
                toast.show("This event has expired.", {
                    type: "danger",
                    placement: "top",
                    duration: 3000,
                    offset: 50,
                    animationType: "slide-in",
                    style: {
                        backgroundColor: '#ffe6e6', // light red
                        borderRadius: 14,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderColor: '#ff4d4d',
                        borderWidth: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 6,
                    },
                    textStyle: {
                        color: '#a60000',
                        fontSize: 15,
                        fontWeight: '600',
                    }
                });
                setIsModalVisible(false);
                return; // stop execution here

            }

            const userId = await AsyncStorage.getItem('userId');
            const eventId = event.event_id;
            const amount = event.fee_type == 'Free' ? "0" : event.event_fee;
            const payload = {
                USER_ID: userId,
                EVENT_ID: eventId,
                AMOUNT_PAID: amount,
            }
            console.log("Data sending:", payload);
            if (event.fee_type == 'Free') {
                const response = await axios.post('http://172.16.16.215:5000/RWA/EventTransaction/create', payload);
                if (response.status === 200) {
                    fetchQRData();
                    setsuccessModal(true);
                    setIsModalVisible(false);
                }



            }
            else {
                setIsModalVisible(false);
                toast.show(" Payment will be collected at your home by a guard or event staff.", {
                    type: "custom",
                    placement: "top",
                    duration: 3000,
                    offset: 50,
                    animationType: "slide-in",
                    style: {
                        backgroundColor: '#fffbe6', // light yellow
                        borderRadius: 14,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderColor: '#ffd700', // gold border
                        borderWidth: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 6,
                    },
                    textStyle: {
                        color: '#8a4b00', // dark brown
                        fontSize: 15,
                        fontWeight: '600',
                    }
                });



            }
        } catch (error) {
            console.error("Error in registration:", error);
            alert(
                error.response?.data?.message ||
                "Something went wrong while registering."
            );

        }
    }

    {/* Function to fetch QR data */ }
    const fetchQRData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const response = await axios.get('http://172.16.16.215:5000/RWA/EventTransaction/qrData', {
                params: {
                    USER_ID: userId,
                    EVENT_ID: event.event_id
                }
            });

            if (response.data?.success) {
                setUserQRData(response.data.data);
            } else {
                setUserQRData(null);
            }
        } catch (error) {
            console.error("Failed to fetch QR data:", error);
            setUserQRData(null);
        }
    };






    return (
        <>
            {/*Success modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={successModal}
                onRequestClose={() => setsuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Registeration Successful</Text>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.modalButton1} onPress={() => setsuccessModal(false)}>
                                <Text style={{ color: 'white' }}>Okay</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </View>

            </Modal>
            {/**Confirmation modal*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Do you want to register for this event?</Text>

                        <View style={{ flexDirection: "row", justifyContent: 'space-evenly' }}>
                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '3%' }}>
                                <TouchableOpacity onPress={register}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#cfddceff', '#79c66cff', 'rgba(53, 113, 56, 0.58)']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 8, borderRadius: 10 }}
                                    >
                                        <Text style={styles.buttonText}>Yes</Text>
                                    </LinearGradient>

                                </TouchableOpacity>
                            </View>

                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '3%' }}>
                                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#dad4d4ff', '#e7483cff', 'rgba(210, 44, 44, 0.98)']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 8, borderRadius: 10 }}
                                    >
                                        <Text style={styles.buttonText}>No</Text>
                                    </LinearGradient>

                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    </View>
                </View>

            </Modal>

            {/**Guest modal*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={guestModalVisible}
                onRequestClose={() => setGuestModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        {/* Close Icon in top-right corner */}
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => setGuestModalVisible(false)}
                        >
                            <Icon name="close" size={24} color="black" />
                        </TouchableOpacity>

                        {selectedGuest && (
                            <>
                                <Image
                                    source={{ uri: `http://172.16.16.215:5000/${selectedGuest.image.replace(/\\/g, '/')}` }}
                                    style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 }}
                                />
                                <Text style={[styles.modalTitle, { marginBottom: 10 }]}>
                                    {selectedGuest.name}
                                </Text>
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        marginBottom: 20,
                                        gap: 2
                                    }}
                                    onPress={() => Linking.openURL(`tel:${event.org_contact}`)}
                                >
                                    <Icon name="call" size={18} color="#2789f3" />
                                    <Text style={{ color: '#2789f3', fontWeight: 'bold', fontSize: 16, textDecorationLine: 'underline' }}>
                                        {selectedGuest.contact || "No Contact available."}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>


            {/**Sponsor modal*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={sponsorModalVisible}
                onRequestClose={() => setSponsorModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        {/* Close Icon in top-right corner */}
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => setSponsorModalVisible(false)}
                        >
                            <Icon name="close" size={24} color="black" />
                        </TouchableOpacity>

                        {selectedSponsor && (
                            <>
                                <Image
                                    source={{ uri: `http://172.16.16.215:5000/${selectedSponsor.image.replace(/\\/g, '/')}` }}
                                    style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 }}
                                />
                                <Text style={[styles.modalTitle, { marginBottom: 10 }]}>
                                    ORG: {selectedSponsor.org_name}
                                </Text>

                                <Text style={{ textAlign: 'center', color: '#333', marginBottom: 10 }}>
                                    <Text style={{ fontWeight: 'bold' }}>Name:</Text> {selectedSponsor.name || "No name available."}
                                </Text>
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        marginBottom: 20,
                                        gap: 2
                                    }}
                                    onPress={() => Linking.openURL(`tel:${event.org_contact}`)}
                                >
                                    <Icon name="call" size={18} color="#2789f3" />
                                    <Text style={{ color: '#2789f3', fontWeight: 'bold', fontSize: 16, textDecorationLine: 'underline' }}>
                                        {selectedSponsor.contact || "No Contact available."}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/*Chairman modal*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={chairmanModalVisible}
                onRequestClose={() => setChairmanModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        {/* Close Icon in top-right corner */}
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => setChairmanModalVisible(false)}
                        >
                            <Icon name="close" size={24} color="black" />
                        </TouchableOpacity>


                        <>
                            <Image
                                source={{ uri: event.avatars[1] }}
                                style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 }}
                            />
                            <Text style={[styles.modalTitle, { marginBottom: 10 }]}>
                                {event.chairman}
                            </Text>
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                    gap: 2
                                }}
                                onPress={() => Linking.openURL(`tel:${event.org_contact}`)}
                            >
                                <Icon name="call" size={18} color="#2789f3" />
                                <Text style={{ color: '#2789f3', fontWeight: 'bold', fontSize: 16, textDecorationLine: 'underline' }}>
                                    {event.chairman_contact || "No Contact available."}
                                </Text>
                            </TouchableOpacity>
                        </>

                    </View>
                </View>
            </Modal>


            {/*Organizer modal*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={organizerModalVisible}
                onRequestClose={() => setOrganizerModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        {/* Close Icon in top-right corner */}
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => setOrganizerModalVisible(false)}
                        >
                            <Icon name="close" size={24} color="black" />
                        </TouchableOpacity>


                        <>
                            <Image
                                source={{ uri: event.avatars[0] }}
                                style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 }}
                            />
                            <Text style={[styles.modalTitle, { marginBottom: 10 }]}>
                                {event.organizer}
                            </Text>
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                    gap: 2
                                }}
                                onPress={() => Linking.openURL(`tel:${event.org_contact}`)}
                            >
                                <Icon name="call" size={18} color="#2789f3" />
                                <Text style={{ color: '#2789f3', fontWeight: 'bold', fontSize: 16, textDecorationLine: 'underline' }}>
                                    {event.org_contact || "No Contact available."}
                                </Text>
                            </TouchableOpacity>


                        </>

                    </View>
                </View>
            </Modal>

            {/** Main View */}
            <View style={styles.container}>
                {/** Header Row **/}

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
                            <Text style={styles.titled}>Event Details</Text>

                            {isRegistered && userQRData && (
                                <TouchableOpacity
                                    style={{ position: 'absolute', right: 16 }}
                                    onPress={() => navigation.navigate('QrCodeScreen', { qrData: userQRData, event: event })}
                                >
                                    <Icon name="qr-code-outline" size={24} color="black" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                {/** Scrollable Content */}
                <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {event.poster ? (
                        <Image
                            source={{ uri: `http://172.16.16.215:5000/${event.poster.replace(/\\/g, '/')}` }}
                            style={{ width: '100%', height: 200, resizeMode: 'cover', borderRadius: 10, marginBottom: 15 }}
                        />
                    ) : (
                        <Text style={{ color: 'gray' }}>No poster available</Text>
                    )}
                    <View style={styles.horizontall} />

                    <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{event.title}</Text>
                    <Text style={{ color: 'black', fontSize: 14, marginBottom: 10 }}>{event.desc}</Text>

                    <View style={styles.horizontall} />

                    <View style={styles.datee}>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={styles.heading}>From:</Text>
                            <Text style={styles.textt}>
                                {new Date(event.from).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Text>

                        </View>

                        <View style={styles.verticalLine} />

                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={styles.heading}>Till:</Text>
                            <Text style={styles.textt}>
                                {new Date(event.till).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Text>

                        </View>

                        <View style={styles.verticalLine} />

                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={styles.heading}>Venue:</Text>
                            <Text style={styles.textt}>{event.subtitle}</Text>
                        </View>
                    </View>

                    <View style={styles.horizontall} />
                    <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', alignSelf: 'center' }}>
                        Time: {formatTimeTo12Hour(event.time)}
                    </Text>


                    <View style={styles.horizontall} />
                    <View style={styles.datee}>
                        <TouchableOpacity style={styles.society} onPress={handleOrganizer} >

                            <Image
                                source={{ uri: event.avatars[0] }}
                                style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 10, alignSelf: 'center' }}
                            />
                            <Text style={{ fontWeight: 'bold', color: 'black', alignSelf: 'center' }}>Organizer</Text>
                            <Text style={{ fontWeight: 'bold', color: 'black', alignSelf: 'center' }}>{event.organizer}</Text>
                        </TouchableOpacity>

                        <View style={styles.verticalLine} />

                        <TouchableOpacity style={styles.society} onPress={handleChairman} >

                            <Image
                                source={{ uri: event.avatars[1] }}
                                style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 10, alignSelf: 'center' }}
                            />
                            <Text style={{ fontWeight: 'bold', color: 'black', alignSelf: 'center' }}>Chairman</Text>
                            <Text style={{ fontWeight: 'bold', color: 'black', alignSelf: 'center' }}>{event.chairman}</Text>
                        </TouchableOpacity>
                    </View>

                    {event.guest && event.guest.length > 0 && (
                        <>
                            <View style={styles.horizontall} />
                            <View style={{ marginBottom: 10 }}>
                                <Text style={styles.heading}>Guest:</Text>
                                <View style={styles.sponsorRow}>
                                    {event.guest.map((guest, index) => (
                                        <React.Fragment key={index}>
                                            <TouchableOpacity onPress={() => handleGuestPress(guest)}>
                                                <View style={styles.sponsorItem}>
                                                    <Image
                                                        source={{ uri: `http://172.16.16.215:5000/${guest.image.replace(/\\/g, '/')}` }}
                                                        style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 5 }}
                                                    />
                                                    <Text style={{ fontWeight: 'bold', color: 'black', textAlign: 'center' }}>
                                                        {guest.name}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>

                                            {index !== event.guest.length - 1 && (
                                                <View style={styles.verticalLine} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}

                    {event.sponsors && event.sponsors.length > 0 && (
                        <>
                            <View style={styles.horizontall} />
                            <View style={{ marginBottom: 10 }}>
                                <Text style={styles.heading}>Sponsors:</Text>
                                <View style={styles.sponsorRow}>
                                    {event.sponsors.map((sponsor, index) => (
                                        <React.Fragment key={index}>
                                            <TouchableOpacity onPress={() => handleSponsorPress(sponsor)}>
                                                <View style={styles.sponsorItem}>
                                                    <Image
                                                        source={{ uri: `http://172.16.16.215:5000/${sponsor.image.replace(/\\/g, '/')}` }}
                                                        style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 5 }}
                                                    />
                                                    <Text style={{ fontWeight: 'bold', color: 'black', textAlign: 'center' }}>
                                                        {sponsor.org_name}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>

                                            {/* Vertical Line between sponsors */}
                                            {index !== event.sponsors.length - 1 && (
                                                <View style={styles.verticalLine} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}


                    {/* Gallery Carousel */}

                    {event.gallery && event.gallery.length > 0 && (
                        <View style={{ marginBottom: 15 }}>
                            <View style={styles.horizontall} />
                            <Text style={styles.heading}>Event Gallery:</Text>
                            <Carousel
                                data={event.gallery}
                                renderItem={renderGalleryItem}
                                pagintionCircleFocusColour="blue"
                                pagintionCircleBlurColour="red"
                            />
                        </View>
                    )}



                    {isRegistered ? (
                        <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "40%", marginTop: '3%' }}>
                            <View>
                                <LinearGradient
                                    useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                    colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 8, borderRadius: 10 }}
                                >
                                    <Text style={styles.buttonText}>Registered</Text>
                                </LinearGradient>

                            </View>
                        </View>
                    ) : (
                        <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "40%", marginTop: '3%' }}>
                            <TouchableOpacity onPress={handleRegister}>
                                <LinearGradient
                                    useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                    colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 8, borderRadius: 10 }}
                                >
                                    <Text style={styles.buttonText}>Register</Text>
                                </LinearGradient>

                            </TouchableOpacity>
                        </View>

                    )}




                </ScrollView>
            </View>
        </>


    )
}

export default CurrentEvent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {

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
    sponsorImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 5,
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
    form: {
        marginTop: 10,
        width: '90%',
        alignSelf: 'center',
    },
    datee: {
        flexDirection: 'row',
        // padding: 10,
        // gap: 5,
        marginBottom: 10,
        marginTop: 5,
        justifyContent: 'space-evenly',


    },
    textt: {
        color: 'black',

    },
    verticalLine: {
        width: 1,
        backgroundColor: 'gray',
        marginHorizontal: 8,
        height: '100%',
    },
    horizontall: {
        backgroundColor: "gray",
        height: 1,
        marginVertical: 7
    },
    heading: {
        color: 'black',
        fontWeight: 'bold',
        marginBottom: 7,

    },
    guest: {
        flexDirection: 'column',
        marginBottom: 8,
    },
    society: {
        // padding: 8,

    },
    registerButton: {
        marginTop: 20,
        backgroundColor: '#000', // Match with the rest of your black text/buttons
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3, // subtle shadow
        width: '60%',
        alignSelf: 'center'
    },
    registerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sponsorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 5,
    },

    sponsorItem: {
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 5,
        // width: 100,               // optional: fix width for even layout
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 20,
        padding: 20,
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton1: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    modalButton2: {
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },





})