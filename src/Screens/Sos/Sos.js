import React, { useState, useEffect, useCallback, use } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import SwipeButton from 'rn-swipe-button';
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { Platform, Alert } from "react-native";

const Sos = ({ navigation }) => {
    const [modal, setModal] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [familyOpen, setFamilyOpen] = useState(false);
    const [userValue, setUserValue] = useState();
    const [familyValue, setFamilyValue] = useState();
    const [userItems, setUserItems] = useState([]);
    const [contact, setContact] = useState([]);
    const [userData, setUserData] = useState([]);
    const [committee, setComiittee] = useState([]);
    const [family, setFamily] = useState([]);
    const [familyDetails, setFamilyDetails] = useState([]);

    console.log("uservalue", userValue);
    // Toggle modal function
    const toggleModal = () => {
        setModal(!modal);
    }


    



    useEffect(() => {
        const init = async () => {
            await loadUserDetails();
            Promise.all([fetchUser(), getContact(), getComittee(), fetchFamily()]);
        };
        init();
    }, []);


    


    



    {/* Loading user deatils */ }
    const loadUserDetails = async () => {
        try {
            const userDetails = await AsyncStorage.getItem('userDetails'); // await lagana zaruri hai
            console.log("userDetails raw:", userDetails);

            const parsedUser = userDetails ? JSON.parse(userDetails) : null;
            console.log("parsedUser:", parsedUser);

            setUserData(parsedUser);

        } catch (err) {
            console.error("Error parsing user details:", err);
        }
    };

    console.log("userData", userData);



    // Fetch users from API
    const fetchUser = async () => {
        try {
            const response = await axios.get('http://172.16.16.215:5000/RWA/User/selected');
            const formatted = response.data.map((s) => ({
                label: `${s.first_name} ${s.last_name}`,
                value: s.user_id,
                number: s.number
            }));
            setUserItems(formatted); // Set items once
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    console.log("userItems", userItems);

    const selectedUsers = userItems?.filter((u) => userValue?.includes(u.value));
    console.log("selectedUsers", selectedUsers);



    //getting family data
    const fetchFamily = async () => {
        try {
            const USER_ID = await AsyncStorage.getItem("userId");
            console.log("Fetching family for USER_ID:", USER_ID);
            const response = await axios.get(`http://172.16.16.215:5000/RWA/User/familyDetails?user_id=${USER_ID}`);
            const formatted = response.data.family.map((s) => ({
                label: `${s.first_name} ${s.last_name}`,
                value: s.user_id,

            }));
            setFamily(formatted); // Set items once
        } catch (error) {
            console.error('Error fetching family:', error);
        }
    };


    const selectedFamily = family?.filter((u) => familyValue?.includes(u.value));
    console.log("selectedFamily", selectedFamily);


    //function to send emergency contact list
    const handleSend = async () => {
        const USER_ID = await AsyncStorage.getItem('userId');
        console.log("user id:", USER_ID)
        const data = {
            USER_ID: USER_ID,
            CONTACT_ID: userValue,
            FAMILY_ID: familyValue
        };
        console.log("data", data);
        axios.post('http://172.16.16.215:5000/RWA/Reciepient/create', data)
            .then(response => {
                console.log('Data sent successfully:', response.data);
                toggleModal();
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }

    //getting dta of the emergency contacts
    const getContact = async () => {
        const USER_ID = await AsyncStorage.getItem('userId');
        console.log("user id:", USER_ID)

        const response = await axios.get(`http://172.16.16.215:5000/RWA/Reciepient/all?USER_ID=${USER_ID}`)
            .then(response => {
                console.log('Data sent successfully:', response);
                setContact(response.data?.contact);
                setFamilyDetails(response.data?.family);
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
    }

    //slider image
    const ThumbImage = () => (
        <Image
            source={require('../../assets/images/notification.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain' }}
        />
    );

    //sending sos notifications
    const sendSos = async () => {
        const USER_ID = await AsyncStorage.getItem('userId');
        console.log("user id:", USER_ID)

        const response = await axios.post('http://172.16.16.215:5000/RWA/Sos/create', { USER_ID })
            .then(response => {
                console.log('Sos sent successfully:', response);

            })
            .catch(error => {
                console.error('Error sending sos:', error);
            });
    };


    //getting commiitee member details
    const getComittee = async () => {
        try {
            const response = await axios.get('http://172.16.16.215:5000/RWA/User/committee')
                .then(response => {
                    console.log('Data sent successfully:', response);
                    setComiittee(response.data?.users);
                })
                .catch(error => {
                    console.error('Error sending data:', error);
                })
        } catch (error) {

        }
    }

    // console.log("contact",`http://172.16.16.215:5000/${userData?.image.replace(/\\/g, '/')}`);

    return (
        <>
            <Modal
                animationType="none"
                transparent={true}
                visible={modal}
                onRequestClose={toggleModal}
            >
                <View style={styles.modelOverlay}>
                    <View style={styles.modalBox}>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ededfaff', width: '100%', padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

                            <Text style={styles.modalTitle}>Add Emergency Contacts</Text>
                            <TouchableOpacity onPress={toggleModal}>
                                <Icon name="close" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: 25, }}>
                            <Text style={styles.label}>Select Family Members</Text>

                            <DropDownPicker
                                multiple={true}
                                min={0}
                                open={familyOpen}
                                value={familyValue}
                                items={family}
                                setValue={setFamilyValue}
                                setOpen={setFamilyOpen}
                                setItems={setFamily}
                                placeholder="Select Family..."
                                style={styles.dropdown}
                                dropDownContainerStyle={styles.dropdownBox}
                                zIndex={3000}
                                zIndexInverse={1000}
                                listMode="SCROLLVIEW"

                            />

                            <View style={styles.line} />
                            {selectedFamily?.map((item, index) => (

                                <View key={index} style={styles.selectedItem}>
                                    <Icon name="person-circle" size={35} color="#838398ff" />
                                    <View>
                                        <Text style={{ color: 'black', fontSize: 12 }}>{item.label}</Text>

                                    </View>

                                </View>
                            ))}



                            <Text style={styles.label}>Select Contacts</Text>

                            <DropDownPicker
                                multiple={true}
                                min={0}
                                open={userOpen}
                                value={userValue}
                                items={userItems}
                                setValue={setUserValue}
                                setOpen={setUserOpen}
                                setItems={setUserItems}
                                placeholder="Select Contacts..."
                                style={styles.dropdown}
                                dropDownContainerStyle={styles.dropdownBox}
                                zIndex={3000}
                                zIndexInverse={1000}
                                listMode="SCROLLVIEW"
                                searchable={true}
                                searchContainerStyle={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#ddd',
                                    padding: 10
                                }}
                                searchTextInputStyle={{
                                    borderWidth: 1,
                                    borderColor: '#ccc',
                                    borderRadius: 5,
                                    padding: 8
                                }}
                                 maxHeight={200}

                            />


                            <View style={styles.line} />
                            {selectedUsers?.map((item, index) => (

                                <View key={index} style={styles.selectedItem}>
                                    <Icon name="person-circle" size={35} color="#838398ff" />
                                    <View>
                                        <Text style={{ color: 'black', fontSize: 12 }}>{item.label}</Text>
                                        <Text style={{ color: 'black', fontSize: 12 }}>{item.number}</Text>
                                    </View>

                                </View>
                            ))}

                            <TouchableOpacity style={styles.saveButton} onPress={handleSend}>
                                <Text style={{ color: 'white', fontWeight: '500', fontsize: 20 }}>Save</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>

                        <Text style={styles.titled}>SOS</Text>

                        <TouchableOpacity onPress={toggleModal}>
                            <Icons name="person-add-alt-1" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
                
    

                {/*Commiittee Details Section */}
                <View>
                    <Text style={{ fontSize: 13, color: 'black', fontWeight: 700, paddingHorizontal: 10, paddingVertical: 7 }}>Committee Members:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start' }} >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {committee?.map((item, index) => (
                                <View key={index} style={styles.scrollItem}>
                                    <Image
                                        source={{
                                            uri: item.image ? `http://172.16.16.215:5000/${item.image.replace(/\\/g, '/')}`
                                                : `https://avatar.iran.liara.run/username?username=${item.first_name} ${item.last_name}`
                                        }}
                                        style={{ width: 30, height: 30, borderRadius: 50, alignSelf: 'center', marginBottom: 5 }}
                                    />
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ color: 'black', fontSize: 11, fontWeight: 500 }}>{item.first_name}</Text>
                                        <Text style={{ color: 'black', fontSize: 11, fontWeight: 500 }}>{item.last_name}</Text>
                                    </View>

                                </View>

                            ))}
                        </View>

                    </ScrollView>
                </View>

                <View style={styles.lines} />

                {/*Family Details Section */}

                <View>
                    <Text style={{ fontSize: 13, color: 'black', fontWeight: 700, paddingHorizontal: 10, paddingVertical: 7 }}>Family Members:</Text>
                    {familyDetails.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start' }} >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                {familyDetails?.map((item, index) => (
                                    <View key={index} style={styles.scrollItem}>
                                        <Image
                                            source={{
                                                uri: item.image ? `http://172.16.16.215:5000/${item.image.replace(/\\/g, '/')}`
                                                    : `https://avatar.iran.liara.run/username?username=${item.first_name} ${item.last_name}`
                                            }}
                                            style={{ width: 30, height: 30, borderRadius: 50, alignSelf: 'center', marginBottom: 5 }}
                                        />
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ color: 'black', fontSize: 11, fontWeight: 500 }}>{item.first_name}</Text>
                                            <Text style={{ color: 'black', fontSize: 11, fontWeight: 500 }}>{item.last_name}</Text>
                                        </View>

                                    </View>

                                ))}
                            </View>

                        </ScrollView>
                    ) : (
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 700, paddingHorizontal: 10, paddingVertical: 22, justifyContent: 'center', alignSelf: 'center' }}>No Family Members Added Yet</Text>
                    )}

                </View>

                <View style={styles.lines} />




                {/*Emergency Contact Details Section */}
                <View>
                    <Text style={{ fontSize: 13, color: 'black', fontWeight: 700, paddingHorizontal: 10, paddingVertical: 7 }}>Emergency Contacts:</Text>
                    {contact.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-start' }} >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {contact?.map((item, index) => (
                                    <View key={index} style={styles.scrollItem}>
                                        <Image
                                            source={{
                                                uri: item.image ? `http://172.16.16.215:5000/${item.image.replace(/\\/g, '/')}`
                                                    : `https://avatar.iran.liara.run/username?username=${item.first_name} ${item.last_name}`
                                            }}
                                            style={{ width: 30, height: 30, borderRadius: 50, alignSelf: 'center', marginBottom: 5 }}
                                        />
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ color: 'black', fontSize: 11, fontWeight: 500 }}>{item.first_name}</Text>
                                            <Text style={{ color: 'black', fontSize: 11, fontWeight: 500 }}>{item.last_name}</Text>
                                        </View>

                                    </View>

                                ))}
                            </View>

                        </ScrollView>
                    ) : (
                        <Text style={{ fontSize: 15, color: 'black', fontWeight: 700, paddingHorizontal: 10, paddingVertical: 22, justifyContent: 'center', alignSelf: 'center' }}>No Emergency Contacts Added Yet</Text>
                    )}

                </View>

                <TouchableOpacity>
                    <LottieView
                        source={require('../../assets/Lotties/sos.json')}
                        autoPlay
                        loop
                        style={{ width: 180, height: 180, alignSelf: 'center' }}
                    />
                </TouchableOpacity>

                <View>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '500',
                            color: 'red',
                            textAlign: 'center',
                            marginTop: 20,
                            width: '90%',
                            alignSelf: 'center',
                        }}
                    >
                        Press SOS to instantly alert your emergency contacts.
                    </Text>
                </View>

                <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
                    <SwipeButton
                        thumbIconBackgroundColor="#f6dfdfff"
                        thumbIconComponent={ThumbImage} // pass the component, NOT JSX
                        railBackgroundColor="#f5a9a9ff"
                        railStyles={{ borderRadius: 30 }}
                        title="Slide to SOS"
                        onSwipeSuccess={async () => {
                            console.log("SOS triggered!");
                            // Call your send function here

                            await sendSos();    // if you want to trigger the SOS alert

                        }}
                        railFillBackgroundColor="#ff1a1a"
                        railFillBorderColor="#ff1a1a"
                    />


                </View>

            </View>
        </>
    );
};

export default Sos;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        backgroundColor: '#ededfaff',
        elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 5,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 50,
        paddingHorizontal: 10,
    },
    titled: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center' },
    modelOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 20,
        // padding: 20,
        // paddingTop: 25,

        paddingBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        position: 'relative',
    },
    closeIcon: { position: 'absolute', top: 2, right: 2, zIndex: 1 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '600', color: '#444', marginTop: 10, marginBottom: 8 },
    dropdown: { borderColor: '#ccc', borderRadius: 12, backgroundColor: '#fff' },
    dropdownBox: { borderColor: '#ccc', backgroundColor: '#fff' },
    selectedItem: {

        // marginTop: 10,
        // marginBottom: 10,
        color: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 5,
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginVertical: 3,
        backgroundColor: '#ededfaff'
    },
    selectedLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#090707ff',
        marginLeft: 10
    },
    saveButton: {
        backgroundColor: '#7575a1ff',
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        alignItems: 'center',
        width: '50%',
        alignSelf: 'center'
    },
    line: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 10,
        marginTop: 20
    },
    lines: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 5,

    },
    scrollItem: {
        marginLeft: 10,
        marginRight: 5
    }

});