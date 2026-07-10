// Same imports
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';


const CompleteProfile = ({ navigation, route }) => {

    const { isEdit, user } = route.params || {};

    //form data
    const [formData, setFormData] = useState({
        dob: '',
        flat: '',
        address: '',
        pocket: '',
        building: '',
        occupation: '',
        occupationtype: '',
        customOccupation: '',
        company: '',
        linkedin: '',
        adhar: '',
        martial: '',
        gender: '',
        interest: '',
        floor: '',
        block_no: '',
    });

    const [open, setOpen] = useState(false);
    const [martialOpen, setMartialOpen] = useState(false);
    const [genderOpen, setGenderOpen] = useState(false);
    const [floorOpen, setFloorOpen] = useState(false)
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [errors, setErrors] = useState({});
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);





    //items in the occupation type
    const [items, setItems] = useState([
        { label: 'Business', value: 'Business' },
        { label: 'Job', value: 'Job' },
        { label: 'Student', value: 'Student' },
        { label: 'Other', value: 'Other' },
    ]);


    //items in the martial status
    const [list, setList] = useState([
        { label: 'Single', value: 'Single' },
        { label: 'Married', value: 'Married' },
    ]);

    //items in the gender
    const [genderList, setGenderList] = useState([
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Prefer not to say', value: 'Prefer not to say' },
    ]);

    const [floorList, setFloorList] = useState([
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' },
    ])


    //handling the formdata on any change
    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    //handling the dob on change
    const handleDOBChange = (event, selectedDate) => {
        setShowDOBPicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0];
            handleChange('dob', formatted);
            if (errors.dob) {
                setErrors(prev => ({ ...prev, dob: false }));
            }
        } else {
            setErrors(prev => ({ ...prev, dob: true }));
        }
    };


    useEffect(() => {
        if (isEdit && user) {

            setFormData({
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                flat: user.flat_no?.toString() || '',
                address: user.address || '',
                pocket: user.pocket || '',
                building: user.building_no?.toString() || '',
                occupation: user.occupation || '',
                occupationtype: ['Business', 'Job', 'Student'].includes(user.occupation_type) ? user.occupation_type : 'Other',
                customOccupation: !['Business', 'Job', 'Student'].includes(user.occupation_type) ? user.occupation_type : '',
                company: user.company || '',
                linkedin: user.linkedin || '',
                adhar: user.adhar?.toString() || '',
                martial: user.martial || '',
                gender: user.gender || '',
                interest: Array.isArray(user.interest) ? user.interest.join(', ') : '',
                floor: user.floor?.toString() || '',
                block_no: user.block_no?.toString() || '',
            });
        }
    }, []);


    //handling the submitted data and also error handling 
    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.address.trim()) newErrors.address = true;
        if (!formData.pocket.trim()) newErrors.pocket = true;
        if (!formData.flat.trim()) newErrors.flat = true;
        // if (!formData.building.trim()) newErrors.building = true;
        if (!formData.occupation.trim()) newErrors.occupation = true;
        if (!formData.occupationtype.trim()) newErrors.occupationtype = true;
        if (!formData.adhar.trim()) newErrors.adhar = true;
        if (!formData.martial.trim()) newErrors.martial = true;
        if (!formData.gender.trim()) newErrors.gender = true;
        if (!formData.dob.trim()) newErrors.dob = true;
        if (!formData.floor.trim()) newErrors.floor = true
        if (!formData.block_no.trim()) newErrors.block_no = true

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setErrorModalVisible(true)
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
                flat_no: formData.flat,
                address: formData.address,
                pocket: formData.pocket,
                building_no: formData.building,
                occupation_type: formData.occupationtype === 'Other' ? formData.customOccupation : formData.occupationtype,
                company: formData.company,
                linkedin: formData.linkedin,
                adhar: formData.adhar,
                gender: formData.gender,
                martial: formData.martial,
                dob: formData.dob,
                interest: formData.interest ? formData.interest.split(',').map(item => item.trim()) : [],
                floor: formData.floor,
                block_no: formData.block_no,
                occupation: formData.occupation,
            };

            const res = await axios.put('http://172.16.16.215:5000/RWA/User/updateDetails', payload);
            setSuccessModalVisible(true)
            console.log(res.data);

            setFormData({
                dob: '',
                flat: '',
                address: '',
                pocket: '',
                building: '',
                occupation: '',
                occupationtype: '',
                customOccupation: '',
                company: '',
                linkedin: '',
                adhar: '',
                martial: '',
                gender: '',
                interest: '',
                floor: '',
                block_no: '',
            });
            setErrors({});

        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    return (
        <>
            {/*Modal for success message*/}
            <Modal
                transparent={true}
                visible={successModalVisible}
                animationType="fade"
                onRequestClose={() => setSuccessModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successBox}>
                        <Text style={styles.modalText}>Profile Updated Successfully</Text>
                        <TouchableOpacity onPress={() => {
                            setSuccessModalVisible(false);
                            navigation.navigate('Profile');

                        }}>
                            <Text style={styles.modalButton}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {/*Error modal*/}
            <Modal
                transparent={true}
                visible={errorModalVisible}
                animationType="fade"
                onRequestClose={() => setErrorModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.errorBox}>
                        <Text style={styles.modalText}>Please fill all fields</Text>
                        <TouchableOpacity onPress={() => {
                            setErrorModalVisible(false);

                        }}>
                            <Text style={styles.modalButton}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <LinearGradient
                colors={['#ccccf6ff', '#e1e1e5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>Complete Profile</Text>
                    </View>
                </View>
            </LinearGradient>


            <View style={styles.container}>



                <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* Address */}
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

                    {/* Pocket */}
                    <Text style={styles.label}>Pocket <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Pocket"
                        placeholderTextColor="#888"
                        value={formData.pocket}
                        onChangeText={(val) => {
                            handleChange('pocket', val);
                            if (errors.pocket && val.trim()) setErrors(prev => ({ ...prev, pocket: false }));
                        }}
                    />
                    {errors.pocket && <Text style={styles.errorText}>Pocket is required</Text>}


                    {/* Block */}
                    <Text style={styles.label}>Block Number <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Block"
                        placeholderTextColor="#888"
                        value={formData.block_no}
                        onChangeText={(val) => {
                            handleChange('block_no', val);
                            if (errors.block_no && val.trim()) setErrors(prev => ({ ...prev, block_no: false }));
                        }}
                    />
                    {errors.block_no && <Text style={styles.errorText}>Block is required</Text>}


                    {/* Flat and floor number */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Flat Number <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter Flat Number"
                                placeholderTextColor="#888"
                                keyboardType="number-pad"
                                value={formData.flat}
                                onChangeText={(val) => {
                                    handleChange('flat', val);
                                    if (errors.flat && val.trim()) setErrors(prev => ({ ...prev, flat: false }));
                                }}
                            />
                            {errors.flat && <Text style={styles.errorText}>Flat number is required</Text>}
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Select Floor <Text style={{ color: 'red' }}>*</Text></Text>
                            <DropDownPicker
                                open={floorOpen}
                                value={formData.floor}
                                items={floorList}
                                setOpen={setFloorOpen}
                                setValue={(callback) => {
                                    const val = callback();
                                    handleChange('floor', val);
                                    if (errors.floor && val) setErrors(prev => ({ ...prev, floor: false }));
                                }}
                                setItems={setFloorList}
                                placeholder="Select Floor"
                                style={styles.dropdown}
                                // containerStyle={{
                                //     height: 28,            //  outer wrapper ki height bhi same honi chahiye
                                // }}
                                textStyle={{ fontSize: 14, color: 'black' }}  //  chhota font
                                dropDownContainerStyle={{
                                    borderColor: '#ccc',
                                    backgroundColor: '#f5f5ff',
                                    // maxHeight: 150,        //  dropdown list ki max height
                                }}
                            />

                            {errors.floor && <Text style={styles.errorText}>Floor is required</Text>}
                        </View>

                    </View>

                    {/* Flat */}


                    {/* Building */}
                    <Text style={styles.label}>Building Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Building Number"
                        placeholderTextColor="#888"
                        keyboardType="number-pad"
                        value={formData.building}
                        onChangeText={(val) => {
                            handleChange('building', val);

                        }}
                    />


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

                    {/* Occupation Type */}
                    <Text style={styles.label}>Occupation Type <Text style={{ color: 'red' }}>*</Text></Text>
                    <DropDownPicker
                        open={open}
                        value={formData.occupationtype}
                        items={items}
                        setOpen={setOpen}
                        setValue={(callback) => {
                            const val = callback();
                            handleChange('occupationtype', val);
                            if (errors.occupationtype && val) setErrors(prev => ({ ...prev, occupationtype: false }));
                        }}
                        setItems={setItems}
                        placeholder="Select Occupation Type"
                        style={styles.dropdown}
                        textStyle={{ fontSize: 14, color: 'black' }}
                        dropDownContainerStyle={{
                            borderColor: '#ccc',
                            backgroundColor: '#f5f5ff',
                            // maxHeight: 150,        //  dropdown list ki max height
                        }}
                    />
                    {errors.occupationtype && <Text style={styles.errorText}>Occupation type is required</Text>}

                    {formData.occupationtype === 'Other' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Your Occupation"
                            placeholderTextColor="#888"
                            value={formData.customOccupation}
                            onChangeText={(val) => handleChange('customOccupation', val)}
                        />
                    )}

                    {/* Company */}
                    <Text style={styles.label}>Company</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Company"
                        placeholderTextColor="#888"
                        value={formData.company}
                        onChangeText={(val) => handleChange('company', val)}
                    />

                    {/* LinkedIn */}
                    <Text style={styles.label}>LinkedIn</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter LinkedIn URL"
                        placeholderTextColor="#888"
                        value={formData.linkedin}
                        onChangeText={(val) => handleChange('linkedin', val)}
                    />

                    {/* Aadhar */}
                    <Text style={styles.label}>Adhar Number <Text style={{ color: 'red' }}>*</Text></Text>
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

                    {/* Martial Status */}
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
                        dropDownContainerStyle={{
                            borderColor: '#ccc',
                            backgroundColor: '#f5f5ff',
                            // maxHeight: 150,        //  dropdown list ki max height
                        }}
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
                        dropDownContainerStyle={{
                            borderColor: '#ccc',
                            backgroundColor: '#f5f5ff',
                            // maxHeight: 150,        //  dropdown list ki max height
                        }}
                    />
                    {errors.gender && <Text style={styles.errorText}>Gender is required</Text>}

                    {/* DOB */}
                    <Text style={styles.label}>Date Of Birth <Text style={{ color: 'red' }}>*</Text></Text>
                    <TouchableOpacity
                        style={styles.dobInput}
                        onPress={() => setShowDOBPicker(true)}
                    >
                        <Text style={{ color: formData.dob ? 'black' : '#888' }}>
                            {formData.dob || 'Select Date of Birth'}
                        </Text>
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

                    {/* Interest */}
                    <Text style={styles.label}>Interest</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your interests (e.g., Reading, Coding)"
                        placeholderTextColor="#888"
                        value={formData.interest}
                        onChangeText={(val) => handleChange('interest', val)}
                    />


                    <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "30%", marginTop: '3%' }}>
                        <TouchableOpacity onPress={handleSubmit}>
                            <LinearGradient
                                useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ padding: 8, borderRadius: 10 }}
                            >
                                <Text style={styles.buttonText}>Submit</Text>
                            </LinearGradient>

                        </TouchableOpacity>
                    </View>


                </ScrollView>

            </View>
        </>

    );
};

export default CompleteProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5ff',
        paddingBottom: 20,
    },
    topRow: {
        width: '100%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    backIcon: {
        position: 'absolute',
        left: 0,
        top: 1,
        paddingHorizontal: 15,
    },
    titled: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        // marginBottom: 5,
        paddingVertical: 15,

    },
    form: {
        marginTop: 30,
        width: '90%',
        alignSelf: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        height: 40,
        color: 'black',
        marginBottom: 10,
        borderBottomColor: '#9f8e9fff',
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        // backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#89788a',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: 100,
        alignSelf: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center'
    },
    dropdown: {
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
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5,
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
    modalButton: {
        fontSize: 14,
        color: '#4B7BEC',
        fontWeight: 'bold',
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

});
