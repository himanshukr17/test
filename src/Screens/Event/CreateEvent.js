import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';


const CreateEvent = ({ navigation }) => {

    // Pehle formData ko hi nested bana le
    const [formData, setFormData] = useState({
        EVENT_TITLE: "",
        EVENT_DESC: "",
        VALID_FROM: "",
        VALID_TILL: "",
        EVENT_FEE: "",
        
        CHAIRMAN: "",
        APPLICABLE_FOR_AGE: "",
        VENUE: "",
        APPLICABLE_FOR_GENDER: "",
        EVENT_TYPE: "",
        EVENT_ENROLLMENT_END_DATE: "",
        EVENT_FEE_TYPE: "",
        EVENT_SPONSERS: [],
        EVENT_GUEST: [],
        EVENT_POSTER: null,
        TIME: "",
    });

    const [userOptions, setUserOptions] = useState([]);
    const [sponsorOptions, setSponsorOptions] = useState([]);
    const [guestOptions, setGuestOptions] = useState([]);
    const [showTimePicker, setShowTimePicker] = useState(false)
    //getting admin id and user id from local storage
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({});
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [showValidFromPicker, setShowValidFromPicker] = useState(false);
    const [showValidTillPicker, setShowValidTillPicker] = useState(false);
    const [showEnrollmentPicker, setShowEnrollmentPicker] = useState(false);
    const [eventType, setEventType] = useState([]);




    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await AsyncStorage.getItem("userDetails");
            console.log("storedUser:", storedUser);

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setIsAdmin(parsedUser.isAdmin);
                console.log("isAdmin:", isAdmin);
            }
            const storedUserId = await AsyncStorage.getItem("userId");

            console.log("storedUserId:", storedUserId);

            setUserId(storedUserId);
        };
        fetchUserData();

        fetchUserOptions();
        fetchSponsorOptions();
        fetchGuestOptions();
        fetchEventType();
    }, []);



    //user options
    const fetchUserOptions = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/User/vehicle-scan");
            if (res.status === 200) {
                const options = res.data.map(user => ({
                    value: user.user_id,
                    label: `${user.first_name || ''} ${user.last_name || ''}`   //displaying user full name 
                }));

                console.log("User options:", options);
                setUserOptions(options);
                return options;
            }
            return [];
        } catch (error) {
            console.error("Error fetching user options:", error);
            return [];
        }
    };

    //sponsor options
    const fetchSponsorOptions = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/Sponsor/all");
            if (res.status === 200) {
                const options = res.data.map(user => ({
                    value: user.SPONSOR_ID,
                    label: `${user.NAME || ''}`
                }));

                setSponsorOptions(options);
                // console.log("Sponsor options:",sponsorOptions );
                return options;
            }
            return [];
        } catch (error) {
            console.error("Error fetching user options:", error);
            return [];
        }
    };


    //guest options
    const fetchGuestOptions = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/Guest/all");
            if (res.status === 200) {
                const options = res.data.map(user => ({
                    value: user.GUEST_ID,
                    label: `${user.NAME || ''}`
                }));

                setGuestOptions(options);
                // console.log("Sponsor options:",sponsorOptions );
                return options;
            }
            return [];
        } catch (error) {
            console.error("Error fetching guest options:", error);
            return [];
        }
    };

    // For handling date change
    const handleDOBChange = (key, event, selectedDate) => {
        setShowDOBPicker(false);
        if (selectedDate) {
            const formatted = selectedDate.toISOString().split('T')[0];
            handleChange(key, formatted);  //  ab sahi field me set hoga
        }
    };



    // For handling time change
    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const hours = selectedTime.getHours();
            const minutes = selectedTime.getMinutes();
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}`;

            handleChange("TIME", formattedTime);  //  ab TIME me save hoga
        }
    };


    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };



    //fetch event type
    const fetchEventType = async () => {
        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/EventCategories/all", { params: { status: 1 } });
            if (res.status === 200) {
                setEventType(res.data);
                console.log("categories:", res.data);
            }

        } catch (error) {
            console.error(error);
        }


    }


    const handleImageUpload = (image) => {
        // image object me uri, fileName, type aata hai
        handleChange("EVENT_POSTER", {
            uri: image.uri,
            name: image.fileName || `event_${Date.now()}.jpg`,
            type: image.type || "image/jpeg",
        });
    };


    const handleSubmit = async () => {
        const newErrors = {};

        // Validation
        if (!formData.EVENT_TITLE) newErrors.EVENT_TITLE = "Event Title is required";
        if (!formData.EVENT_DESC) newErrors.EVENT_DESC = "Description is required";
        if (!formData.VALID_FROM) newErrors.VALID_FROM = "Valid From date is required";
        if (!formData.VALID_TILL) newErrors.VALID_TILL = "Valid Till date is required";
        if (!formData.TIME) newErrors.TIME = "Time is required";
        if (!formData.EVENT_FEE) newErrors.EVENT_FEE = "Fee is required";
        if (!formData.VENUE) newErrors.VENUE = "Venue is required";
        if (!formData.APPLICABLE_FOR_AGE) newErrors.APPLICABLE_FOR_AGE = "Age is required";
        if (!formData.APPLICABLE_FOR_GENDER) newErrors.APPLICABLE_FOR_GENDER = "Gender is required";
        if (!formData.CHAIRMAN) newErrors.CHAIRMAN = "Chairman is required";
        if (!formData.EVENT_FEE_TYPE) newErrors.EVENT_FEE_TYPE = "Fee type is required";
        if (!formData.EVENT_TYPE) newErrors.EVENT_TYPE = "Event type is required";
        if (!formData.EVENT_ENROLLMENT_END_DATE) newErrors.EVENT_ENROLLMENT_END_DATE = "Enrollment End Date is required";
        if (!formData.EVENT_SPONSERS || formData.EVENT_SPONSERS.length === 0) newErrors.EVENT_SPONSERS = "Sponsor is required";
        if (!formData.EVENT_GUEST || formData.EVENT_GUEST.length === 0) newErrors.EVENT_GUEST = "Guest is required";
        if (!formData.EVENT_POSTER) newErrors.EVENT_POSTER = "Poster is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setErrorModalVisible(true);
            return;
        }

        try {
            // FormData for file upload
            const payload = new FormData();
            payload.append("EVENT_TITLE", formData.EVENT_TITLE);
            payload.append("EVENT_DESC", formData.EVENT_DESC);
            payload.append("VALID_FROM", formData.VALID_FROM);
            payload.append("VALID_TILL", formData.VALID_TILL);
            payload.append("TIME", formData.TIME);
            payload.append("EVENT_FEE", formData.EVENT_FEE);
            payload.append("VENUE", formData.VENUE);
            payload.append("APPLICABLE_FOR_AGE", formData.APPLICABLE_FOR_AGE);
            payload.append("APPLICABLE_FOR_GENDER", formData.APPLICABLE_FOR_GENDER);
            payload.append("CHAIRMAN", formData.CHAIRMAN);
            payload.append("EVENT_FEE_TYPE", formData.EVENT_FEE_TYPE);
            payload.append("EVENT_TYPE", formData.EVENT_TYPE);
            payload.append("EVENT_ENROLLMENT_END_DATE", formData.EVENT_ENROLLMENT_END_DATE);

            // multiple select fields
            // Sponsors
            formData.EVENT_SPONSERS.forEach((sponsor) => {
                payload.append("EVENT_SPONSERS", sponsor);
            });

            // Guests
            formData.EVENT_GUEST.forEach((guest) => {
                payload.append("EVENT_GUEST", guest);
            });

            payload.append("CREATED_BY", userId || "");
            payload.append("IS_ADMIN", isAdmin ? "1" : "0");

            // file upload
            if (formData.EVENT_POSTER) {
                payload.append("EVENT_POSTER", {
                    uri: formData.EVENT_POSTER.uri,
                    type: formData.EVENT_POSTER.type,
                    name: formData.EVENT_POSTER.name,
                });
            }

            console.log("payload:", payload);

            const res = await axios.post(
                "http://172.16.16.215:5000/RWA/Event/create", //  correct API endpoint
                payload,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.status == 200 || res.status == 201) {
                setSuccessModalVisible(true);
                // reset form
                setFormData({
                    EVENT_TITLE: "",
                    EVENT_DESC: "",
                    VALID_FROM: "",
                    VALID_TILL: "",
                    EVENT_FEE: "",
                    
                    CHAIRMAN: "",
                    APPLICABLE_FOR_AGE: "",
                    VENUE: "",
                    APPLICABLE_FOR_GENDER: "",
                    EVENT_TYPE: "",
                    EVENT_ENROLLMENT_END_DATE: "",
                    EVENT_FEE_TYPE: "",
                    EVENT_SPONSERS: [],
                    EVENT_GUEST: [],
                    EVENT_POSTER: null,
                    TIME: "",
                });
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
                        <Text style={styles.titled}>Create Event</Text>
                    </View>
                </LinearGradient>


                <ScrollView style={{ padding: 10 }} contentContainerStyle={{ paddingBottom: 50 }}>

                    {/* Amount */}
                    <View>
                        <Text style={styles.label}>Event Title <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Event Title"
                            placeholderTextColor="#888"
                            value={formData.EVENT_TITLE}
                            onChangeText={text => handleChange('EVENT_TITLE', text)}

                        />
                        {errors.EVENT_TITLE && <Text style={styles.errorText}>{errors.EVENT_TITLE}</Text>}
                    </View>

                    <View>
                        <Text style={styles.label}>Description <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Enter Descrition"
                            placeholderTextColor="#888"
                            value={formData.EVENT_DESC}
                            onChangeText={text => handleChange('EVENT_DESC', text)}
                            multiline={true}
                            numberOfLines={4}

                        />
                        {errors.EVENT_DESC && <Text style={styles.errorText}>{errors.EVENT_DESC}</Text>}
                    </View>

                    {/* Valid From */}

                    <View>
                        <Text style={styles.label}>Valid From <Text style={{ color: 'red' }}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.dobInput}
                            onPress={() => setShowValidFromPicker(true)}
                        >
                            <Text style={{ color: formData.VALID_FROM ? 'black' : '#888' }}>
                                {formData.VALID_FROM || 'Select Date'}
                            </Text>
                            <Icon name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                        {showValidFromPicker && (
                            <DateTimePicker
                                value={formData.VALID_FROM ? new Date(formData.VALID_FROM) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(e, d) => {
                                    setShowValidFromPicker(false);
                                    if (d) handleDOBChange("VALID_FROM", e, d);
                                }}
                            />
                        )}
                    </View>



                    <View>
                        <Text style={styles.label}>Valid Till <Text style={{ color: 'red' }}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.dobInput}
                            onPress={() => setShowValidTillPicker(true)}
                        >
                            <Text style={{ color: formData.VALID_TILL ? 'black' : '#888' }}>
                                {formData.VALID_TILL || 'Select Date of Birth'}
                            </Text>
                            <Icon name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                        {errors.VALID_TILL && <Text style={styles.errorText}>{errors.VALID_TILL}</Text>}
                        {showValidTillPicker && (
                            <DateTimePicker
                                value={formData.VALID_TILL ? new Date(formData.VALID_TILL) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(e, d) => {
                                    setShowValidTillPicker(false);
                                    if (d) handleDOBChange("VALID_TILL", e, d);
                                }}
                            />

                        )}
                    </View>


                    <View>
                        <Text style={styles.label}>
                            Time <Text style={{ color: 'red' }}>*</Text>
                        </Text>

                        <TouchableOpacity
                            style={styles.dobInput}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={{ color: formData.TIME ? 'black' : '#888' }}>
                                {formData.TIME || 'Select Time'}
                            </Text>
                            <Icon name="time-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        {errors.TIME && (
                            <Text style={styles.errorText}>{errors.TIME}</Text>
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                value={formData.TIME ? new Date(formData.TIME) : new Date()}
                                mode="time"          // <- Only time picker
                                display="default"
                                is24Hour={true}      // optional, 24-hour format
                                onChange={handleTimeChange} // handleTimeChange similar to handleDOBChange
                            />
                        )}
                    </View>


                    <View>
                        <Text style={styles.label}>Amount <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Fees"
                            placeholderTextColor="#888"
                            value={formData.EVENT_FEE}
                            onChangeText={text => handleChange('EVENT_FEE', text)}
                            keyboardType='numeric'

                        />
                        {errors.EVENT_FEE && <Text style={styles.errorText}>{errors.EVENT_FEE}</Text>}
                    </View>

                    <View>
                        <Text style={styles.label}>Fee Type <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.EVENT_FEE_TYPE}
                                onValueChange={itemValue => handleChange('EVENT_FEE_TYPE', itemValue)}
                                style={styles.pickerInner}
                            >
                                <Picker.Item label="Select Fee Type" value="" />
                                <Picker.Item label="Paid" value="Paid" />
                                <Picker.Item label="Free" value="Free" />
                            </Picker>
                        </View>
                        {errors.EVENT_FEE_TYPE && <Text style={styles.errorText}>{errors.EVENT_FEE_TYPE}</Text>}

                    </View>


                    <View>
                        <Text style={styles.label}>Venue <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Event Venue"
                            placeholderTextColor="#888"
                            value={formData.VENUE}
                            onChangeText={text => handleChange('VENUE', text)}

                        />
                        {errors.VENUE && <Text style={styles.errorText}>{errors.VENUE}</Text>}
                    </View>

                    <View>
                        <Text style={styles.label}>Age <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Till Valid Age"
                            placeholderTextColor="#888"
                            value={formData.APPLICABLE_FOR_AGE}
                            onChangeText={text => handleChange('APPLICABLE_FOR_AGE', text)}
                            keyboardType='numeric'

                        />
                        {errors.APPLICABLE_FOR_AGE && <Text style={styles.errorText}>{errors.APPLICABLE_FOR_AGE}</Text>}
                    </View>

                    {/* Gender */}

                    <View>
                        <Text style={styles.label}>Gender <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.APPLICABLE_FOR_GENDER}
                                onValueChange={itemValue => handleChange('APPLICABLE_FOR_GENDER', itemValue)}
                                style={styles.pickerInner}
                            >
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Men" value="Men" />
                                <Picker.Item label="Women" value="Women" />
                            </Picker>
                        </View>
                        {errors.APPLICABLE_FOR_GENDER && <Text style={styles.errorText}>{errors.APPLICABLE_FOR_GENDER}</Text>}

                    </View>



                  
                    <View>
                        <Text style={styles.label}>Chairman <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.CHAIRMAN}
                                onValueChange={itemValue => handleChange('CHAIRMAN', itemValue)}
                                style={styles.pickerInner}
                            >
                                <Picker.Item label="Select Chairman" value="" />
                                {userOptions.map(b => (
                                    <Picker.Item key={b._id} label={b.label} value={b.value} />
                                ))}
                            </Picker>
                        </View>
                        {errors.CHAIRMAN && <Text style={styles.errorText}>{errors.CHAIRMAN}</Text>}

                    </View>
            


                    <View>
                        <Text style={styles.label}>Event Type <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={formData.EVENT_TYPE}
                                onValueChange={itemValue => handleChange('EVENT_TYPE', itemValue)}
                                style={styles.pickerInner}
                            >   
                                 <Picker.Item label="Select Type of Event" value="" />
                                {eventType.map((item,index)=>(
                                    <Picker.Item key={index} label={item.EVENT_CATEGORY_NAME} value={item.EVENT_CATEGORY_NAME} />
                                ))}
                               

                            </Picker>
                        </View>
                        {errors.EVENT_TYPE && <Text style={styles.errorText}>{errors.EVENT_TYPE}</Text>}

                    </View>


                    <View>
                        <Text style={styles.label}>Enrollment End Date<Text style={{ color: 'red' }}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.dobInput}
                            onPress={() => setShowEnrollmentPicker(true)}
                        >
                            <Text style={{ color: formData.EVENT_ENROLLMENT_END_DATE ? 'black' : '#888' }}>
                                {formData.EVENT_ENROLLMENT_END_DATE || 'Select Date of Birth'}
                            </Text>
                            <Icon name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                        {errors.EVENT_ENROLLMENT_END_DATE && <Text style={styles.errorText}>{errors.EVENT_ENROLLMENT_END_DATE}</Text>}
                        {showEnrollmentPicker && (
                            <DateTimePicker
                                value={formData.EVENT_ENROLLMENT_END_DATE ? new Date(formData.EVENT_ENROLLMENT_END_DATE) : new Date()}
                                mode="date"
                                display="default"
                                onChange={(e, d) => {
                                    setShowEnrollmentPicker(false);
                                    if (d) handleDOBChange("EVENT_ENROLLMENT_END_DATE", e, d);
                                }}
                            />

                        )}
                    </View>




                    <Text style={styles.label}>Select Sponsor <Text style={{ color: 'red' }}>*</Text></Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={formData.EVENT_SPONSERS[0] || ""}   // first value dikhayega
                            onValueChange={(itemValue) => handleChange("EVENT_SPONSERS", [itemValue])} // array me wrap karke store
                            style={styles.pickerInner}
                        >
                            <Picker.Item label="Select Sponsor" value="" />
                            {sponsorOptions.map((b, index) => (
                                <Picker.Item key={index} label={b.label} value={b.value} />
                            ))}
                        </Picker>
                    </View>


                    <Text style={styles.label}>Select Guest <Text style={{ color: 'red' }}>*</Text></Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={formData.EVENT_GUEST[0] || ""}
                            onValueChange={(itemValue) => handleChange("EVENT_GUEST", [itemValue])}
                            style={styles.pickerInner}
                        >
                            <Picker.Item label="Select Guest" value="" />
                            {guestOptions.map((g, index) => (
                                <Picker.Item key={index} label={g.label} value={g.value} />
                            ))}
                        </Picker>
                    </View>




                    <View>
                        <Text style={styles.label}>
                            Event Poster <Text style={{ color: 'red' }}>*</Text>
                        </Text>

                        <TouchableOpacity
                            style={styles.dobInput}   // same style jaisa date/time field
                            onPress={async () => {
                                try {
                                    const image = await ImageCropPicker.openPicker({
                                        width: 400,  // crop width
                                        height: 300, // crop height
                                        cropping: true,  // ye enable karta hai crop
                                        compressImageQuality: 0.8 // optional, compress karne ke liye
                                    });
                                    handleImageUpload({
                                        uri: image.path,
                                        fileName: image.filename || `event_${Date.now()}.jpg`,
                                        type: image.mime
                                    })
                                } catch (error) {

                                }
                            }}
                        >
                            <Text style={{ color: formData.EVENT_POSTER ? 'black' : '#888' }}>
                                {formData.EVENT_POSTER ? formData.EVENT_POSTER.name : "Select Poster"}
                            </Text>
                            <Icon name="image-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* Preview */}
                        {formData.EVENT_POSTER && (
                            <Image
                                source={{ uri: formData.EVENT_POSTER.uri }}
                                style={{
                                    width: 120,
                                    height: 120,
                                    marginTop: 10,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: "#ccc",
                                }}
                            />
                        )}

                        {errors.EVENT_POSTER && (
                            <Text style={styles.errorText}>{errors.EVENT_POSTER}</Text>
                        )}
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

export default CreateEvent;
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
        width: '100%'
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

