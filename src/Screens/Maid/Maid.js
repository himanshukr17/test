// Same imports
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Linking } from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const Maid = ({ navigation, route }) => {
    const { details } = route.params;
    console.log("details:", details);

    // user backend details
    const [user, setUser] = useState(null);

    // profile image ke liye independent state
    const [profileImage, setProfileImage] = useState(null);

    // form states
    const [formData, setFormData] = useState({
        dob: '',
        address: '',
        occupation: '',
        adhar: '',
        martial: '',
        gender: '',
    });

    // ui states
    const [martialOpen, setMartialOpen] = useState(false);
    const [genderOpen, setGenderOpen] = useState(false);
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errors, setErrors] = useState({});

    // init values
    useEffect(() => {
        if (details) {
            setUser(details);
            setFormData({
                dob: details.dob ? details.dob.split("T")[0] : '',
                address: details.address || '',
                occupation: details.occupation || '',
                adhar: details.adhar ? String(details.adhar) : '',
                martial: details.martial || '',
                gender: details.gender || '',
            });
            if (details.image) {
                setProfileImage(`http://172.16.16.215:5000/${details.image.replace(/\\/g, "/")}`);
            }
        }
    }, [details]);

    // change handler
    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // dob change
    const handleDOBChange = (event, selectedDate) => {
        setShowDOBPicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0];
            handleChange('dob', formatted);
            if (errors.dob) setErrors(prev => ({ ...prev, dob: false }));
        } else {
            setErrors(prev => ({ ...prev, dob: true }));
        }
    };

    // image upload
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

            if (res.data.image) {
                setProfileImage(`http://172.16.16.215:5000/${res.data.image.replace(/\\/g, "/")}`);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    // camera permission
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

    // submit form
    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.address.trim()) newErrors.address = true;
        if (!formData.occupation.trim()) newErrors.occupation = true;
        if (!formData.adhar.trim()) newErrors.adhar = true;
        if (!formData.martial.trim()) newErrors.martial = true;
        if (!formData.gender.trim()) newErrors.gender = true;
        if (!formData.dob.trim()) newErrors.dob = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setErrorModalVisible(true);
            return;
        }

        try {
            const user_Id = await AsyncStorage.getItem('userId');
            if (!user_Id) {
                Alert.alert('Error', 'User ID not found in storage');
                return;
            }

            const payload = {
                user_id: user_Id,
                ...formData,
            };

            const res = await axios.put('http://172.16.16.215:5000/RWA/User/updateDetails', payload);
            console.log("Upload response:", res.data);

            setUser(res.data);
            setSuccessModalVisible(true);

            // reset form
            setFormData({
                dob: '',
                address: '',
                occupation: '',
                adhar: '',
                martial: '',
                gender: '',
            });
            setErrors({});
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    // dropdown data
    const [list, setList] = useState([
        { label: 'Single', value: 'Single' },
        { label: 'Married', value: 'Married' },
    ]);

    const [genderList, setGenderList] = useState([
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Prefer not to say', value: 'Prefer not to say' },
    ]);

    return (
        <>
            {/* Image picker modal */}
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
                    <View style={[styles.modalBoxPicture]}>
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => {
                                setIsModalVisible(false);

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
                    </View>
                </View>
            </Modal>

            {/* Success modal */}
            <Modal transparent={true} visible={successModalVisible} animationType="fade" onRequestClose={() => setSuccessModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.successBox}>
                        <Text style={styles.modalText}>Profile Updated Successfully</Text>
                        <TouchableOpacity onPress={() => {
                            setSuccessModalVisible(false);
                            navigation.navigate('MaidDashboard');
                        }}>
                            <View style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>OKAY</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Error modal */}
            <Modal transparent={true} visible={errorModalVisible} animationType="fade" onRequestClose={() => setErrorModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.errorBox}>
                        <Text style={styles.modalText}>Please fill all fields</Text>
                        <TouchableOpacity onPress={() => setErrorModalVisible(false)}>
                            <View style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>OKAY</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Main UI */}
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
                        <Text style={styles.titled}>Complete Profile</Text>
                        <View style={{ width: '33%' }} />
                    </View>
                </LinearGradient>

                <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                        {profileImage ? (
                            <View style={styles.avatarContainer}>
                                <Image source={{ uri: profileImage }} style={styles.avatar} />
                                <TouchableOpacity style={styles.editIconWrapper} onPress={() => setIsModalVisible(true)}>
                                    <Icon name="pencil" size={20} color="white" style={{ padding: 4 }} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                                    <View style={[styles.avatar, styles.emptyAvatar]}>
                                        <Icon name="person-outline" size={45} color="#888" />
                                        <View style={styles.addIconWrapper}>
                                            <Icon name="add-circle" size={20} color="black" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <Text style={{ marginTop: '2%', marginBottom: '3%', color: 'black', fontWeight: 500, fontSize: 15 }}>Add Profile Picture</Text>
                            </>
                        )}
                    </View>
                    <View style={{ marginTop: '5%',marginBottom: '5%' }}>
                        <Text style={styles.label}>Address <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Address"
                            placeholderTextColor="#888"
                            value={formData.address}
                            onChangeText={(val) => {
                                handleChange('address', val);
                                if (errors.address && val.trim()) setErrors(prev => ({ ...prev, address: false }));
                            }}
                        />
                        {errors.address && <Text style={styles.errorText}>Address is required</Text>}

                        {/* Occupation */}
                        <Text style={styles.label}>Occupation <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Occupation"
                            placeholderTextColor="#888"
                            value={formData.occupation}
                            onChangeText={(val) => {
                                handleChange('occupation', val);
                                if (errors.occupation && val.trim()) setErrors(prev => ({ ...prev, occupation: false }));
                            }}
                        />
                        {errors.occupation && <Text style={styles.errorText}>Occupation is required</Text>}

                        {/* Aadhar */}
                        <Text style={styles.label}>Aadhar Number <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Aadhar no."
                            placeholderTextColor="#888"
                            value={formData.adhar}
                            onChangeText={(val) => {
                                handleChange('adhar', val);
                                if (errors.adhar && val.trim()) setErrors(prev => ({ ...prev, adhar: false }));
                            }}
                        />
                        {errors.adhar && <Text style={styles.errorText}>Aadhar is required</Text>}

                        {/* Martial */}
                        <Text style={styles.label}>Martial Status <Text style={{ color: 'red' }}>*</Text></Text>
                        <DropDownPicker
                            open={martialOpen}
                            value={formData.martial}
                            items={list}
                            setOpen={setMartialOpen}
                            setValue={(callback) => {
                                const val = callback();
                                handleChange('martial', val);
                                if (errors.martial && val) setErrors(prev => ({ ...prev, martial: false }));
                            }}
                            setItems={setList}
                            placeholder="Select Martial status"
                            style={styles.dropdown}
                            textStyle={{ fontSize: 14, color: 'black' }}
                            dropDownContainerStyle={{ borderColor: '#ccc', backgroundColor: '#f5f5ff' }}
                        />
                        {errors.martial && <Text style={styles.errorText}>Martial status is required</Text>}

                        {/* Gender */}
                        <Text style={styles.label}>Gender <Text style={{ color: 'red' }}>*</Text></Text>
                        <DropDownPicker
                            open={genderOpen}
                            value={formData.gender}
                            items={genderList}
                            setOpen={setGenderOpen}
                            setValue={(callback) => {
                                const val = callback();
                                handleChange('gender', val);
                                if (errors.gender && val) setErrors(prev => ({ ...prev, gender: false }));
                            }}
                            setItems={setGenderList}
                            placeholder="Select Gender"
                            style={styles.dropdown}
                            textStyle={{ fontSize: 14, color: 'black' }}
                            dropDownContainerStyle={{ borderColor: '#ccc', backgroundColor: '#f5f5ff' }}
                        />
                        {errors.gender && <Text style={styles.errorText}>Gender is required</Text>}

                        {/* DOB */}
                        <Text style={styles.label}>Date Of Birth <Text style={{ color: 'red' }}>*</Text></Text>
                        <TouchableOpacity style={styles.dobInput} onPress={() => setShowDOBPicker(true)}>
                            <Text style={{ color: formData.dob ? 'black' : '#888' }}>{formData.dob || 'Select Date of Birth'}</Text>
                            <Icon name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                        {errors.dob && <Text style={styles.errorText}>DOB is required</Text>}
                        {showDOBPicker && (
                            <DateTimePicker
                                value={formData.dob ? new Date(formData.dob) : new Date()}
                                mode="date"
                                display="default"
                                maximumDate={new Date()}
                                onChange={handleDOBChange}
                            />
                        )}
                    </View>
                    {/* Address */}


                    <TouchableOpacity style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "50%" }} onPress={handleSubmit}>
                        <LinearGradient
                            useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                            colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ padding: 10, borderRadius: 10 }}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </LinearGradient>

                    </TouchableOpacity>
                </ScrollView>
            </View>
        </>
    );
};

