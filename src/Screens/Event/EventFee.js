import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';


const EventFee = ({ navigation }) => {

    // Pehle formData ko hi nested bana le
    const [formData, setFormData] = useState({
        amount: "",
        payment_method: "",
        payment_status: "",
        reference_id: "",
        address: {
            flat_no: "",
            floor: "",
            block_no: "",
            pocket: ""
        }
    });
    const [errors, setErrors] = useState({});
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);

    const [floorOpen, setFloorOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(""); // Stores EVENT_ID




    const [floorList, setFloorList] = useState([
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' },
    ])

    //getting events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("http://172.16.16.215:5000/RWA/Event/title");
                if (res.data.data) setEvents(res.data.data);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        fetchEvents();
    }, []);






    const flatNames = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/User/family", {
                params: {
                    flat_no: formData.address.flat_no,
                    floor: formData.address.floor,
                    block_no: formData.address.block_no,
                    pocket: formData.address.pocket
                }
            });

            // API gives { success: true, users: [...] }
            setFamilyMembers(res.data.users);

        } catch (err) {
            console.error("Error fetching family:", err);
        }
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleAddressChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [key]: value
            }
        }));
    };


    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.address.flat_no) newErrors.flat_no = "Flat No is required";
        if (!formData.address.floor) newErrors.floor = "Floor is required";
        if (!formData.address.block_no) newErrors.block_no = "Block No is required";
        if (!formData.address.pocket) newErrors.pocket = "Pocket is required";
        if (!selectedUser) newErrors.selectedUser = "Select a family member";
        if (!selectedEvent) newErrors.selectedEvent = "Select an event";
        if (!formData.amount) newErrors.amount = "Amount is required";
        if (!formData.payment_method) newErrors.payment_method = "Payment method is required";
        if (!formData.payment_status) newErrors.payment_status = "Payment status is required";
        // reference_id is optional, no validation needed


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setErrorModalVisible(true);
            return;
        }

        try {
            const payload = {
                FLAT: formData.address.flat_no,
                FLOOR: formData.address.floor,
                POCKET: formData.address.pocket,
                NAME: familyMembers.find(u => u.user_id === selectedUser)?.first_name || "",
                PAYMENT: formData.payment_status,
                PAYMENT_MODE: formData.payment_method,
                AMOUNT: formData.amount,
                
                REF_ID: formData.reference_id || "",
                EVENT_ID: selectedEvent,
                USER_ID: selectedUser
            };

            console.log("payload:", payload);

            const res = await axios.post("http://172.16.16.215:5000/RWA/EventRegiteration/register", payload);

            if (res.data.success) {
                setSuccessModalVisible(true);
                setFormData({
                    amount: "", payment_method: "", payment_status: "", reference_id: "",
                    address: { flat_no: "", floor: "", block_no: "", pocket: "" }
                });
                setSelectedUser(null);
                setSelectedEvent("");
                setFamilyMembers([]);
                setErrors({});
            } else {
                Alert.alert("Error", res.data.message || "Something went wrong");
            }

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Server error, try again later");
        }
    };


    return (
        <>
            {/* Success Modal */}
            <Modal
                transparent
                visible={successModalVisible}
                animationType="fade"
                onRequestClose={() => setSuccessModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successBox}>
                        <Text style={styles.modalText}>Event Registered Successfully</Text>
                        <TouchableOpacity onPress={() => setSuccessModalVisible(false)}>
                            <Text style={styles.modalButton}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Error Modal */}
            <Modal
                transparent
                visible={errorModalVisible}
                animationType="fade"
                onRequestClose={() => setErrorModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.errorBox}>
                        <Text style={styles.modalText}>Please fill all fields</Text>
                        <TouchableOpacity onPress={() => setErrorModalVisible(false)}>
                            <Text style={styles.modalButton}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
                        <Text style={styles.titled}>Event Fees </Text>
                    </View>
                </LinearGradient>


                <ScrollView style={{ padding: 10 }} contentContainerStyle={{ paddingBottom: 50 }}>
                    <View >
                        <Text style={styles.label}>
                            Address <Text style={{ color: 'red' }}>*</Text>
                        </Text>

                        {/* Row 1: Flat No + Floor */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, gap: 10, }}>
                            <TextInput
                                style={[styles.input, { flex: 1, width: '50%' }]}
                                placeholder="Flat No"
                                placeholderTextColor="#888"
                                value={formData.address.flat_no}
                                onChangeText={text => handleAddressChange('flat_no', text)}
                                keyboardType="numeric"
                            />

                            <View style={{ flex: 1 }}>
                                <DropDownPicker
                                    open={floorOpen}
                                    value={formData.address.floor}
                                    items={floorList}
                                    setOpen={setFloorOpen}
                                    setValue={(callback) => {
                                        const val = callback();
                                        handleAddressChange('floor', val)
                                        if (errors.floor && val) setErrors(prev => ({ ...prev, floor: false }));
                                    }}
                                    setItems={setFloorList}
                                    placeholder="Select Floor"
                                    style={[styles.dropdown]}
                                    textStyle={{ fontSize: 14, color: 'black' }}
                                    dropDownContainerStyle={{
                                        borderColor: '#ccc',
                                        backgroundColor: '#f5f5ff',
                                        width: '50%'
                                    }}
                                />
                            </View>

                        </View>

                        {/* Row 2: Block No + Pocket */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, gap: 10 }}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Block No"
                                placeholderTextColor="#888"
                                value={formData.address.block_no}
                                onChangeText={text => handleAddressChange('block_no', text)}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Pocket"
                                placeholderTextColor="#888"
                                value={formData.address.pocket}
                                onChangeText={text => handleAddressChange('pocket', text)}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Search Button */}
                        <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "50%", marginTop: "5%" }}>
                            <TouchableOpacity onPress={flatNames}>
                                <LinearGradient
                                    useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                    colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ padding: 10, borderRadius: 10 }}
                                >
                                    <Text style={styles.buttonText}>Search</Text>
                                </LinearGradient>

                            </TouchableOpacity>
                        </View>
                    </View>


                    {/* Family Members */}
                    {familyMembers && familyMembers.length > 0 ? (
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.label}>
                                Select Family Member <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            {familyMembers.map((user) => (
                                <TouchableOpacity
                                    key={user.user_id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        marginBottom: 5,
                                        borderWidth: 1,
                                        borderColor: selectedUser === user.user_id ? '#4B7BEC' : '#ccc',
                                        borderRadius: 8,
                                        backgroundColor: selectedUser === user.user_id ? '#e6f0ff' : '#fff'
                                    }}
                                    onPress={() => setSelectedUser(user.user_id)}
                                >
                                    <View
                                        style={{
                                            height: 20,
                                            width: 20,
                                            borderRadius: 10,
                                            borderWidth: 2,
                                            borderColor: selectedUser === user.user_id ? '#4B7BEC' : '#ccc',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 10
                                        }}
                                    >
                                        {selectedUser === user.user_id && (
                                            <View
                                                style={{
                                                    height: 10,
                                                    width: 10,
                                                    borderRadius: 5,
                                                    backgroundColor: '#4B7BEC'
                                                }}
                                            />
                                        )}
                                    </View>
                                    <Text style={{ fontSize: 15, color: 'black' }}>
                                        {user.first_name} {user.last_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ fontSize: 15, color: 'black', marginTop: 15 }}>
                            No Family Members Found
                        </Text>
                    )}

                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.label}>Select Event <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedEvent}
                                onValueChange={(itemValue) => setSelectedEvent(itemValue)}
                                style={styles.pickerInner}
                            >
                                <Picker.Item label="Select Event" value="" />
                                {events.map(event => (
                                    <Picker.Item key={event.EVENT_ID} label={event.EVENT_TITLE} value={event.EVENT_ID} />
                                ))}
                            </Picker>
                        </View>
                        {errors.selectedEvent && <Text style={styles.errorText}>{errors.selectedEvent}</Text>}

                    </View>


                    {/* Amount */}
                    <View>
                        <Text style={styles.label}>Amount <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Amount"
                            placeholderTextColor="#888"
                            value={formData.amount}
                            onChangeText={text => handleChange('amount', text)}
                            keyboardType="numeric"
                        />
                        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                    </View>

                    {/* Payment Method */}

                    <View>
                        <Text style={styles.label}>Payment Method <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.payment_method}
                                onValueChange={itemValue => handleChange('payment_method', itemValue)}
                                style={styles.pickerInner}
                            >
                                <Picker.Item label="Select Method" value="" />
                                <Picker.Item label="Cash" value="Cash" />
                                <Picker.Item label="Online" value="Online" />
                            </Picker>
                        </View>
                        {errors.payment_method && <Text style={styles.errorText}>{errors.payment_method}</Text>}

                    </View>


                    {/* Payment Status */}

                    <View>
                        <Text style={styles.label}>Payment Status <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.payment_status}
                                onValueChange={itemValue => handleChange('payment_status', itemValue)}
                                style={styles.pickerInner}
                            >
                                <Picker.Item label="Select Status" value="" />
                                <Picker.Item label="Paid" value="PAID" />
                                <Picker.Item label="Committed" value="COMMITTED" />
                            </Picker>
                        </View>
                        {errors.payment_status && <Text style={styles.errorText}>{errors.payment_status}</Text>}

                    </View>


                    {/* Reference_id */}
                    {/* Reference_id */}
                    <View>
                        <Text style={styles.label}>
                            Reference_id
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter Reference_id"
                                placeholderTextColor="#888"
                                value={formData.reference_id}
                                onChangeText={text => handleChange('reference_id', text)}
                                keyboardType="numeric"
                            />

                            {/* Camera Icon */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate("TextScanner", {
                                    onTextDetected: (text) => handleChange("reference_id", text)
                                })}
                                style={{ marginLeft: 8 }}
                            >
                                <Icon name="camera" size={28} color="#4B7BEC" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "50%", marginTop: '5%' }}>
                        <TouchableOpacity onPress={handleSubmit}>
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
                    </View>




                </ScrollView>





            </View >
        </>
    );
};

export default EventFee;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

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
    titled: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center' },

    label: {
        fontSize: 16,
        marginVertical: 8,
        color: '#333',
        fontWeight: '600'
    },

    input: {
        // height: 45,                // fix height
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        // paddingHorizontal: 12,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        color: 'black'
    },

    dropdown: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        // height: 45,                // same as input height
        marginBottom: 10,
        width: '100%'
    },

    button: {
        backgroundColor: '#4B7BEC',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 15,
        alignSelf: 'center',
        width: '50%',
        elevation: 2
    },

    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },

    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 5
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    successBox: {
        borderLeftWidth: 6,
        borderLeftColor: '#4BB543',
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 10
    },
    errorBox: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 10,
        borderLeftWidth: 6,
        borderLeftColor: '#D0342C'
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 12
    },
    modalButton: {
        fontSize: 14,
        color: '#4B7BEC',
        fontWeight: 'bold'
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginBottom: 5,
        overflow: 'hidden',
        height: 43,
        justifyContent: 'center',
    },

    pickerInner: {
        color: 'black', // text color
        width: '100%',
    },
});

