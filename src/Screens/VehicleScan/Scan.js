
import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, Alert, Dimensions, Vibration,
    TouchableOpacity, ActivityIndicator, AppState,
    Modal
} from 'react-native';
import { useCameraDevice, Camera, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';



const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;


const Scan = ({ navigation }) => {

    const device = useCameraDevice('back');
    const isFocused = useIsFocused();

    const [hasPermission, setHasPermission] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("success"); // "success" ya "error"


    const [modalVisible, setModalVisible] = useState(false);

    //getting the scanned data
    useEffect(() => {
        console.log(scannedData)
        const getPermission = async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        };

        getPermission();

        const appStateListener = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                getPermission();
                if (!isScanning) {
                    setIsScanning(true);
                    setScannedData(null);
                }
            }
        });

        return () => {
            appStateListener.remove();
        };
    }, []);


    //scanning
    const onCodeScanned = useCallback(async (codes) => {
        if (isScanning && codes.length > 0) {
            const rawData = codes[0].value;
            console.log("Scanned QR:", rawData);

            try {
                setLoading(true);
                const parsed = JSON.parse(rawData);

                setScannedData(parsed);
                setIsScanning(false);
                setLoading(false);
                setModalVisible(true);
                Vibration.vibrate(200);


            } catch (err) {
                console.error("Error parsing or fetching:", err);
                setLoading(false);

            }
        }
    }, [isScanning]);

    const InTime = async () => {
        if (!scannedData) return;

        try {
            setLoading(true);

            const payload = {
                USER_ID: scannedData.user_id,
                VEHICLE_NO: scannedData.vehicle,
                IN_TIME: new Date()
            };

            await axios.post(
                "http://172.16.16.215:5000/RWA/VehicleScan/scan",
                payload
            );

            setLoading(false);
            setModalVisible(false);

            setStatusMessage("IN Time recorded successfully");
            setStatusType("success");
            setStatusModalVisible(true);

            handleRescan();

        } catch (error) {
            setLoading(false);

            const message = error.response?.data?.message || "Failed to record IN Time";
            setStatusMessage(message);
            setStatusType("error");
            setStatusModalVisible(true);

            console.error("Error recording In Time:", error.response?.data || error);
        }
    };


    const OutTime = async () => {
        if (!scannedData) return;

        try {
            setLoading(true);

            const payload = {
                USER_ID: scannedData.user_id,
                VEHICLE_NO: scannedData.vehicle,
                OUT_TIME: new Date()
            };

            await axios.post(
                "http://172.16.16.215:5000/RWA/VehicleScan/scan",
                payload
            );

            setLoading(false);
            setModalVisible(false);

            setStatusMessage("OUT Time recorded successfully");
            setStatusType("success");
            setStatusModalVisible(true);

            handleRescan();

        } catch (error) {
            setLoading(false);

            const message = error.response?.data?.message || "Failed to record OUT Time";
            setStatusMessage(message);
            setStatusType("error");
            setStatusModalVisible(true);

            console.error("Error recording OUT Time:", error.response?.data || error);
        }
    };



    //rescanning
    const handleRescan = () => {
        setScannedData(null);
        setIsScanning(true);
    };

    //camera
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned,
    });

    //permission
    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No camera access. Enable it in settings.</Text>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No camera device found.</Text>
            </View>
        );
    }



    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={statusModalVisible}
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.4)'
                }}>
                    <View style={{
                        width: '80%',
                        padding: 20,
                        borderRadius: 15,
                        backgroundColor: statusType === 'success' ? '#28a745' : '#dc3545'
                    }}>
                        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                            {statusMessage}
                        </Text>
                        <TouchableOpacity
                            style={{
                                marginTop: 15,
                                alignSelf: 'center',
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                backgroundColor: 'white',
                                borderRadius: 10
                            }}
                            onPress={() => setStatusModalVisible(false)}
                        >
                            <Text style={{ color: statusType === 'success' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.topRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                            <Icon name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.titled}>Vehicle Scan</Text>
                    </View>
                </View>
                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={{ marginTop: 10, color: 'black' }}>Processing...</Text>
                    </View>
                ) : !scannedData ? (
                    <>
                        <Camera
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={isFocused && hasPermission && isScanning}
                            codeScanner={codeScanner}
                            photo={false}
                            video={false}
                        />
                        <View style={styles.overlay}>
                            <View style={styles.scanAreaBorder} />
                            <Text style={styles.instructionText}>Point camera at QR code</Text>
                        </View>
                    </>
                ) : (
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalBox}>
                                <Text style={styles.modalTitle}>Vehicle Details</Text>
                                <Text style={styles.modalTitlee}><Text style={{ fontWeight: 'bold' }}> Vehicle Number:</Text>{scannedData.vehicle}</Text>
                                <Text style={styles.modalTitlee}><Text style={{ fontWeight: 'bold' }}> Brand:</Text>{scannedData.brand}</Text>
                                <Text style={styles.modalTitlee}><Text style={{ fontWeight: 'bold' }}> Model:</Text>{scannedData.model}</Text>
                                <Text style={styles.modalTitlee}><Text style={{ fontWeight: 'bold' }}> Name:</Text>{scannedData.name}</Text>
                                <Text style={styles.modalTitlee}><Text style={{ fontWeight: 'bold' }}> Flat</Text>{scannedData.flat}{"-"}{scannedData.floor}</Text>


                                <View style={{ flexDirection: "row", justifyContent: 'space-evenly' }}>
                                    <TouchableOpacity style={styles.modalButton1} onPress={InTime}>
                                        <Text style={{ color: 'white' }}>Vehicle In</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalButton2} onPress={OutTime}>
                                        <Text style={{ color: 'white' }}>Vehicle Out</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.modalButton3} onPress={handleRescan}>
                                    <Text style={{ color: 'black' }}>Rescan</Text>
                                </TouchableOpacity>

                            </View>
                        </View>

                    </Modal>
                )}


            </View>

        </>

    );
};

export default Scan;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    permissionContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f0f0f0', padding: 20
    },
    permissionText: {
        fontSize: 18, color: 'gray', textAlign: 'center', lineHeight: 24,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    scanAreaBorder: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        borderWidth: 3,
        borderColor: '#00f0f0',
        borderRadius: 15,
        backgroundColor: 'transparent',
    },
    instructionText: {
        marginTop: 30,
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    resultBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff'
    },
    dataText: {
        fontSize: 16,
        marginBottom: 10,
        color: 'black',
        textAlign: 'center',
    },
    approveButton: {
        backgroundColor: 'green',
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        width: '60%',
        alignItems: 'center'
    },
    approveText: {
        color: 'white',
        fontWeight: 'bold'
    },
    cancelButton: {
        marginTop: 15,
        padding: 10,
    },
    cancelText: {
        color: 'red',
        fontWeight: 'bold'
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 20,
        padding: 20,
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        position: 'relative',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalTitlee: {
        fontSize: 14,
        // fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalButton1: {
        backgroundColor: '#9ca5e9ff',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    modalButton2: {
        backgroundColor: '#5466efff',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    modalButton3: {
        backgroundColor: '#ededfaff',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80,
        alignSelf: 'center',

    },
    header: {
        backgroundColor: '#fff',
        height: 60,
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ededfaff',
        zIndex: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
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
});