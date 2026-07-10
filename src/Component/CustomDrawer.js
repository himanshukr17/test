import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const CustomDrawer = ({ navigation, setIsAuth }) => {

    const [profile, setProfile] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const loadProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            console.log(token)
            const response = await axios.get('http://172.16.16.215:5000/RWA/User/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProfile(response.data.user);
            console.log(response.data.user);

        } catch (error) {
            console.error('Failed to load drawer profile:', error);
        }
    }

    useEffect(() => {
        loadProfile();
        console.log(profile);

    }, []);




    const handleLogout = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');

            // Step 1: Send request to backend to delete FCM token
            if (userId) {
                try {
                    await axios.post('http://172.16.16.215:5000/RWA/ServiceTransaction/delete-token', {
                        userId: userId,
                    });
                    console.log(' FCM token removed from backend');
                } catch (deleteErr) {
                    console.log(' Failed to delete token from backend:', deleteErr.message);
                }
            }

            // Step 2: Clear AsyncStorage
            try {
                await AsyncStorage.clear();
                console.log(' AsyncStorage cleared');
            } catch (storageErr) {
                console.log(' Failed to clear AsyncStorage:', storageErr.message);
            }

            // Step 3: Navigate to login
            setIsAuth(false);
        } catch (error) {
            console.log(' General logout error:', error.message);
            Alert.alert('Logout Failed', 'Please try again.');
        }
    };


    return (
        <>
            {/* Logout Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
                        <View style={{ flexDirection: "row", justifyContent: 'space-evenly' }}>
                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '3%' }}>
                                <TouchableOpacity onPress={handleLogout}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#cfddceff', '#79c66cff', 'rgba(53, 113, 56, 0.58)']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 8, borderRadius: 10 }}
                                    >
                                        <Text style={styles.buttonTextt}>Yes</Text>
                                    </LinearGradient>

                                </TouchableOpacity>
                            </View>

                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '3%' }}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#dad4d4ff', '#e7483cff', 'rgba(210, 44, 44, 0.98)']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 8, borderRadius: 10 }}
                                    >
                                        <Text style={styles.buttonTextt}>No</Text>
                                    </LinearGradient>

                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </View>

            </Modal>



            <View style={styles.container}>
                {/* Header section */}
                <LinearGradient
                    colors={['#ccccf6ff', '#e1e1e5ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.header}>
                        {profile?.image ? (
                            <Image
                                source={{ uri: `http://172.16.16.215:5000/${profile.image.replace(/\\/g, '/')}` }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
                        )}
                        <View>
                            <Text style={styles.username}>{profile?.first_name} {profile?.last_name}</Text>

                        </View>


                    </View>
                </LinearGradient>

                {/* Manual Drawer Buttons */}
                <View style={styles.menu}>
                    <View>
                        {profile?.type === 7 ? (
                            // Maid role screens
                            <>
                                <DrawerButton
                                    title="Dashboard"
                                    icon="grid-outline"
                                    onPress={() => navigation.navigate('MaidDashboard')}
                                />
                                <View style={styles.divider} />

                            </>
                        ) : (
                            //  Normal role screens
                            <>
                                <DrawerButton
                                    title="Home"
                                    icon="home-outline"
                                    onPress={() => navigation.navigate('Home')}
                                />
                                <View style={styles.divider} />
                                <DrawerButton
                                    title="Profile"
                                    icon="person-circle-outline"
                                    onPress={() => navigation.navigate('Profile')}
                                />
                                <View style={styles.divider} />
                            </>
                        )}
                    </View>



                    {/* Logout Button */}
                    <View>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>

                            <Icon name="log-out-outline" size={20} color="#000" />
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </>

    );
};

// Drawer Button Component
const DrawerButton = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Icon name={icon} size={20} color="#2c3e50" />
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingVertical: 40,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        // backgroundColor: '#f5f7fa',
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        shadowRadius: 3,
        // elevation: 3,
        // borderBottomLeftRadius: 20,
        // borderBottomRightRadius: 20,
        flexDirection: 'row',
        gap: 15,

    },

    avatar: {
        height: 80,
        width: 80,
        borderRadius: 45,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1
    },


    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black'
    },
    menu: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        // backgroundColor:'red'
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 10,
        marginBottom: 10

    },
    buttonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: '500'
    },
    divider: {
        backgroundColor: "#e3e2e2ff",
        height: 1,

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
    modalMessage: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#b72a2aff',
    },
    buttonTextt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },
});

export default CustomDrawer;
