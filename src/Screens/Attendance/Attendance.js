import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, ActivityIndicator, AppState, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import Geofencing from '@rn-bridge/react-native-geofencing';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import Iconn from 'react-native-vector-icons/Feather';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';




const OFFICE_API = 'http://172.16.16.215:5000/RWA/Office/all';
const LOGIN_API = 'http://172.16.16.215:5000/RWA/Attendance/login';
const LOGOUT_API = 'http://172.16.16.215:5000/RWA/Attendance/logout';

const Attendance = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [office, setOffice] = useState(null);
    const [canClockIn, setCanClockIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [markedDates, setMarkedDates] = useState({});
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockInTime, setClockInTime] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateColor, setSelectedDateColor] = useState(null);
    const [selectedDayInfo, setSelectedDayInfo] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);




    {/* Toast for notifications */ }
    const toast = useToast();


    {/*Fetching data*/ }
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchOffice(),
                    fetchFullAttendanceHistory(),
                    checkPermissions() // this includes getCurrentPosition
                ]);
            } catch (err) {
                Alert.alert('Error during', err.message);
            } finally {
                setLoading(false);
            }
        };

        init();

        const appStateListener = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                getCurrentPosition();
                checkTodayStatus();
            }
        });

        const interval = setInterval(() => {
            getCurrentPosition();
        }, 2 * 60 * 1000);

        return () => {
            appStateListener.remove();
            clearInterval(interval);
        };
    }, []);


    useFocusEffect(
        useCallback(() => {
            getCurrentPosition();
            checkTodayStatus();
        }, [])
    );


    {/* Refresh control for pull-to-refresh */ }
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFullAttendanceHistory();
        await getCurrentPosition();
        checkTodayStatus();
        setRefreshing(false);
    };



    {/* Fetch full attendance history */ }
    const fetchFullAttendanceHistory = async (dateToCheck = null) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const res = await axios.get(`http://172.16.16.215:5000/RWA/Attendance/history/${userId}`);
            const history = res.data;
            setAttendanceHistory(history);

            const newMarkedDates = {};
            history.forEach((record) => {
                const formattedDate = new Date(record.DATE).toISOString().split('T')[0];
                const isAbsent = record.IN_TIME === null && record.OUT_TIME === null;

                newMarkedDates[formattedDate] = {
                    customStyles: {
                        container: {
                            backgroundColor: isAbsent ? '#ea5555ff' : 'green',
                            borderRadius: 20,
                        },
                        text: {
                            color: 'white',
                            fontWeight: 'bold',
                        },
                    },
                };
            });

            setMarkedDates(newMarkedDates);

            //  Only check selected day info if dateToCheck is passed
            if (dateToCheck) {
                const record = history.find(entry => entry.DATE === dateToCheck);
                if (record) {
                    setSelectedDayInfo({
                        inTime: record.IN_TIME,
                        outTime: record.OUT_TIME,
                    });
                } else {
                    setSelectedDayInfo(null);
                }
            }

        } catch (err) {
            Alert.alert('Error', 'Unable to fetch full attendance history');
        }
    };



    {/* Handle date selection and update selectedDayInfo */ }
    const handleDatePress = (dateStr) => {
        setSelectedDate(dateStr);

        console.log('Selected Date:', dateStr);

        const record = attendanceHistory.find(
            (entry) => entry.DATE === dateStr
        );


        if (record) {
            setSelectedDayInfo({
                inTime: record.IN_TIME,
                outTime: record.OUT_TIME,

            });
            console.log('Selected Day Info:', record);
        } else {
            setSelectedDayInfo(null);
        }


    };



    {/* Check today's clock-in status */ }
    const checkTodayStatus = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const res = await axios.get(`http://172.16.16.215:5000/RWA/Attendance/status/${userId}`);
            console.log('Status Response:', res.data);


            if (res.data.isClockedIn) {
                setIsClockedIn(true);
                setClockInTime(new Date(res.data.clockInTime).toLocaleTimeString());
            } else {
                setIsClockedIn(false);
            }
        } catch (err) {
            console.error('Failed to fetch clock status', err.message);
        }
    };






    {/* Fetch office data and set geofence */ }
    const fetchOffice = async () => {
        try {
            const res = await axios.get(OFFICE_API);
            const officeData = res.data.find((o) => o.FLAG === 1);
            console.log('Office Data:', officeData);
            setOffice(officeData);

            if (officeData) {
                {/* Add geofence */ }
                await Geofencing.addGeofence({
                    id: officeData.OFFICE_ID || 'default-id',
                    latitude: officeData.LAT,
                    longitude: officeData.LONG,
                    radius: 100,
                });
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch office data');
        }
    };

    {/* Check location permissions */ }
    const checkPermissions = async () => {
        try {
            await Geofencing.requestLocation({ allowAlways: true });
            const status = await Geofencing.getLocationAuthorizationStatus();
            if (status === 'Always') {
                getCurrentPosition();
            } else {


                toast.show("⚠️ Location permission required", {
                    type: "custom",
                    placement: "top",
                    duration: 2000,
                    offset: 30,
                    animationType: "zoom-in",
                    style: {
                        backgroundColor: '#f5fcbbff',
                        borderRadius: 12,
                        padding: 12,
                        borderColor: '#dff805ff',
                        borderWidth: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5
                    },
                    textStyle: {
                        color: '#4a0000',
                        fontSize: 14,
                        fontWeight: '500'
                    }
                });

                setLoading(false);
            }
        } catch (err) {
            Alert.alert('Error', err.message);
            setLoading(false);
        }
    };

    {/* Get current location */ }
    const getCurrentPosition = async () => {
        try {
            const pos = await Geofencing.getCurrentLocation();
            console.log('Current Position:', pos);
            setLocation(pos);
            checkDistance(pos);
        } catch (err) {

            toast.show('❌ Error getting location', {
                type: "danger",
                placement: "top",
                duration: 3000,
                animationType: "slide-in",
                style: {
                    backgroundColor: '#ffe0e0',
                    borderRadius: 10,
                    padding: 12,
                    borderColor: '#ff9c9c',
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                },
                textStyle: {
                    color: '#4a0000',
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            });
        } finally {
            setLoading(false);
        }
    };


    {/* Check distance from office */ }
    const checkDistance = (pos) => {
        if (!office) return;
        const R = 6371e3;
        const dLat = (office.LAT - pos.latitude) * (Math.PI / 180);
        const dLon = (office.LONG - pos.longitude) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(pos.latitude * Math.PI / 180) *
            Math.cos(office.LAT * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        console.log("Distance from office:", distance, "meters");
        console.log("Your Location:", pos.latitude, pos.longitude);
        console.log("Office Location:", office.LAT, office.LONG);
        setCanClockIn(distance <= 100);
    };


    {/* Handle clock-in function  */ }
    const handleClockIn = async () => {
        if (!selectedDate) {
            toast.show("⚠️ Please select a date before clocking in.", {
                type: "custom",
                placement: "top",
                duration: 2000,
                offset: 30,
                animationType: "zoom-in",
                style: {
                    backgroundColor: '#f5fcbbff',
                    borderRadius: 12,
                    padding: 12,
                    borderColor: '#dff805ff',
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                },
                textStyle: {
                    color: '#4a0000',
                    fontSize: 14,
                    fontWeight: '500'
                }
            });
            return;
        }

        try {
            if (!location) {
                toast.show("⚠️ Location not available.", {
                    type: "custom",
                    placement: "top",
                    duration: 2000,
                    offset: 30,
                    animationType: "zoom-in",
                    style: {
                        backgroundColor: '#f5fcbbff',
                        borderRadius: 12,
                        padding: 12,
                        borderColor: '#dff805ff',
                        borderWidth: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5
                    },
                    textStyle: {
                        color: '#4a0000',
                        fontSize: 14,
                        fontWeight: '500'
                    }
                });
                return;
            }

            const userId = await AsyncStorage.getItem('userId');
            const inLocation = [location.latitude, location.longitude];
            console.log('Sending Clock-In Request:', {
                USER_ID: userId,
                OFFICE_ID: office?.OFFICE_ID,
                IN_LOCATION: inLocation,
                DATE: selectedDate
            });
            const res = await axios.post(LOGIN_API, {
                USER_ID: userId,
                OFFICE_ID: office?.OFFICE_ID,
                IN_LOCATION: inLocation,
                DATE: selectedDate || new Date().toISOString().split('T')[0],
            });
            setIsClockedIn(true);
            setClockInTime(new Date().toLocaleTimeString());
            updateMarkedDates(true);
            await fetchFullAttendanceHistory(selectedDate);



            toast.show("✅ Clock In Successful!", {
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
        } catch (err) {

            toast.show(`❌ ${err.response?.data?.message || err.message}`, {
                type: "danger",
                placement: "top",
                duration: 3000,
                animationType: "slide-in",
                style: {
                    backgroundColor: '#ffe0e0',
                    borderRadius: 10,
                    padding: 12,
                    borderColor: '#ff9c9c',
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                },
                textStyle: {
                    color: '#4a0000',
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            });


        }
    };


    {/* Handle clock-out function */ }
    const handleClockOut = async () => {
        if (!selectedDate) {

            toast.show("⚠️ Please select a date before clocking out.", {
                type: "custom",
                placement: "top",
                duration: 2000,
                offset: 30,
                animationType: "zoom-in",
                style: {
                    backgroundColor: '#f5fcbbff',
                    borderRadius: 12,
                    padding: 12,
                    borderColor: '#dff805ff',
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                },
                textStyle: {
                    color: '#4a0000',
                    fontSize: 14,
                    fontWeight: '500'
                }
            });

            return;
        }

        try {
            const userId = await AsyncStorage.getItem('userId');
            const outLocation = [location.latitude, location.longitude];
            const res = await axios.post(LOGOUT_API, {
                USER_ID: userId,
                OUT_LOCATION: outLocation,
                DATE: selectedDate || new Date().toISOString().split('T')[0],
            });
            setIsClockedIn(false);
            await fetchFullAttendanceHistory(selectedDate);

            toast.show("✅ Clock Out Successful!", {
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
        } catch (err) {


            toast.show(`❌ Clock Out Failed: ${err.response?.data?.message || err.message}`, {
                type: "danger",
                placement: "top",
                duration: 3000,
                animationType: "slide-in",
                style: {
                    backgroundColor: '#ffe0e0',
                    borderRadius: 10,
                    padding: 12,
                    borderColor: '#ff9c9c',
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                },
                textStyle: {
                    color: '#4a0000',
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            });
        }
    };


    {/* Update marked dates for calendar */ }
    const updateMarkedDates = (present) => {
        const today = new Date().toISOString().split('T')[0];
        setMarkedDates((prev) => ({
            ...prev,
            [today]: { selected: true, marked: true, selectedColor: present ? 'green' : 'red' },
        }));
    };


    {/* Render loading indicator */ }
    if (loading) {
        return (
            <View style={styles.loader}><ActivityIndicator size="large" color="#0000ff" /></View>
        );
    }

    return (
        <>
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                        <Icon name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.titled}>Attendance</Text>

                </View>
            </View>
            <ScrollView style={styles.container} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>

                <Calendar markedDates={markedDates} markingType="custom" onDayPress={(day) => handleDatePress(day.dateString)}
                    style={{

                        borderRadius: 10,
                        // elevation: 2,
                        transform: [{ scale: 0.9 }], //  Shrinks the whole calendar
                    }}

                />
                {/* <Text style={styles.shift}>Shift Timing : 8:30 AM to 8:30 PM</Text> */}

                <View style={{ flexDirection: 'row', marginTop: 1, paddingLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                        <View style={{ width: 15, height: 15, backgroundColor: 'green', borderRadius: 5, marginRight: 5 }} />
                        <Text style={{ color: 'black' }}>Present</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                        <View style={{ width: 15, height: 15, backgroundColor: '#ea5555ff', borderRadius: 5, marginRight: 5 }} />
                        <Text style={{ color: 'black' }}>Absent</Text>
                    </View>
                </View>





                {canClockIn && !isClockedIn && (
                    <TouchableOpacity onPress={handleClockIn} style={styles.button}>
                        <LottieView
                            source={require('../../assets/Lotties/clock.json')}
                            autoPlay
                            loop
                            style={{ width: 40, height: 40, alignSelf: 'center' }}
                        />
                        <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>Clock In</Text>
                    </TouchableOpacity>
                )}





                {isClockedIn && (

                    <TouchableOpacity onPress={handleClockOut} style={styles.button}>
                        <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>Clock Out</Text>
                        <LottieView
                            source={require('../../assets/Lotties/clock.json')}
                            autoPlay
                            loop
                            style={{ width: 40, height: 40, alignSelf: 'center' }}
                        />
                    </TouchableOpacity>


                )}

                {selectedDate && (
                    <View style={{ alignItems: 'center' }}>


                        {selectedDayInfo ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 }}>
                                <View style={styles.clockedSection}>
                                    <Iconn name="sun" size={16} color="yellow" style={{ alignSelf: 'center', marginBottom: 5 }} />
                                    <Text style={{ color: 'black', fontSize: 11, alignSelf: 'center', fontWeight: 'bold' }}>Clock In: {selectedDayInfo.inTime}</Text>
                                </View>
                                <View style={styles.clockedSection}>
                                    <Iconn name="moon" size={16} color="white" style={{ alignSelf: 'center', marginBottom: 5 }} />
                                    <Text style={{ color: 'black', fontSize: 11, alignSelf: 'center', fontWeight: 'bold' }}>Clock Out: {selectedDayInfo.outTime || ""}</Text>
                                </View>

                            </View>
                        ) : ""}

                    </View>
                )}

                <LottieView
                    source={require('../../assets/Lotties/calendar.json')}
                    autoPlay
                    loop
                    style={{ width: '100%', height: 200, alignSelf: 'center' }}
                />

            </ScrollView>
        </>

    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#f4f4f4', flex: 1 },
    heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
    shift: { fontSize: 16, textAlign: 'center', marginVertical: 10, color: 'green' },
    clockedInSection: { marginTop: 20, alignItems: 'center' },
    clockedInTime: { marginTop: 10, fontSize: 16 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        backgroundColor: '#ededfaff',
        elevation: 3,
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
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e5e5faff',
        // padding: 5,
        borderRadius: 15,
        marginTop: 20,
        width: '40%',
        gap: 8,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#acacb0ff',
        marginBottom: 15,
    },
    clockedSection: {
        backgroundColor: '#c4c4f1ff',
        padding: 8,
        borderRadius: 15,
        width: '40%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#acacb0ff',
    },
    noButton: {
        backgroundColor: '#f5c5c5ff',
        padding: 12,
        borderRadius: 15,
        marginTop: 20,
        width: '50%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#acacb0ff',
        alignItems: 'center',
    },
});

export default Attendance;