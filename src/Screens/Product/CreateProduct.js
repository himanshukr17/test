import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';

const CreateProduct = ({ navigation }) => {

    const [formData, setFormData] = useState({
        TITLE: '',
        DESCRIPTION: '',
        PRICE: '',
        IMAGE: null,
        FLAG: 1

    });

    const [errors, setErrors] = useState({});
    const [errorModalVisible, setErrorModalVisible] = useState(false);

    {/* Toast for notifications */ }
    const toast = useToast();

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleImageUpload = (image) => {
        // image object me uri, fileName, type aata hai
        handleChange("IMAGE", {
            uri: image.uri,
            name: image.fileName || `product_${Date.now()}.jpg`,
            type: image.type || "image/jpeg",
        });
    };


    const handleSubmit = async () => {
        const newErrors = {};

        if (!formData.TITLE) newErrors.TITLE = "Title is required";
        if (!formData.DESCRIPTION) newErrors.DESCRIPTION = "Description is required";
        if (!formData.PRICE) newErrors.PRICE = "Price is required";
        if (!formData.IMAGE) newErrors.IMAGE = "Image is required";

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

            //  Create FormData
            const formDataToSend = new FormData();
            formDataToSend.append("USER_ID", user_Id);
            formDataToSend.append("TITLE", formData.TITLE);
            formDataToSend.append("DESCRIPTION", formData.DESCRIPTION);
            formDataToSend.append("PRICE", formData.PRICE);
            formDataToSend.append("FLAG", formData.FLAG);
            formDataToSend.append("IMAGE", {
                uri: formData.IMAGE.uri,
                type: formData.IMAGE.type,
                name: formData.IMAGE.name,
            });

            console.log("Sending FormData:", formDataToSend);

            const res = await axios.post(
                "http://172.16.16.215:5000/RWA/Product/create",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Upload response:", res.data);

            if (res.status === 200) {
                toast.show("✅ Product created successfully", {
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
                    TITLE: '',
                    DESCRIPTION: '',
                    PRICE: '',
                    IMAGE: null,
                    FLAG: 1
                });

            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Server error, try again later");
        }
    };



    return (
        <>
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
                    colors={['#ccccf6ff', '#e1e1e5ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                                <Icon name="arrow-back" size={24} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.titled}>Create Product</Text>

                        </View>
                    </View>
                </LinearGradient>

                <View style={{ padding: 20, }}>
                    <View>
                        <Text style={styles.label}>Title <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={[styles.input]}
                            placeholder="Enter Title"
                            placeholderTextColor="#888"
                            value={formData.TITLE}
                            onChangeText={text => handleChange('TITLE', text)}

                        />
                        {errors.TITLE && <Text style={styles.errorText}>{errors.TITLE}</Text>}
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

                    <View>
                        <Text style={styles.label}>Price <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={[styles.input]}
                            placeholder="Enter Price"
                            placeholderTextColor="#888"
                            value={formData.PRICE}
                            onChangeText={text => handleChange('PRICE', text)}
                            keyboardType="numeric"

                        />
                        {errors.PRICE && <Text style={styles.errorText}>{errors.PRICE}</Text>}
                    </View>





                    <View>
                        <Text style={styles.label}>
                            Product Image <Text style={{ color: 'red' }}>*</Text>
                        </Text>

                        <TouchableOpacity
                            style={styles.dobInput}   // same style jaisa date/time field
                            onPress={async () => {
                                try {
                                    const image = await ImageCropPicker.openPicker({
                                        width: 300,  // crop width
                                        height: 300, // crop height
                                        cropping: true,  // ye enable karta hai crop
                                        compressImageQuality: 0.8 // optional, compress karne ke liye
                                    });

                                    handleImageUpload({
                                        uri: image.path,
                                        fileName: image.filename || `product_${Date.now()}.jpg`,
                                        type: image.mime,
                                    });
                                } catch (error) {
                                    console.log('Image picker error:', error);
                                }
                            }}

                        >
                            <Text style={{ color: formData.IMAGE ? 'black' : '#888' }}>
                                {formData.IMAGE ? formData.IMAGE.name : "Select Image"}
                            </Text>
                            <Icon name="image-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* Preview */}
                        {formData.IMAGE && (
                            <Image
                                source={{ uri: formData.IMAGE.uri }}
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

                        {errors.IMAGE && <Text style={styles.errorText}>{errors.IMAGE}</Text>}
                    </View>





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
            </View>
        </>

    )
}


export default CreateProduct

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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
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
})