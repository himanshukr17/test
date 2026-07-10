import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, Modal
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const CreateService = ({ navigation }) => {
    const [serviceOpen, setServiceOpen] = useState(false);
    const [serviceValue, setServiceValue] = useState(null);
    const [services, setServices] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [userId, setUserId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success');


    {/*Getting the user id from the AsyncStorage*/ }
    useEffect(() => {
        const getUserId = async () => {
            const id = await AsyncStorage.getItem('userId');
            setUserId(id);
        };
        getUserId();
    }, []);

    {/*Fetching all the services*/ }
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get("http://172.16.16.215:5000/RWA/Services/all");
                setAllServices(response.data);

                {/*Showing only the sub services*/ }
                const subs = response.data.filter(service => service.TYPE === 2);
                const formatted = subs.map((s) => ({
                    label: s.NAME,
                    value: s.SERVICE_SUB_ID
                }));
                setServices(formatted);
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };
        fetchServices();
    }, []);

    {/*Date  function*/ }
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (event.type === "dismissed") return;
        if (selectedDate) {
            const current = new Date(selectedDate);
            setDate(current);
            setShowTimePicker(true);
        }
    };

    {/*Time function*/ }
    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (event.type === "dismissed") return;
        if (selectedTime) {
            const updated = new Date(date);
            updated.setHours(selectedTime.getHours());
            updated.setMinutes(selectedTime.getMinutes());
            setDate(updated);
        }
    };


    {/*Submit function*/ }
    const handleSubmit = async () => {
        if (!serviceValue || !description || !date) {
            setModalMessage("Please fill all fields.");
            setModalType("error");
            setModalVisible(true);
            return;
        }

        {/*Finding the service and subservice ids from the all services*/ }
        const selectedSub = allServices.find(s => s.SERVICE_SUB_ID === serviceValue);
        const parentService = allServices.find(s =>
            s.TYPE === 1 && s.SUB_SERVICE_IDS?.includes(serviceValue)
        );

        {/*Creating the payload to send in the backend*/ }
        const payload = {
            USER_ID: userId,
            SERVICE_ID: parentService?.SERVICE_ID || "",
            SERVICE_SUB_ID: serviceValue,
            TYPE: selectedSub?.TYPE?.toString() || "2",
            DESCRIPTION: description,
            CREATION_DATE: date.toISOString(),
            STATUS: 1
        };


        try {
            const res = await axios.post("http://172.16.16.215:5000/RWA/ServiceTransaction/create", payload);

            setModalMessage("Service request submitted!");
            setModalType("success");
            setModalVisible(true);

            setServiceValue(null);
            setDescription('');
            setDate(new Date());
            setServiceOpen(false);
        } catch (err) {
            setModalMessage("Failed to submit request.");
            setModalType("error");
            setModalVisible(true);
        }
    };

    return (
        <>
            {/*Modal for success or error message*/}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[
                        styles.modalBox,
                        modalType === 'success' ? styles.successBox : styles.errorBox
                    ]}>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <TouchableOpacity onPress={() => {
                            setModalVisible(false);
                            if (modalType === "success") {
                                navigation.navigate('AllServices');
                            }
                        }}>
                            <Text style={styles.modalButton}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/**Header */}
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
                        <Text style={styles.titled}>Create Service</Text>

                    </View>
                </View>
            </LinearGradient>

            {/*Main container*/}
            <View style={styles.container}>



                <Text style={styles.label}>Choose Service</Text>
                {/*Service dropdown*/}
                <DropDownPicker
                    open={serviceOpen}
                    value={serviceValue}
                    items={services}
                    setOpen={setServiceOpen}
                    setValue={setServiceValue}
                    setItems={setServices}
                    placeholder="Select a service..."
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownBox}
                    zIndex={3000}
                    zIndexInverse={1000}
                />

                {/*Description*/}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter service description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                {/*Date and Time*/}
                <Text style={styles.label}>Choose Date & Time</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateText}>
                        {`${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`}
                    </Text>
                </TouchableOpacity>

                {/*Date and Time pickers*/}
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                    />
                )}

                <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden', width: "50%", marginTop: '10%' }}>
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
            </View>
        </>
    );
};

export default CreateService;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f7f8fc'
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#222'
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginTop: 20,
        marginBottom: 8
    },
    dropdown: {
        borderColor: '#ccc',
        borderRadius: 12,
        backgroundColor: '#fff'
    },
    dropdownBox: {
        borderColor: '#ccc',
        backgroundColor: '#fff'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
        color: 'black'
    },
    dateButton: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center'
    },
    dateText: {
        fontSize: 16,
        color: '#333'
    },
    submitButton: {
        backgroundColor: '#4B7BEC',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 30,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        width: 250,
        alignItems: 'center'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
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
    },
    errorBox: {
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
     buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },
});
