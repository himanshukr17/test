
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


const QrScanVehicle = ({ navigation }) => {

    const device = useCameraDevice('back');
    const isFocused = useIsFocused();

    const [hasPermission, setHasPermission] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);


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

    const handleRescan = () => {
        setScannedData(null);
        setIsScanning(true);
    };


    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned,
    });

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

                                <TouchableOpacity style={styles.modalButton2} onPress={handleRescan}>
                                    <Text style={{ color: 'white' }}>Rescan</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </Modal>
            )}


        </View>
    );
};

export default QrScanVehicle;

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
        backgroundColor: '#28a745',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    modalButton2: {
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
        width: 80
    },
    header: {
        backgroundColor: '#fff',
        height: 60,
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
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