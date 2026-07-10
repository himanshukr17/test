import React, { use, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';

const UserComplaint = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchEvents();
        console.log("Events:", events);
    }, [])

    const fetchEvents = async () => {
        const userId = await AsyncStorage.getItem('userId');
        console.log("User ID:", userId);

        if (!userId) {
            console.warn("No user ID found in AsyncStorage");
            return;
        }

        try {
            const res = await axios.get(`http://172.16.16.215:5000/RWA/Complaint/user/${userId}`);

            if (res.status === 200) {
                setEvents(res.data.data);
                console.log("Events:", res.data.data);
            } else {
                console.warn("Failed to fetch events, status:", res.status);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }





    return (
        <>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#ccccf6ff', '#e1e1e5ff']}   // left dark → right light
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>Your Complaint</Text>
                    </View>
                </LinearGradient>
                {events.length === 0 ? (
                    <Text style={styles.noData}>You have raise no Complaint</Text>
                ) : (
                    <>

                        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} style={{ padding: 10, marginTop: '7%' }}
                            contentContainerStyle={styles.scrollContent}

                        >
                            {events.map((events, index) => (
                                <View key={index} style={styles.card}>
                                    {/* Title Section */}
                                    <View style={styles.topRoww}>
                                        <View style={styles.leftTop}>
                                            <Icon name="calendar" size={20} color="#555" />
                                            <View style={{ marginLeft: 12,width:'70%' }}>
                                                <Text style={styles.title}>{events.NAME}</Text>
                                                <Text style={styles.subtitle}>{events.DESCRIPTION}</Text>
                                            </View>
                                        </View>

                                        <View>
                                            <View style={{ alignItems: 'flex-start' }}>
                                                {events.FLAG == '1' ? (
                                                    <View style={{ backgroundColor: '#fff3cd', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                                                        <Text style={{ color: '#856404', fontWeight: 'bold', fontSize: 10 }}>Pending</Text>
                                                    </View>
                                                ) : (

                                                    <View style={{ backgroundColor: '#d4edda', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                                                        <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 10 }}>Complaint Raised</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View>
                                                <Text></Text>
                                            </View>
                                        </View>





                                    </View>


                                    {/* Divider */}
                                    {/* <View style={styles.divider} /> */}

                                    {/* Bottom Section */}
                                    {/* <View style={styles.bottomRow}>
                                        <View style={styles.avatarGroup}>

                                        </View>
                                        <View>

                                        </View>
                                    </View> */}
                                </View>
                            ))}




                        </ScrollView>
                    </>

                )}

                {/* Create Service Button */}
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Complaint')}>
                    <Icon name="add" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </>


    );
};

export default UserComplaint;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',

    },
    header: {
        backgroundColor: '#ededfaff',
        elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10
    },
    topRow: {
        position: 'relative',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    backIcon: { position: 'absolute', left: 16, zIndex: 1 },

    noData: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#777',
    },
    scrollContent: {
        paddingBottom: 20,
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
        elevation: 3
    },
    statusImage: {
        width: 100,
        height: 50,
    },

    topRoww: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: "#333"
    },
    subtitle: {
        fontSize: 13,
        color: "#333"
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
    avatarGroup: {
        flexDirection: 'row'
    },
    avatar: {
        height: 30,
        width: 30,
        borderRadius: 20,
        borderColor: "#fff",
        borderWidth: 1
    },
    people: {
        fontSize: 13,
        color: '#444'
    },
    leftTop: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

});
