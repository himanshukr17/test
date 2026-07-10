import { ActivityIndicator, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Iconn from 'react-native-vector-icons/FontAwesome6';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';

const MaidDashboard = ({ navigation }) => {

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [refreshing, setRefreshing] = useState(false);




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


    useFocusEffect(React.useCallback(() => {
        fetchUserProfile();
    }, []));



    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserProfile();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#ffa800" />
            </View>
        );
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
                        <TouchableOpacity
                            style={styles.backIcon}
                            onPress={() => navigation.openDrawer()}   // 👈 ab ye hamesha MaidDrawer kholega
                        >
                            <Iconn name="bars-staggered" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>Your Profile</Text>

                    </View>
                </LinearGradient>


                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    style={styles.form} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={{ padding: 6, backgroundColor: 'white', borderRadius: 20, margin: '5%' }}>
                        <View style={{ margin: 4, alignSelf: 'center' }}>
                            {user && user.image ? (
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={{ uri: `http://172.16.16.215:5000/${user.image.replace(/\\/g, '/')}` }}
                                        style={styles.avatar}
                                    />

                                </View>
                            ) : (
                                <>
                                    <View style={styles.avatarContainer} >
                                        <View style={[styles.avatar, styles.emptyAvatar]}>
                                            <Icon name="person-outline" size={45} color="#888" />
                                        </View>
                                    </View>
                                </>


                            )}

                        </View>
                        <View style={{ padding: 5, flexDirection: 'column', justifyContent: 'center', marginLeft: '3%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '5%', }}>
                                <Icon name="person" size={13} color="black" />
                                <Text style={{ color: 'black', fontWeight: 500, fontSize: 15, marginLeft: '2%' }}>
                                    Name: <Text style={{ color: 'black', fontSize: 15, fontWeight: 400 }}>{user && user.first_name} {user && user.last_name}</Text>
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '5%', }}>
                                <Icon name="mail" size={13} color="black" />
                                <Text style={{ color: 'black', fontWeight: 500, fontSize: 15, marginLeft: '2%' }}>
                                    Email: <Text style={{ color: 'black', fontSize: 15, fontWeight: 400 }}>{user && user.email} </Text>
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '5%', }}>
                                <Icon name="call" size={13} color="black" />
                                <Text style={{ color: 'black', fontWeight: 500, fontSize: 15, marginLeft: '2%' }}>
                                    Contact:<Text style={{ color: 'black', fontSize: 15, fontWeight: 400 }}> {user && user.number}</Text>
                                </Text>
                            </View>

                        </View>


                    </View>
                    <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "50%" }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Maid', { details: user })}>
                            <LinearGradient
                                useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ padding: 10, borderRadius: 10 }}
                            >
                                <Text style={{ color: 'white', fontWeight: '500', fontSize: 15, textAlign: 'center' }}>
                                    Complete Profile
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>


                    {/** QR Code */}

                    <View style={{ padding: 10, backgroundColor: 'white', borderRadius: 20, margin: '5%' }}>
                        <View style={{ margin: 4, alignSelf: 'center' }}>
                            <Text style={{ color: 'black', fontWeight: 700, fontSize: 20, marginBottom: '5%', padding: 10 }}>
                                Your QR Code:
                            </Text>
                        </View>
                        <View style={{ alignItems: 'center',marginBottom: '5%' }}>
                            <QRCode
                                value={JSON.stringify({
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    email: user.email,
                                    number: user.number,
                                    type: "Maid"
                                })}
                                size={200}
                                backgroundColor="transparent"
                                color='black'

                            />
                        </View>



                    </View>

                </ScrollView>
            </View >
        </>

    )
}


export default MaidDashboard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5ff'
    },
    header: {
        backgroundColor: '#dcdcfaff',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 10,
    },
    successBox: {
        borderLeftWidth: 6,
        borderLeftColor: '#4BB543',
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 10,
    },
    errorBox: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 10,
        borderLeftWidth: 6,
        borderLeftColor: '#D0342C',
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 12,
    },

    dobInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,            //  selected box ki height
        minHeight: 28,         //  by default 40 hota hai, isse force chhota hoga
        borderRadius: 6,
        borderColor: '#f5f5ff',
        borderBottomColor: '#9f8e9fff',
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderRadius: 8,
        border: 'none',
        backgroundColor: 'transparent',
        marginBottom: 10
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
        width: 80,
        height: 80,
        marginBottom: '2%',
        // backgroundColor: 'blue'
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
    modalButtonText: {
        color: 'black',
        fontSize: 11,
        fontWeight: '500',
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
    avatar: {
        height: '100%',
        width: '100%',
        borderRadius: 60,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'red',

    },
})