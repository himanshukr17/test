import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useToast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Complaint = ({ navigation }) => {
    const [formData, setFormData] = useState({
        NAME: '',
        DESCRIPTION: ''
    });

    const [errors, setErrors] = useState({});
    const [complaint, setComplaint] = useState([])

    {/* Toast for notifications */ }
    const toast = useToast();


    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        compalintOptions()
    }, [])


    // Get complaint options
    const compalintOptions = async () => {
        const res = await axios.get('http://172.16.16.215:5000/RWA/ComplaintOptions/all',
            { params: { status: 1 } }
        )
        if (res.status === 200) {
            console.log(res.data.data)
            setComplaint(res.data.data)
        }
        else {
            console.log(res)
        }

    }

    {/* Submit form */ }
    const handleSubmit = async () => {
        const newErrors = {};

        if (!formData.NAME) newErrors.NAME = "Topic is required";
        if (!formData.DESCRIPTION) newErrors.DESCRIPTION = "Description is required";

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
                USER_ID: user_Id,
                ...formData,
            };
            console.log("payload:", payload);
            const res = await axios.post('http://172.16.16.215:5000/RWA/Complaint/create', payload);
            console.log("Upload response:", res.data);
            if (res.status === 200) {
                toast.show("✅ Complaint submitted successfully", {
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
                setFormData({
                    NAME: '',
                    DESCRIPTION: ''
                })
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server error, try again later");
        }
    }


    return (
        <View style={styles.container}>
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
                        <Text style={styles.titled}>Complaint</Text>

                    </View>
                </View>
            </LinearGradient>


            <View style={{ padding: 20 }}>
                <View>
                    <Text style={styles.label}>Topic <Text style={{ color: 'red' }}>*</Text></Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={formData.NAME}
                            onValueChange={itemValue => handleChange('NAME', itemValue)}
                            style={styles.pickerInner}
                        >
                            <Picker.Item label="Select Topic" value="" />
                            {complaint.map((item, index) => (
                                <Picker.Item key={index} label={item.OPTION_NAME} value={item.OPTION_NAME} />
                            ))}
                            
                           
                        </Picker>
                    </View>
                    {errors.NAME && <Text style={styles.errorText}>{errors.NAME}</Text>}

                </View>

                <View>
                    <Text style={styles.label}>Description <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        placeholder="Enter Descrition"
                        placeholderTextColor="#888"
                        value={formData.DESCRIPTION}
                        onChangeText={text => handleChange('DESCRIPTION', text)}
                        multiline={true}
                        numberOfLines={4}
                        maxLength={100}
                    />
                    {errors.DESCRIPTION && <Text style={styles.errorText}>{errors.DESCRIPTION}</Text>}
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
            </View>


        </View>
    )
}


export default Complaint

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
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

    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: 'white',
        marginBottom: 5,
        overflow: 'hidden',
        height: 43,
        justifyContent: 'center',
    },

    pickerInner: {
        color: 'black', // text color
        width: '100%',
    },
    label: {
        fontSize: 16,
        marginVertical: 8,
        color: '#333',
        fontWeight: '600'
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 5
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
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },
})