export default Maid;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5ff' },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50 },
    backIcon: { width: '33%', paddingHorizontal: 15 },
    titled: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center' },
    header: { backgroundColor: '#ededfaff', elevation: 3, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 5 },
    form: { marginTop: 30, width: '90%', alignSelf: 'center' },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { height: 40, color: 'black', marginBottom: 10, borderBottomColor: '#9f8e9fff', borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
    button: { backgroundColor: '#89788a', height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 10, width: 100, alignSelf: 'center', marginTop: 20 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    dropdown: { height: 40, borderRadius: 8, backgroundColor: 'transparent', borderColor: '#ccc', marginBottom: 10 },
    errorText: { color: 'red', fontSize: 12, marginBottom: 5 },
    dobInput: { height: 40, borderBottomColor: '#9f8e9fff', borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    emptyAvatar: { backgroundColor: '#ededfaff', justifyContent: 'center', alignItems: 'center' },
    addIconWrapper: { position: 'absolute', bottom: 0, right: 0 },
    editIconWrapper: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'black', borderRadius: 50, padding: 2 },
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
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    successBox: { width: '80%', backgroundColor: 'white', borderRadius: 15, padding: 20, alignItems: 'center', elevation: 10 },
    errorBox: { width: '80%', backgroundColor: 'white', borderRadius: 15, padding: 20, alignItems: 'center', elevation: 10 },
    modalText: { fontSize: 16, marginBottom: 20, color: 'black' },
});
