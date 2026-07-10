import React, { use, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';
import ImageCropPicker from 'react-native-image-crop-picker';


const UserEvents = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]); // max 4 images
    const toast = useToast();

    useEffect(() => {
        fetchEvents();
        console.log("Events:", events);
    }, [])

    const fetchEvents = async () => {
        const userId = await AsyncStorage.getItem('userId');
        console.log("User ID:", userId);

        if (!userId) {
            console.warn("No user ID found in AsyncStorage");
            return;
        }

        try {
            const res = await axios.get("http://172.16.16.215:5000/RWA/Event/eventByUser", {
                params: { userId } // must match backend query param name
            });

            if (res.status === 200) {
                setEvents(res.data);
                console.log("Events:", res.data);
            } else {
                console.warn("Failed to fetch events, status:", res.status);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }

    const handleEventPress = (event) => {

         if (event.EVENT_GALLERY.length > 0) {
         toast.show("Event Gallery already added for this event", {
                type: "error",
                placement: "top",
                duration: 2500,
                animationType: "zoom-in",
                style: {
                    backgroundColor: '#f5d3d0ff',
                    borderRadius: 10,
                    padding: 12,
                    borderColor: '#d65b5bff',
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
        return; // modal open hi na ho
    }
        setSelectedEvent(event);
        setEventModalVisible(true);
    }

    const pickImages = async () => {
        if (selectedImages.length >= 4) {
            toast.show("You can select a maximum of 4 images", {
                type: "error",
                placement: "top",
                duration: 2500,
                animationType: "zoom-in",
                style: {
                    backgroundColor: '#f5d3d0ff',
                    borderRadius: 10,
                    padding: 12,
                    borderColor: '#d65b5bff',
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
            return;
        }
        try {
            const images = await ImageCropPicker.openPicker({
                multiple: true,
                width: 400,  // crop width
                height: 300, // crop height
                cropping: true,  // ye enable karta hai crop
                maxFiles: 4 - selectedImages.length, // allow only remaining
                compressImageQuality: 0.8,
                mediaType: 'photo',
                forceJpg: true,
            });

            // Check each file size (in bytes)
            const tooLarge = images.some(img => img.size > 1 * 1024 * 1024);
            if (tooLarge) {
                toast.show("Each image must be <= 1MB", { type: 'danger' });
                return;
            }

            // Map images
            const mapped = images.map(img => ({
                uri: img.path,
                fileName: img.filename || `event_${Date.now()}.jpg`,
                type: img.mime
            }));

            setSelectedImages(prev => [...prev, ...mapped].slice(0, 4)); // max 4 images total
        } catch (err) {
            if (err.message !== 'User cancelled image selection') {
                toast.show("Error selecting images", { type: 'danger' });
                console.error(err);
            }
        }
    };

    const uploadGallery = async () => {
        if (selectedImages.length === 0) {
            toast.show("Please select at least one image", { type: 'warning' });
            return;
        }

        const formData = new FormData();
        selectedImages.forEach(img => {
            formData.append('gallery', {
                uri: img.uri,
                name: img.fileName,
                type: img.type
            });
        });

        try {
            const EVENT_ID = selectedEvent.EVENT_ID; // modal me selected event
            const res = await axios.put(`http://172.16.16.215:5000/RWA/Event/addGallery/${EVENT_ID}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.status === 200) {
                toast.show("Gallery updated successfully", { type: 'success' });
                setSelectedImages([]); // reset selection
                setEventModalVisible(false);
                fetchEvents(); // refresh events if needed
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Upload failed";
            toast.show(msg, { type: 'danger' });
        }
    };
    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };



    return (
        <>
            <Modal
                visible={eventModalVisible}
                onRequestClose={() => setEventModalVisible(false)}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedEvent?.EVENT_TITLE}</Text>

                        {!selectedImages.length && (
                            <Text style={{ textAlign: 'center', color: 'black', padding: 10, marginBottom: 10, fontSize: 14 }}>Add images to your event gallery</Text>
                        )}

                        {/* Selected images preview */}
                        {selectedImages.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10, padding: 10 }}>
                                {selectedImages.map((img, index) => (
                                    <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                                        <Image
                                            source={{ uri: img.uri }}
                                            style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' }}
                                        />
                                        {/* Delete button */}
                                        <TouchableOpacity
                                            onPress={() => removeImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: -5,
                                                right: -5,
                                                backgroundColor: '#60498fff',
                                                width: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                zIndex: 10,
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}




                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>


                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden' }}>
                                <TouchableOpacity onPress={pickImages}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 10, borderRadius: 10 }}
                                    >
                                        <Text style={styles.closeButtonText}>Choose Images</Text>
                                    </LinearGradient>

                                </TouchableOpacity>
                            </View>


                            <View style={{ borderRadius: 10, alignSelf: 'center', overflow: 'hidden' }}>
                                <TouchableOpacity onPress={uploadGallery}>
                                    <LinearGradient
                                        useAngle={true} angle={170} angleCenter={{ x: 0.5, y: 0.5 }}
                                        colors={['#ceceddff', '#60498fff', '#441678ff']}   // left dark → right light
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ padding: 10, borderRadius: 10 }}
                                    >
                                        <Text style={styles.closeButtonText}>Add</Text>
                                    </LinearGradient>

                                </TouchableOpacity>
                            </View>


                        </View>
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
                        <Text style={styles.titled}>Your Events</Text>
                    </View>
                </LinearGradient>
                {events.length === 0 ? (
                    <Text style={styles.noData}>You have created no events</Text>
                ) : (
                    <>

                        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} style={{ padding: 10, marginTop: '7%' }}
                            contentContainerStyle={styles.scrollContent}

                        >
                            {events.map((events, index) => (
                                <TouchableOpacity onPress={() => handleEventPress(events)} key={index} style={styles.card}>
                                    {/* Title Section */}
                                    <View style={styles.topRoww}>
                                        <View style={styles.leftTop}>
                                            <Icon name="calendar" size={20} color="#555" />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={styles.title}>{events.EVENT_TITLE}</Text>
                                                <Text style={styles.subtitle}>{events.VENUE}</Text>
                                            </View>
                                        </View>

                                        <View>
                                            <View style={{ alignItems: 'flex-start' }}>
                                                {events.STATUS == '1' ? (
                                                    <View style={{ backgroundColor: '#d4edda', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                                                        <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 10 }}>Approved</Text>
                                                    </View>
                                                ) : events.STATUS == '0' ? (
                                                    <View style={{ backgroundColor: '#fff3cd', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                                                        <Text style={{ color: '#856404', fontWeight: 'bold', fontSize: 10 }}>Pending</Text>
                                                    </View>
                                                ) : (
                                                    <View style={{ backgroundColor: '#f8d7da', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                                                        <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 10 }}>Rejected</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View>
                                                <Text></Text>
                                            </View>
                                        </View>





                                    </View>

                                </TouchableOpacity>
                            ))}




                        </ScrollView>
                    </>

                )}

                {/* Create Service Button */}
                <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('CreateEvent')}>
                    <Icon name="add" size={28} color="black" />
                </TouchableOpacity>
            </View>
        </>


    );
};

export default UserEvents;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f8fc',

    },
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

    noData: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#777',
    },
    scrollContent: {
        paddingBottom: 20,
    },

    floatingButton: {
        position: 'absolute',
        bottom: 60,
        right: 20,
        backgroundColor: 'white',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },

    titled: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 3
    },
    statusImage: {
        width: 100,
        height: 50,
    },

    topRoww: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: "#333"
    },
    subtitle: {
        fontSize: 13,
        color: "#333"
    },
    divider: {
        backgroundColor: "#eee",
        height: 1,
        marginVertical: 10
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    avatarGroup: {
        flexDirection: 'row'
    },
    avatar: {
        height: 30,
        width: 30,
        borderRadius: 20,
        borderColor: "#fff",
        borderWidth: 1
    },
    people: {
        fontSize: 13,
        color: '#444'
    },
    leftTop: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#555',
        alignSelf: 'center'
    },
    modalDescription: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
    },
    modalDescriptionTitle: {
        fontSize: 16,
        color: '#555',
        // marginBottom: 20,
        fontWeight: 'bold',

    },
    closeButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center'
    }


});
