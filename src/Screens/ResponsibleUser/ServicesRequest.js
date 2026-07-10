import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import Iconn from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';



const ServicesRequest = ({ navigation }) => {
    {/*States*/ }
    const [requests, setRequests] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [ticketIdInput, setTicketIdInput] = useState('');
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [ticketError, setTicketError] = useState('');
    const [empty, setEmpty] = useState('');
    const [startModalVisible, setStartModalVisible] = useState(false);
    const [selectedStartId, setSelectedStartId] = useState(null);

    {/*Refresh Function*/ }
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const res = await axios.get(`http://172.16.16.215:5000/RWA/ServiceTransaction/assigned/${userId}`);
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching service requests:", error);
        } finally {
            setRefreshing(false);
        }
    };

    {/*UseEffect*/ }
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const res = await axios.get(`http://172.16.16.215:5000/RWA/ServiceTransaction/assigned/${userId}`);
                setRequests(res.data);
            } catch (error) {
                console.error("Error fetching service requests:", error);
            }
        };
        fetchRequests();
    }, []);


    {/*Complete Service*/ }
    const handleCompleteService = async () => {
        const selectedRequest = requests.find(r => r._id === selectedTransactionId);
        if (!selectedRequest) {
            setTicketError("Request not found.");
            return;
        }
        if (ticketIdInput.trim().length === 0) {
            setEmpty("Please enter the ticket ID");
            setTicketError('');
            return;
        }

        if (ticketIdInput.trim() !== selectedRequest.TICKET_ID) {
            setTicketError("Ticket ID does not match.");
            setEmpty('');
            return;
        }

        {/*Updating the status to 4*/ }
        try {
            const res = await axios.put(`http://172.16.16.215:5000/RWA/ServiceTransaction/update/${selectedTransactionId}`, {
                STATUS: 4,
                TICKET_ID: ticketIdInput
            });
            if (res.status === 200) {
                setModalVisible(false);
                setTicketIdInput('');
                setTicketError('');
                setEmpty('');
                onRefresh();
            }
        } catch (err) {
            alert("Failed to complete the service");
        }
    };


    {/*Finding the complete and ongoing service*/ }
    const completed = requests.filter(item => item.STATUS === 4);
    const ongoing = requests.filter(item => item.STATUS !== 4);

    return (
        <>
            {/*Modal for in progress*/}
            {modalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalHeading}>Please enter the Ticket ID to complete the service</Text>
                        <View style={styles.modalInputBox}>
                            <TextInput
                                value={ticketIdInput}
                                onChangeText={(text) => {
                                    setTicketIdInput(text);
                                    setEmpty('');
                                    setTicketError('');
                                }}
                                placeholder="Enter Ticket ID"
                                style={styles.modalInput}
                                placeholderTextColor="#999"
                            />
                            {ticketError !== '' && <Text style={styles.errorText}>{ticketError}</Text>}
                            {empty !== '' && <Text style={styles.errorText}>{empty}</Text>}
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                setTicketIdInput('');
                                setTicketError('');
                            }} style={styles.modalCancel}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCompleteService} style={styles.modalConfirm}>
                                <Text style={styles.modalButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/*Modal for start*/}
            {startModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalHeading}>Are you sure you want to start this service?</Text>
                        <View style={styles.modalButtons}>
                            {/*Cancel button function*/}
                            <TouchableOpacity
                                onPress={() => {
                                    setStartModalVisible(false);
                                    setSelectedStartId(null);
                                }}
                                style={styles.modalCancel}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            {/*Start button function and sending status to 4*/}
                            <TouchableOpacity
                                onPress={async () => {
                                    if (selectedStartId) {
                                        try {
                                            const res = await axios.put(`http://172.16.16.215:5000/RWA/ServiceTransaction/update/${selectedStartId}`, {
                                                STATUS: 3
                                            });
                                            if (res.status === 200) {
                                                setStartModalVisible(false);
                                                setSelectedStartId(null);
                                                onRefresh();
                                            }
                                        } catch (err) {
                                            alert("Failed to start the service");
                                        }
                                    }
                                }}
                                style={styles.modalConfirm}
                            >
                                <Text style={styles.modalButtonText}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/*Main Screen*/}
            <LinearGradient
                colors={['#ccccf6ff', '#e1e1e5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.header}>
                    <View style={styles.topRoww}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>My Requests</Text>

                    </View>
                </View>
            </LinearGradient>


            <ScrollView contentContainerStyle={styles.container} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>



                {requests.length === 0 ? (
                    <Text style={styles.noData}>No assigned requests.</Text>
                ) : (
                    <>
                        {/*  Ongoing Services */}
                        {ongoing.map((item, index) => (
                            <View key={`ongoing-${index}`} style={styles.card}>
                                <View style={styles.topRow}>
                                    <View style={{ marginLeft: 12 }}>

                                        <Text style={styles.title}>{item.sub_service_name || 'Service'}</Text>
                                        <Text style={styles.subtitle}>Requested by: <Text style={styles.requestedBy}>{item.requester_details?.name || 'Unknown'}</Text></Text>
                                        <View style={styles.phoneWrapper}>
                                            {/*Call button*/}
                                            <TouchableOpacity onPress={() => {
                                                const phone = item.requester_details?.mobile;
                                                if (phone) Linking.openURL(`tel:${phone}`);
                                            }} style={styles.callButton}>
                                                <LottieView
                                                    source={require('../../assets/Lotties/phone_animation.json')}
                                                    autoPlay
                                                    loop
                                                    style={styles.lottie}
                                                />
                                                <Text style={styles.callText}>{item.requester_details?.mobile || ''}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {/*If status =2 then show start button and if status =3 then show in progress button*/}
                                    {item.STATUS === 2 ? (
                                        <TouchableOpacity onPress={() => {
                                            setSelectedStartId(item._id);
                                            setStartModalVisible(true);
                                        }}
                                            style={styles.startTopButton}>
                                            <Text style={styles.startTopButtonText}>Start</Text>
                                        </TouchableOpacity>
                                    ) : item.STATUS === 3 ? (
                                        <TouchableOpacity onPress={() => {
                                            setSelectedTransactionId(item._id);
                                            setModalVisible(true);
                                        }} style={[styles.startTopButton, { backgroundColor: '#e5fd6f' }]}>
                                            <Text style={styles.startTopButtonText}>In Progress</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>

                                {/*Divider*/}
                                <View style={styles.divider} />

                                {/*Bottom Section*/}
                                <View style={styles.bottomRow}>

                                    <View style={styles.responsibleBox}>
                                        <View style={styles.row}>
                                            <Iconn name="building" size={22} color="#333" style={{ marginRight: 6, marginTop: 5 }} />
                                            <View>
                                                <Text style={[styles.people,]}>
                                                    Building Number: {item.requester_details?.building_no}
                                                </Text>
                                                <Text style={styles.people}>
                                                    Flat Number: {item.requester_details?.flat_no}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View>

                                        <Text style={styles.people1}>{new Date(item.CREATION_DATE).toLocaleDateString()}</Text>
                                        <Text style={styles.people1}>{new Date(item.CREATION_DATE).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}

                        {/*  Completed Section */}
                        {completed.length > 0 && (
                            <Text style={{ fontWeight: 'bold', fontSize: 16, marginVertical: 10, color: 'black', alignSelf: 'center', marginBottom: 30 }}>
                                Completed Services
                            </Text>
                        )}
                        {completed.map((item, index) => (
                            <View key={`completed-${index}`} style={[styles.card]}>

                                {  /*Top Section*/}
                                <View style={styles.topRow}>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.title}>{item.sub_service_name || 'Service'}</Text>
                                        <Text style={styles.subtitle}>
                                            Requested by: <Text style={styles.requestedBy}>{item.requester_details?.name || 'Unknown'}</Text>
                                        </Text>
                                        <View style={styles.phoneWrapper}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const phone = item.requester_details?.mobile;
                                                    if (phone) Linking.openURL(`tel:${phone}`);
                                                }}
                                                style={styles.callButton}
                                            >
                                                <LottieView
                                                    source={require('../../assets/Lotties/phone_animation.json')}
                                                    autoPlay
                                                    loop
                                                    style={styles.lottie}
                                                />
                                                <Text style={styles.callText}>{item.requester_details?.mobile || ''}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/*  Button on top-right of completed cards */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            alert(`Completed - Ticket ID: ${item.TICKET_ID}`);
                                        }}
                                        style={[styles.startTopButton, { backgroundColor: '#8df186' }]} // Light blue button
                                    >
                                        <Text style={styles.startTopButtonText}>Completed</Text>
                                    </TouchableOpacity>
                                </View>


                                {/*Divider*/}
                                <View style={styles.divider} />


                                {/*Bottom Section*/}
                                <View style={styles.bottomRow}>
                                    <View style={styles.responsibleBox}>
                                        <View style={styles.row}>
                                            <Iconn name="building" size={22} color="#333" style={{ marginRight: 6, marginTop: 5 }} />
                                            <View>
                                                <Text style={[styles.people]}>
                                                    Building Number: {item.requester_details?.building_no}
                                                </Text>
                                                <Text style={styles.people}>
                                                    Flat Number: {item.requester_details?.flat_no}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    {/* Date and time */}
                                    <View>
                                        <Text style={styles.people1}>{new Date(item.CREATION_DATE).toLocaleDateString()}</Text>
                                        <Text style={styles.people1}>{new Date(item.CREATION_DATE).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}

                    </>
                )}
            </ScrollView>
        </>
    );
};

export default ServicesRequest;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f0f2f5',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    heading: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
        marginBottom: 20,
        textAlign: 'center',
        marginBottom: 40,

    },
    noData: {
        fontSize: 16,
        textAlign: 'center',
        color: '#777',
        marginTop: 30,
    },

    requestedBy: {
        fontSize: 13,
        fontWeight: '500',
        color: '#444',
        marginBottom: 6,
    },
    date: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',

        padding: 10,
        paddingBottom: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    subtitle: {
        fontSize: 13,
        color: '#333',
    },
    divider: {
        backgroundColor: '#eee',
        height: 1,
        marginVertical: 2,

    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    people: {
        fontSize: 12,
        color: 'black',
    },
    people1: {
        fontSize: 13,
        color: 'black',
    },
    responsibleBox: {
        flexDirection: 'column',
        backgroundColor: '#dde2e2',
        borderRadius: 12,
        paddingLeft: 10,
        paddingRight: 10,
        padding: 2,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 60,
        right: 20,
        backgroundColor: 'white',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    phoneWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: "-8%"

    },

    callButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    lottie: {
        height: 50,
        width: 50,

    },

    callText: {
        color: '#7876e2',
        fontWeight: '600',
        fontSize: 14,

    },

    startTopButton: {
        backgroundColor: '#7474f5',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 50,
        alignSelf: 'flex-start',

    },

    startTopButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 13,

    },

    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    modalBox: {
        width: '85%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        elevation: 10,
    },
    modalHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#222',
    },
    modalInputBox: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    modalInput: {
        height: 40,
        fontSize: 14,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalCancel: {
        backgroundColor: 'red',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalConfirm: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginTop: 5,
        marginBottom: 10,
        fontSize: 13,
    },
    header: {
        
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 5
    },
    topRoww: {
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
});
