

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Animated, Easing, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import Iconn from 'react-native-vector-icons/FontAwesome6';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import LottieView from 'lottie-react-native';
import { PermissionsAndroid, Platform, Linking } from 'react-native';
import { pick } from '@react-native-documents/picker';
import LinearGradient from 'react-native-linear-gradient';


const Profile = ({ navigation }) => {
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

    {/* fetching user profile */ }
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

    const handleImagePick = () => {
        setIsModalVisible(true);
    };

    {/* image upload */ }
    const handleImageUpload = async (image) => {
        const formData = new FormData();
        formData.append('user_id', user.user_id);
        formData.append('image', {
            uri: image.uri,
            name: image.fileName || 'profile.jpg',
            type: image.type || 'image/jpeg',
        });

        try {
            const res = await axios.put(
                'http://172.16.16.215:5000/RWA/User/updateDetails',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            setUser(res.data);
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };




    //getting camera permission
    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "We need access to your camera to take your profile photo",
                    buttonPositive: "OK",
                    buttonNegative: "Cancel"
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                Alert.alert(
                    "Permission Required",
                    "Camera access has been permanently denied. Please enable it from Settings.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => Linking.openSettings() }
                    ]
                );
                return false;
            } else {
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    //types
    const typeLabels = {
        1: "Tenant",
        2: "Owner",
        3: "Guard",
        4: "Service Agent",
        5: "Committee Member",
        6: "Hawker",
        7: "Maid"
    };


    {/* storage permission */ }
    const requestStoragePermission = async () => {
        if (Platform.OS === 'android' && Platform.Version < 30) {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'We need access to your files to upload police verification',
                        buttonPositive: 'OK',
                        buttonNegative: 'Cancel',
                    }
                );

                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else {
            // Android 11+ me DocumentPicker khud file picker open karega
            return true;
        }
    };



    {/* police verification */ }
    const handlePoliceVerificationPick = async () => {
        const hasStoragePermission = await requestStoragePermission();

        if (!hasStoragePermission) {
            Alert.alert('Storage permission is required to upload files');
        }
        try {
            const [file] = await pick({
                type: ['application/pdf'], // ya DocumentPicker.types.pdf
                copyTo: 'cachesDirectory', // optional, local copy rakhna hai
                mode: 'open', // default
                allowMultiSelection: false, // single file
            });

            console.log('Picked file:', file);
            await handleFileUpload(file);

        } catch (err) {
            if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
                console.log('User cancelled the picker');
            } else {
                console.error('Picker error:', err);
            }
        }
    };


    {/* file upload */ }
    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('user_id', user.user_id);
        formData.append('memberShipFile', {
            uri: file.uri,
            name: file.fileName || 'membership.pdf',
            type: file.type || 'application/pdf',
        });
        try {
            const res = await axios.put('http://172.16.16.215:5000/RWA/User/updateDetails',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setUser(res.data);
            alert("Police verification uploaded successfully!");
        } catch (error) {
            console.error('File upload failed:', error);
        }
    }



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


            {/* image upload modal */}
            <Modal
                animationType="none"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => {
                    setIsModalVisible(false);
                    setSelectedVehicle(null);
                }}
            >
                <View style={styles.modalOverlayPicture}>
                    <Animated.View style={[styles.modalBoxPicture, modalStyle]}>
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => {
                                setIsModalVisible(false);
                                setSelectedVehicle(null);
                            }}
                        >
                            <Icon name="close" size={24} color="#333" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.modalTitle}>Update Profile Photo</Text>

                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 10 }}>

                                <View >
                                    <View style={{ backgroundColor: "#ededfaff", height: 80, width: 120, borderRadius: 10, marginBottom: 10 }}>
                                        <LottieView
                                            source={require('../../assets/Lotties/camera.json')}
                                            autoPlay
                                            loop
                                            style={{ width: 80, height: 80, alignSelf: 'center' }}
                                        />

                                    </View>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={async () => {
                                            const hasPermission = await requestCameraPermission();
                                            if (hasPermission) {
                                                setIsModalVisible(false);
                                                launchCamera({ mediaType: 'photo', quality: 1 }, response => {
                                                    if (!response.didCancel && !response.errorCode) {
                                                        handleImageUpload(response.assets[0]);
                                                    } else {
                                                        console.log("Camera error:", response.errorCode, response.errorMessage);
                                                    }
                                                });
                                            } else {
                                                console.log("Camera permission denied");
                                            }
                                        }}
                                    >
                                        <Text style={styles.modalButtonText}>📷 Open Camera</Text>
                                    </TouchableOpacity>

                                </View>

                                <View >
                                    <View style={{ backgroundColor: "#ededfaff", height: 80, width: 120, borderRadius: 10, alignSelf: 'center', marginBottom: 10 }}>
                                        <LottieView
                                            source={require('../../assets/Lotties/gallery.json')}
                                            autoPlay
                                            loop
                                            style={{ width: 80, height: 80, alignSelf: 'center' }}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => {
                                            setIsModalVisible(false);
                                            launchImageLibrary({ mediaType: 'photo', quality: 1 }, response => {
                                                if (!response.didCancel && !response.errorCode) {
                                                    handleImageUpload(response.assets[0]);
                                                }
                                            });
                                        }}
                                    >
                                        <Text style={styles.modalButtonText}>🖼️ Choose from Gallery</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>



                        </View>
                    </Animated.View>
                </View>
            </Modal>



            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <LinearGradient
                    colors={['#ccccf6ff', '#e1e1e5ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backIcon}>
                                <Icon name="arrow-back" size={24} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.titled}>Profile</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: 20, paddingBottom: 40 }}>
                    {user.image ? (
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: `http://172.16.16.215:5000/${user.image.replace(/\\/g, '/')}` }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.editIconWrapper} onPress={handleImagePick}>
                                <Icon name="pencil" size={20} color="white" style={{ padding: 4 }} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleImagePick}>
                            <View style={[styles.avatar, styles.emptyAvatar]}>
                                <Icon name="person-outline" size={45} color="#888" />
                                <View style={styles.addIconWrapper}>
                                    <Icon name="add-circle" size={20} color="black" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}


                    {/* Name with conditional icon */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.name}>
                            {user.first_name} {user.last_name}
                        </Text>

                        {user.type === 2 && (
                            <Image source={require('../../assets/images/green.png')} style={styles.icon} />
                        )}

                        {user.type === 5 && (
                            <Image source={require('../../assets/images/green.png')} style={styles.icon} />
                        )}

                        {user.type == 1 && (
                            <>
                                {user.status == 0 && (
                                    <Image source={require('../../assets/images/grey.png')} style={styles.icon} />
                                )}
                                {user.status == 1 && (
                                    <Image source={require('../../assets/images/blue.png')} style={styles.icon} />
                                )}
                            </>
                        )}

                        {/* If neither condition is met, nothing will render */}
                    </View>


                    <Text style={styles.type}>{typeLabels[user.type]}</Text>

                    {/* Edit Profile Button */}
                    <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '3%' }}>
                        <TouchableOpacity onPress={() => navigation.navigate("CompleteProfile", { isEdit: true, user })}>
                            <LinearGradient
                                useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ padding: 8, borderRadius: 10 }}
                            >
                                <Text style={styles.buttonText}>{user.flat_no ? "Edit Profile" : "Complete Profile"}</Text>
                            </LinearGradient>

                        </TouchableOpacity>
                    </View>



                </View>


                <View style={styles.detailsContainer}>
                    <Text style={styles.heading}>Personal Details</Text>
                    <View style={styles.details}>
                        <View style={styles.detailing}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{user.email}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailing}>
                            <Text style={styles.label}>Mobile Number:</Text>
                            <Text style={styles.value}>{user.number}</Text>
                        </View>
                        {user.type == 1 && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Upload Police Verification:</Text>

                                    {user.type == 1 && (
                                        <>
                                            {user.status == 0 && (
                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: '#89788a',
                                                        height: 20,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: 10,
                                                        width: '30%',
                                                        marginTop: 5
                                                    }}
                                                    onPress={handlePoliceVerificationPick}
                                                >
                                                    <Text style={{ color: 'white', fontSize: 10 }}>Upload PDF</Text>
                                                </TouchableOpacity>
                                            )}
                                            {user.status == 1 && (
                                                <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "25%"}}>
                                                    <TouchableOpacity >
                                                        <LinearGradient
                                                            useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                                            colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{ padding: 5, borderRadius: 10 }}
                                                        >
                                                            <Text style={styles.buttonText2}>Verified</Text>
                                                        </LinearGradient>

                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>

                            </>
                        )}
                        {user.dob && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Dob:</Text>
                                    <Text style={styles.value}>
                                        {new Date(user.dob).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </View>
                            </>
                        )}
                        {user.adhar && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Adhar Number:</Text>
                                    <Text style={styles.value}>{user.adhar}</Text>
                                </View>
                            </>
                        )}
                        {user.gender && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Gender:</Text>
                                    <Text style={styles.value}>{user.gender}</Text>
                                </View>
                            </>
                        )}
                        {user.martial && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Martial Status:</Text>
                                    <Text style={styles.value}>{user.martial}</Text>
                                </View>
                            </>
                        )}
                    </View>



                    {user.flat_no && user.block_no && user.address && user.pocket && user.occupation_type && (
                        <>
                            <Text style={styles.heading}>Address</Text>
                            <View style={styles.details}>
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Address:</Text>
                                    <Text style={styles.value}>{user.address}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Pocket:</Text>
                                    <Text style={styles.value}>{user.pocket}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Flat & Floor:</Text>
                                    <Text style={styles.value}>{user.flat_no} {"-"} {user.floor}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Block No:</Text>
                                    <Text style={styles.value}>{user.block_no}</Text>
                                </View>
                            </View>

                            <Text style={styles.heading}>Occupation</Text>
                            <View style={styles.details}>
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Occupation:</Text>
                                    <Text style={styles.value}>{user.occupation}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.detailing}>
                                    <Text style={styles.label}>Occupation Type:</Text>
                                    <Text style={styles.value}>{user.occupation_type}</Text>
                                </View>
                                {user.company && (
                                    <>
                                        <View style={styles.divider} />
                                        <View style={styles.detailing}>
                                            <Text style={styles.label}>Company:</Text>
                                            <Text style={styles.value}>{user.company}</Text>
                                        </View>
                                    </>
                                )}
                                {user.linkedin && (
                                    <>
                                        <View style={styles.divider} />
                                        <View style={styles.detailing}>
                                            <Text style={styles.label}>Linkedin:</Text>
                                            <Text style={styles.value}>{user.linkedin}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView >
        </>
    );
};

export default Profile;

const styles = StyleSheet.create({
    divider: {
        backgroundColor: "#e3e2e2ff",
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
        backgroundColor: '#f7f8fc',
        borderRadius: 12,
        elevation: 3,
        marginBottom: 10
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
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center'
    },
    buttonText2: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center'
    },
});