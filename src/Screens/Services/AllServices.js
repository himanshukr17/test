import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Iconn from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';

const AllServices = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [active, setActive] = useState('ongoing')
    const [selectedTab, setSelectedTab] = useState('ALL'); // Options: ALL, ASSIGNED, IN_PROGRESS, COMPLETED
    const [feedbackModal, setFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState(
        {
            RATING: 0,

        }
    );
    const [selectedServiceId, setSelectedServiceId] = useState(null);

    {/* Toast for notifications */ }
    const toast = useToast();




    { /* Function to fetch different tabs */ }
    const filteredRequests = requests.filter(item => {
        if (selectedTab === 'ALL') return true;
        if (selectedTab === 'ASSIGNED') return item.STATUS === 2;
        if (selectedTab === 'IN_PROGRESS') return item.STATUS === 3;
        if (selectedTab === 'COMPLETED') return item.STATUS === 4;
        return true;
    });


    //status steps
    const steps = [
        { label: 'Created', status: 1 },
        { label: 'Assigned', status: 2 },
        { label: 'In Progress', status: 3 },
        { label: 'Completed', status: 4 },
    ];

    const statusColors = {
        1: '#FFCDD2', // Created 
        2: '#FFE082', // Assigned 
        3: '#BBDEFB', // In Progress 
        4: '#C8E6C9', // Completed
    };



    {/*Refresh Function*/ }
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const res = await axios.get(`http://172.16.16.215:5000/RWA/ServiceTransaction/user/${userId}`);
                setRequests(res.data);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setRefreshing(false);
        }
    };

    {/*Every time the screen comes into focus.*/ }
    useFocusEffect(
        React.useCallback(() => {
            const fetchMyRequest = async () => {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;
                try {
                    const res = await axios.get(
                        `http://172.16.16.215:5000/RWA/ServiceTransaction/user/${userId}`
                    );
                    setRequests(res.data);
                    console.log("Requests:", res.data);
                    setLoading(false);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchMyRequest();

        }, [])
    );

    const handleFeedbackSubmit = async () => {
        try {
            if (!selectedServiceId) return;
            console.log("Selected Service ID:", selectedServiceId);
            console.log("Feedback:", feedback);

            const res = await axios.put(
                `http://172.16.16.215:5000/RWA/ServiceTransaction/feedback/${selectedServiceId}`,
                {
                    RATING: Number(feedback.RATING),  // yeh feedback form ka state se aayega
                    // yeh bhi form state se hi aayega
                }
            );


            console.log("Feedback submitted:", feedback);
            setFeedbackModal(false);
            setFeedback({ RATING: 0 }); // reset form
            onRefresh(); // refresh data

            if (res.status === 200) {
                toast.show("✅ Feedback Submitted Successful!", {
                    type: "success",
                    placement: "top",
                    duration: 2500,
                    animationType: "zoom-in",
                    style: {
                        backgroundColor: '#d0f5d8',
                        borderRadius: 10,
                        padding: 12,
                        borderColor: '#5bd67a',
                        borderWidth: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5
                    },
                    textStyle: {
                        color: '#1a3c24',
                        fontSize: 14,
                        fontWeight: '600'
                    }
                });
            }
        } catch (error) {
            console.log("Feedback error:", error);
        }
    };

    const tabIcons = {
        ALL: { name: "apps", color: "#a3a3f4ff" }, // Ionicons
        ASSIGNED: { name: "checkmark-done-outline", color: "#a3a3f4ff" },
        IN_PROGRESS: { name: "time-outline", color: "#a3a3f4ff" },
        COMPLETED: { name: "checkmark-circle-outline", color: "#a3a3f4ff" },
    };




    return (
        <>
            {/*Feedback Modal*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={feedbackModal}
                onRequestClose={() => setFeedbackModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeIcon} onPress={() => setFeedbackModal(false)}>
                            <Icon name="close" size={24} color="#333" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Send Feedback</Text>

                        <View style={{ width: "100%", paddingHorizontal: 15, marginTop: 10 }}>

                            {/* Rating Label */}
                            {/* Rating Label */}
                            <Text style={styles.label}>Your Rating</Text>
                            <View style={styles.starRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setFeedback({ ...feedback, RATING: star })}
                                    >
                                        <Icon
                                            name={star <= feedback.RATING ? "star" : "star-outline"}
                                            size={28}
                                            color={star <= feedback.RATING ? "#FFD700" : "#aaa"}
                                            style={{ marginHorizontal: 3 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity style={styles.modalButton1} onPress={handleFeedbackSubmit}>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Submit</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

            {/** Header **/}
            <LinearGradient
                colors={['#ccccf6ff', '#e1e1e5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View >

                    <View style={styles.topRoww}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>Services</Text>

                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 2 }}>
                        {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((tab) => {
                            const icon = tabIcons[tab];
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
                                    onPress={() => setSelectedTab(tab)}
                                >
                                    <Icon
                                        name={icon.name}
                                        size={28}
                                        color={selectedTab === tab ? "white" : icon.color}
                                        style={{ justifyContent: 'center', alignSelf: 'center', paddingBottom: 5,fontWeight:'bold' }}
                                    />
                                    <Text
                                        style={[
                                            styles.tabText,
                                            selectedTab === tab && styles.activeTabText
                                        ]}
                                    >
                                        {tab.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                    </View>
                </View>
            </LinearGradient>
            <View style={styles.container}>{/*Main Container */}


                {/*If there are no requests show this else show the requests*/}


                {requests.length === 0 ? (
                    <Text style={styles.noData}>You haven't submitted any requests.</Text>
                ) : (
                    <>
                        {/* Filter Row */}


                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        >

                            {/* Map through filtered requests and display each service request */}
                            {filteredRequests.map((item, index) => (
                                <View key={`${item._id}-${index}`}>
                                    <View style={styles.card}>
                                        {/* Top Section */}
                                        <View style={styles.topRow}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <Icon name="construct-outline" size={20} color="#555" />
                                                <View style={{ marginLeft: 12 }}>
                                                    <Text style={styles.title}>{item.sub_service_name || 'Service'}</Text>
                                                    <Text style={styles.subtitle}>Ticket ID: {item.TICKET_ID}</Text>
                                                </View>
                                            </View>

                                            <View style={{ alignItems: 'flex-end' }} >
                                                {item.responsible_user_name?.image && (
                                                    <Image
                                                        source={{ uri: item.responsible_user_name.image }}
                                                        style={{ width: 40, height: 40, borderRadius: 40, marginBottom: 5 }}
                                                    />
                                                )}
                                                <Text style={{ fontWeight: 'bold', color: 'black' }}>{item.responsible_user_name?.name || 'N/A'}</Text>
                                            </View>







                                        </View>

                                        {/* Divider */}
                                        <View style={styles.divider} />

                                        {/* Bottom Section */}
                                        <View style={styles.bottomRow}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.responsibleBox,
                                                    { backgroundColor: statusColors[item.STATUS] || '#dde2e2' }
                                                ]}
                                                onPress={() => navigation.navigate('Timeline', { serviceId: item._id })}
                                            >


                                                <Text style={{ color: 'black', fontSize: 12, fontWeight: 'bold', paddingVertical: 6 }}>
                                                    {steps.find(s => s.status === item.STATUS)?.label || 'Unknown Status'}
                                                </Text>
                                            </TouchableOpacity>
                                            {item.STATUS === 4 ? (
                                                <TouchableOpacity
                                                    style={styles.feedbackButton}
                                                    activeOpacity={0.7}
                                                    onPress={() => {
                                                        setSelectedServiceId(item._id);
                                                        setFeedbackModal(true);
                                                    }}
                                                >
                                                    <Icon name="chatbubble-ellipses-outline" size={18} color="black" style={{ marginRight: 3 }} />
                                                    <Text style={{ color: 'black', fontWeight: '600', fontSize: 12 }}>Give Feedback</Text>
                                                </TouchableOpacity>

                                            ) : (
                                                <View>
                                                    <Text style={styles.people1}>
                                                        {new Date(item.CREATION_DATE).toLocaleDateString()}
                                                    </Text>
                                                    <Text style={styles.people1}>
                                                        {new Date(item.CREATION_DATE).toLocaleTimeString(undefined, {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </Text>
                                                </View>
                                            )}



                                        </View>
                                    </View>
                                </View>
                            ))}

                        </ScrollView>
                    </>

                )}

                {/* Create Service Button */}
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('CreateService')}>
                    <Icon name="add" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </>


    );
};

export default AllServices;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',
        padding: 16,
    },

    noData: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#777',
    },
    scrollContent: {
        paddingBottom: 20,
        marginTop: 10
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 3,

    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    subtitle: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        backgroundColor: '#eee',
        height: 1.5,
        marginVertical: 10,
        marginTop: 20
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    ticketId: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#444',
        alignSelf: 'flex-start',
    },
    header: {


        marginBottom: 5
    },
    toppRow: {
        position: 'relative',
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },



    titled: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    filterRow: {

        flexDirection: 'row',
        gap: 4,
        marginBottom: 20,
        backgroundColor: '#ededfaff',
        borderRadius: 8,
        // padding: 10,
    },

    tabButton: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        // backgroundColor: '#ededfaff',
        // borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
        // padding: 10,
    },




    activeTab: {
        // backgroundColor: '#d6f8d7ff',
        borderBottomWidth: 3,        // thickness of the underline
        borderBottomColor: '#a3a3f4ff', // underline color

    },

    tabText: {
        fontSize: 8,
        color: 'black',
        fontWeight: 'bold',
    },

    activeTabText: {
        color: 'black',
    },

    dividerLine: {
        borderRightWidth: 1,
        borderRightColor: '#ccc',
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalBox: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    closeIcon: {
        alignSelf: 'flex-end',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
        color: 'black'
    },
    modalButton1: {
        marginTop: 20,
        backgroundColor: '#4a90e2',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',

    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ededfaff',
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        paddingHorizontal: 5
    },
    starRow: {
        flexDirection: "row",
        marginVertical: 10,
        justifyContent: "center",
    }


});
