import { StyleSheet, Text, TouchableOpacity, View, Alert, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import { useToast } from 'react-native-toast-notifications';
import Geofencing from '@rn-bridge/react-native-geofencing';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';

const CheckPoint = ({ navigation, route }) => {
    const { checkpoint } = route.params; // yaha se data aayega
    const [location, setLocation] = useState(null);
    const [canClockIn, setCanClockIn] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useToast();

    useEffect(() => {
        checkPermissions();
        status();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        status();
        getCurrentPosition();
        setRefreshing(false);
    };

    //  Location permission check
    const checkPermissions = async () => {
        try {
            await Geofencing.requestLocation({ allowAlways: true });
            const status = await Geofencing.getLocationAuthorizationStatus();
            if (status === 'Always') {
                getCurrentPosition();
                // Add geofence
                await Geofencing.addGeofence({
                    id: checkpoint.CHECKPOINT_ID,
                    latitude: checkpoint.LAT,
                    longitude: checkpoint.LONG,
                    radius: 100,
                });
            } else {
                toast.show("⚠️ Location permission required", { type: "danger" });
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    //  Current location
    const getCurrentPosition = async () => {
        try {
            const pos = await Geofencing.getCurrentLocation();
            console.log("Current Location:", pos);
            setLocation(pos);
            checkDistance(pos);
        } catch (err) {
            toast.show("❌ Error getting location", { type: "danger" });
        }
    };


    const checkTimeWindow = () => {
        if (!checkpoint?.TIME) return false;

        console.log("Raw checkpoint.TIME:", checkpoint.TIME);

        // Parse checkpoint time directly in local timezone (IST)
        const checkpointDate = new Date(checkpoint.TIME);

        // Extract local hours/minutes/seconds
        const hours = checkpointDate.getHours();
        const minutes = checkpointDate.getMinutes();
        const seconds = checkpointDate.getSeconds();

        const now = new Date();

        // Today’s date + checkpoint time (local)
        const checkpointTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            seconds
        );

        // Allowed window: checkpoint time → +35 minutes
        const startTime = checkpointTime;
        const endTime = new Date(checkpointTime.getTime() + 35 * 60000);

        console.log("Checkpoint Time:", checkpointTime.toLocaleString());
        console.log(
            "Allowed Window:",
            startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
            "to",
            endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
        );

        return now >= startTime && now <= endTime;
    };





    //  Distance check (checkpoint ke sath compare)
    const checkDistance = (pos) => {
        if (!checkpoint) return;

        const R = 6371e3;
        const dLat = (checkpoint.LAT - pos.latitude) * (Math.PI / 180);
        const dLon = (checkpoint.LONG - pos.longitude) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(pos.latitude * Math.PI / 180) *
            Math.cos(checkpoint.LAT * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        console.log("Distance from checkpoint:", distance, "meters");
        const withinTime = checkTimeWindow();
        console.log("Within time window:", withinTime);
        setCanClockIn(distance <= 100 && withinTime);
    };

    const handleClockIn = async () => {
        console.log("Clocking in at checkpoint:");
        const userId = await AsyncStorage.getItem('userId');
        const payload = {
            USER_ID: userId,
            CHECKPOINT_ID: checkpoint.CHECKPOINT_ID,
        }
        console.log("Clock In Payload:", payload);
        try {
            const res = await axios.post('http://172.16.16.215:5000/RWA/CheckpointTransaction/create', payload);
            console.log("Clock In Response:", res.data);
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
            await status(); // update today's status
        } catch (err) {
            console.error("Clock In Error:", err);
            toast.show("❌ Clock In Error", { type: "danger" });
        }
    };

    const status = async () => {
        const userId = await AsyncStorage.getItem('userId');
        const res = await axios.post('http://172.16.16.215:5000/RWA/CheckpointTransaction/check', {
            USER_ID: userId,
            CHECKPOINT_ID: checkpoint.CHECKPOINT_ID
        });
        if (res.status === 200) {
            console.log("Status:", res.data);
            setTodayStatus(res.data);

        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                        <Icon name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.titled}>Checkpoint</Text>
                </View>
            </View>

            {/* Show checkpoint details */}
            <ScrollView style={{ padding: 20, marginTop: '20%' }} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} >

                <View style={styles.card}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.value}>Block Number:{"  "}
                            <Text style={styles.label}>{checkpoint.BLOCK_NO}</Text>
                        </Text>

                    </View>
                    <View style={styles.iconBox}>
                        <Icons name="warehouse" size={22} color="white" />
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.value}>Address:{"  "}
                            <Text style={styles.label}>{checkpoint.CHECKPOINT_ADDRESS}</Text>
                        </Text>

                    </View>
                    <View style={styles.iconBox}>
                        <Icon name="location" size={22} color="white" />
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.value}>Timing: {"  "}
                            <Text style={styles.label}>
                                {new Date(checkpoint.TIME).toLocaleTimeString()}
                            </Text>
                        </Text>

                    </View>
                    <View style={styles.iconBox}>
                        <Icons name="clock" size={22} color="white" />
                    </View>
                </View>


                {/* 
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    {todayStatus?.status ? (
                        <Text style={{ color: "green", fontWeight: "bold", fontSize: 16 }}>
                            ✅ Already clocked in for today
                        </Text>
                    ) : canClockIn ? (
                        <TouchableOpacity
                            onPress={handleClockIn}
                            style={{
                                backgroundColor: '#89788a',
                                paddingVertical: 12,
                                paddingHorizontal: 25,
                                borderRadius: 8,
                                marginTop: 10,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 5,
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                                Clock In
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={{ color: "red", fontWeight: "600", fontSize: 15 }}>
                            ❌ Outside checkpoint or Time expired
                        </Text>
                    )}
                </View> */}

                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    {(() => {
                        if (todayStatus?.status) {
                            return (
                                <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }}>
                                    ✅ Already clocked in for today
                                </Text>
                            );
                        } else if (canClockIn) {
                            return (
                                <TouchableOpacity
                                    onPress={handleClockIn}
                                    style={{
                                        backgroundColor: '#89788a',
                                        paddingVertical: 12,
                                        paddingHorizontal: 25,
                                        borderRadius: 8,
                                        marginTop: 10,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        elevation: 5,
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                                        Clock In
                                    </Text>
                                </TouchableOpacity>
                            );
                        } else {
                            return (
                                <Text style={{ color: 'red', fontWeight: '600', fontSize: 15 }}>
                                    ❌ Outside checkpoint or Time expired
                                </Text>
                            );
                        }
                    })()}
                </View>


            </ScrollView>
        </View>
    );
};

export default CheckPoint;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
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
    backIcon: { position: 'absolute', left: 16, zIndex: 1 },
    titled: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center' },
    detail: { fontSize: 16, marginVertical: 5, color: 'black' },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
        fontWeight: '600',
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        color: 'black',

    },
    iconBox: {
        backgroundColor: '#89788a',
        padding: 12,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    card: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 22,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 100,

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,

        // Android shadow
        elevation: 15,
    },


});
